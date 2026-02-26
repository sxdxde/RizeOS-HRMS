const express = require('express');
const auth = require('../middleware/auth');
const prisma = require('../lib/prisma');
const { calculateProductivityScore, detectSkillGap, getSmartAssignments } = require('../services/aiService');

const router = express.Router();

// GET /api/ai/productivity/:employeeId
router.get('/productivity/:employeeId', auth, async (req, res) => {
    try {
        const { employeeId } = req.params;
        const employee = await prisma.employee.findFirst({
            where: { id: employeeId, orgId: req.org.id },
        });
        if (!employee) return res.status(404).json({ error: 'Employee not found' });

        const result = await calculateProductivityScore(employeeId);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to calculate productivity score' });
    }
});

// GET /api/ai/skill-gap/:employeeId
router.get('/skill-gap/:employeeId', auth, async (req, res) => {
    try {
        const { employeeId } = req.params;
        const employee = await prisma.employee.findFirst({
            where: { id: employeeId, orgId: req.org.id },
        });
        if (!employee) return res.status(404).json({ error: 'Employee not found' });

        const result = await detectSkillGap(employeeId);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to detect skill gap' });
    }
});

// GET /api/ai/smart-assign?taskTitle=&taskDescription=
router.get('/smart-assign', auth, async (req, res) => {
    try {
        const { taskTitle = '', taskDescription = '' } = req.query;
        const recommendations = await getSmartAssignments(req.org.id, taskTitle, taskDescription);
        res.json(recommendations);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to get smart assignments' });
    }
});

// GET /api/ai/insights
router.get('/insights', auth, async (req, res) => {
    try {
        const employees = await prisma.employee.findMany({
            where: { orgId: req.org.id, isActive: true },
        });

        const scores = await Promise.all(
            employees.map(async (emp) => {
                const productivity = await calculateProductivityScore(emp.id);
                return {
                    id: emp.id,
                    name: emp.name,
                    department: emp.department,
                    score: productivity.score,
                    label: productivity.label,
                };
            })
        );

        const avgProductivityScore =
            scores.length > 0
                ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
                : 0;
        const highPerformers = scores.filter((s) => s.score > 80);
        const lowPerformers = scores.filter((s) => s.score < 50);

        // Department breakdown
        const deptMap = {};
        scores.forEach((s) => {
            if (!deptMap[s.department]) deptMap[s.department] = { total: 0, count: 0 };
            deptMap[s.department].total += s.score;
            deptMap[s.department].count += 1;
        });
        const departmentBreakdown = Object.entries(deptMap).map(([dept, { total, count }]) => ({
            department: dept,
            avgScore: Math.round(total / count),
            employeeCount: count,
        }));

        res.json({
            avgProductivityScore,
            highPerformers,
            lowPerformers,
            departmentBreakdown,
            totalAnalyzed: scores.length,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch AI insights' });
    }
});

module.exports = router;
