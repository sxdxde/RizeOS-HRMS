const express = require('express');
const auth = require('../middleware/auth');
const prisma = require('../lib/prisma');

const router = express.Router();

// GET /api/employees
router.get('/', auth, async (req, res) => {
    try {
        const employees = await prisma.employee.findMany({
            where: { orgId: req.org.id },
            include: {
                _count: { select: { tasks: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(employees);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

// POST /api/employees
router.post('/', auth, async (req, res) => {
    try {
        const { name, email, role, department, skills, walletAddress } = req.body;
        if (!name || !email || !role || !department) {
            return res.status(400).json({ error: 'Name, email, role, and department are required' });
        }

        const employee = await prisma.employee.create({
            data: {
                name,
                email,
                role,
                department,
                skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []),
                walletAddress: walletAddress || null,
                orgId: req.org.id,
            },
        });
        res.status(201).json(employee);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create employee' });
    }
});

// PUT /api/employees/:id
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma.employee.findFirst({ where: { id, orgId: req.org.id } });
        if (!existing) return res.status(404).json({ error: 'Employee not found' });

        const { name, email, role, department, skills, walletAddress, isActive } = req.body;
        const employee = await prisma.employee.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(email && { email }),
                ...(role && { role }),
                ...(department && { department }),
                ...(skills !== undefined && {
                    skills: Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()),
                }),
                ...(walletAddress !== undefined && { walletAddress }),
                ...(isActive !== undefined && { isActive }),
            },
        });
        res.json(employee);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update employee' });
    }
});

// DELETE /api/employees/:id (soft delete)
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma.employee.findFirst({ where: { id, orgId: req.org.id } });
        if (!existing) return res.status(404).json({ error: 'Employee not found' });

        await prisma.employee.update({
            where: { id },
            data: { isActive: false },
        });
        res.json({ message: 'Employee deactivated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to deactivate employee' });
    }
});

// GET /api/employees/:id
router.get('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await prisma.employee.findFirst({
            where: { id, orgId: req.org.id },
            include: {
                tasks: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!employee) return res.status(404).json({ error: 'Employee not found' });
        res.json(employee);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch employee' });
    }
});

module.exports = router;
