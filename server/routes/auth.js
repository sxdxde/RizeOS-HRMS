const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email and password are required' });
        }

        const existing = await prisma.organization.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ error: 'Organization with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const org = await prisma.organization.create({
            data: { name, email, password: hashedPassword },
        });

        const token = jwt.sign(
            { id: org.id, email: org.email, name: org.name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const { password: _, ...orgData } = org;
        res.status(201).json({ token, org: orgData });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const org = await prisma.organization.findUnique({ where: { email } });
        if (!org) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, org.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: org.id, email: org.email, name: org.name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const { password: _, ...orgData } = org;
        res.json({ token, org: orgData });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;
