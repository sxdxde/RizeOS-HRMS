const express = require('express');
const auth = require('../middleware/auth');
const prisma = require('../lib/prisma');

const router = express.Router();

// GET /api/dashboard
router.get('/', auth, async (req, res) => {
    try {
        const orgId = req.org.id;

        const [
            totalEmployees,
            activeEmployees,
            assignedTasks,
            inProgressTasks,
            completedTasks,
            recentTasks,
            topPerformersRaw,
        ] = await Promise.all([
            prisma.employee.count({ where: { orgId } }),
            prisma.employee.count({ where: { orgId, isActive: true } }),
            prisma.task.count({ where: { orgId, status: 'ASSIGNED' } }),
            prisma.task.count({ where: { orgId, status: 'IN_PROGRESS' } }),
            prisma.task.count({ where: { orgId, status: 'COMPLETED' } }),
            prisma.task.findMany({
                where: { orgId },
                include: { employee: { select: { name: true } } },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
            prisma.employee.findMany({
                where: { orgId, isActive: true },
                include: {
                    _count: {
                        select: { tasks: { where: { status: 'COMPLETED' } } },
                    },
                },
            }),
        ]);

        const topPerformers = topPerformersRaw
            .sort((a, b) => b._count.tasks - a._count.tasks)
            .slice(0, 3)
            .map((e) => ({
                id: e.id,
                name: e.name,
                role: e.role,
                department: e.department,
                completedTasks: e._count.tasks,
            }));

        res.json({
            totalEmployees,
            activeEmployees,
            assignedTasks,
            inProgressTasks,
            completedTasks,
            recentTasks,
            topPerformers,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

module.exports = router;
