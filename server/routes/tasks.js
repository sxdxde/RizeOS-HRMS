const express = require('express');
const auth = require('../middleware/auth');
const prisma = require('../lib/prisma');

const router = express.Router();

// GET /api/tasks
router.get('/', auth, async (req, res) => {
    try {
        const { employeeId, status } = req.query;
        const where = { orgId: req.org.id };
        if (employeeId) where.employeeId = employeeId;
        if (status) where.status = status;

        const tasks = await prisma.task.findMany({
            where,
            include: {
                employee: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// POST /api/tasks
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, employeeId, priority, dueDate } = req.body;
        if (!title || !employeeId) {
            return res.status(400).json({ error: 'Title and employeeId are required' });
        }

        // Verify employee belongs to org
        const employee = await prisma.employee.findFirst({
            where: { id: employeeId, orgId: req.org.id },
        });
        if (!employee) return res.status(404).json({ error: 'Employee not found' });

        const task = await prisma.task.create({
            data: {
                title,
                description: description || null,
                employeeId,
                priority: priority || 'medium',
                dueDate: dueDate ? new Date(dueDate) : null,
                orgId: req.org.id,
                status: 'ASSIGNED',
            },
            include: {
                employee: { select: { id: true, name: true } },
            },
        });
        res.status(201).json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// PUT /api/tasks/:id/status
router.put('/:id/status', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, txHash } = req.body;

        const validStatuses = ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const existing = await prisma.task.findFirst({
            where: { id, orgId: req.org.id },
        });
        if (!existing) return res.status(404).json({ error: 'Task not found' });

        const updateData = { status, updatedAt: new Date() };
        if (status === 'COMPLETED' && txHash) {
            updateData.txHash = txHash;
        }

        const task = await prisma.task.update({
            where: { id },
            data: updateData,
            include: {
                employee: { select: { id: true, name: true } },
            },
        });
        res.json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update task status' });
    }
});

// DELETE /api/tasks/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma.task.findFirst({
            where: { id, orgId: req.org.id },
        });
        if (!existing) return res.status(404).json({ error: 'Task not found' });

        await prisma.task.delete({ where: { id } });
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

module.exports = router;
