const prisma = require('../lib/prisma');

const roleSkillMap = {
    'Frontend Developer': ['React', 'CSS', 'TypeScript', 'Git', 'Figma'],
    'Backend Developer': ['Node.js', 'SQL', 'REST APIs', 'Docker', 'Redis'],
    'DevOps Engineer': ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'AWS'],
    'Product Manager': ['Roadmapping', 'Figma', 'Analytics', 'Agile', 'SQL'],
    'Data Analyst': ['Python', 'SQL', 'Excel', 'Tableau', 'Statistics'],
    'Full Stack Developer': ['React', 'Node.js', 'SQL', 'Git', 'Docker'],
};

async function calculateProductivityScore(employeeId) {
    const tasks = await prisma.task.findMany({ where: { employeeId } });
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'COMPLETED').length;

    const onTime = tasks.filter((t) => {
        if (t.status !== 'COMPLETED') return false;
        if (!t.dueDate) return true; // no due date = on time
        return new Date(t.updatedAt) <= new Date(t.dueDate);
    }).length;

    const completionRate = total > 0 ? completed / total : 0;
    const onTimeRate = completed > 0 ? onTime / completed : 0;
    const score = Math.round((completionRate * 0.6 + onTimeRate * 0.4) * 100);
    const label = score >= 80 ? 'High' : score >= 50 ? 'Medium' : 'Low';

    return {
        score,
        label,
        breakdown: {
            total,
            completed,
            onTime,
            completionRate: Math.round(completionRate * 100),
            onTimeRate: Math.round(onTimeRate * 100),
        },
    };
}

async function detectSkillGap(employeeId) {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new Error('Employee not found');

    const required = roleSkillMap[employee.role] || [];
    const current = employee.skills || [];
    const currentLower = current.map((s) => s.toLowerCase());
    const missing = required.filter((s) => !currentLower.includes(s.toLowerCase()));
    const matched = required.filter((s) => currentLower.includes(s.toLowerCase()));
    const matchPercent = required.length > 0 ? Math.round((matched.length / required.length) * 100) : 100;

    return { required, current, missing, matchPercent };
}

async function getSmartAssignments(orgId, taskTitle, taskDescription = '') {
    const query = `${taskTitle} ${taskDescription}`.toLowerCase();

    const employees = await prisma.employee.findMany({
        where: { orgId, isActive: true },
        include: {
            _count: { select: { tasks: { where: { status: 'COMPLETED' } } } },
        },
    });

    const scored = employees.map((emp) => {
        const completedCount = emp._count.tasks;
        const skillMatchCount = emp.skills.filter((skill) =>
            query.includes(skill.toLowerCase())
        ).length;
        const score = completedCount + skillMatchCount * 2;
        const matchedSkills = emp.skills.filter((skill) =>
            query.includes(skill.toLowerCase())
        );
        const reason = matchedSkills.length > 0
            ? `Skills match: ${matchedSkills.join(', ')}. Completed ${completedCount} tasks.`
            : `Completed ${completedCount} tasks. Available for assignment.`;

        return { ...emp, score, reason };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, 3).map((e) => ({
        id: e.id,
        name: e.name,
        role: e.role,
        department: e.department,
        skills: e.skills,
        completedTasks: e._count.tasks,
        score: e.score,
        reason: e.reason,
    }));
}

module.exports = { calculateProductivityScore, detectSkillGap, getSmartAssignments };
