const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create organization (idempotent)
    const hashedPassword = await bcrypt.hash('password123', 10);
    const org = await prisma.organization.upsert({
        where: { email: 'admin@techcorp.com' },
        update: {},
        create: {
            name: 'TechCorp India',
            email: 'admin@techcorp.com',
            password: hashedPassword,
        },
    });
    console.log(`✅ Organization: ${org.name} (${org.email})`);

    // Create employees (idempotent — check by email + orgId before creating)
    const employeesData = [
        {
            name: 'Priya Sharma',
            email: 'priya@techcorp.com',
            role: 'Frontend Developer',
            department: 'Engineering',
            skills: ['React', 'CSS', 'TypeScript', 'Git'],
        },
        {
            name: 'Rahul Verma',
            email: 'rahul@techcorp.com',
            role: 'Backend Developer',
            department: 'Engineering',
            skills: ['Node.js', 'SQL', 'REST APIs', 'Docker'],
        },
        {
            name: 'Ananya Patel',
            email: 'ananya@techcorp.com',
            role: 'Full Stack Developer',
            department: 'Engineering',
            skills: ['React', 'Node.js', 'SQL', 'Git'],
        },
        {
            name: 'Karan Mehta',
            email: 'karan@techcorp.com',
            role: 'DevOps Engineer',
            department: 'Infrastructure',
            skills: ['Docker', 'Kubernetes', 'CI/CD', 'Linux'],
        },
        {
            name: 'Sneha Reddy',
            email: 'sneha@techcorp.com',
            role: 'Data Analyst',
            department: 'Analytics',
            skills: ['Python', 'SQL', 'Excel', 'Tableau'],
        },
    ];

    const employees = [];
    for (const empData of employeesData) {
        // BUG-4 FIX: use findFirst (scoped to org) then create — avoids broken composite ID upsert
        let emp = await prisma.employee.findFirst({
            where: { email: empData.email, orgId: org.id },
        });
        if (!emp) {
            emp = await prisma.employee.create({
                data: { ...empData, orgId: org.id },
            });
        }
        employees.push(emp);
        console.log(`✅ Employee: ${emp.name}`);
    }

    // Only seed tasks if there are none yet (keeps seed idempotent)
    const existingTaskCount = await prisma.task.count({ where: { orgId: org.id } });
    if (existingTaskCount > 0) {
        console.log(`ℹ️  Tasks already seeded (${existingTaskCount} tasks found), skipping.`);
    } else {
        const now = new Date();
        const pastDate = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        const futureDate = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        // BUG-5 FIX: removed 'updatedAt' from all task.create() calls — it is Prisma-managed
        const tasksData = [
            {
                title: 'Build React Dashboard UI',
                description: 'Create responsive dashboard with charts and stat cards',
                status: 'COMPLETED',
                priority: 'high',
                employeeId: employees[0].id,
                dueDate: pastDate(5),
            },
            {
                title: 'Implement Authentication API',
                description: 'JWT-based login and register endpoints',
                status: 'COMPLETED',
                priority: 'high',
                employeeId: employees[1].id,
                dueDate: pastDate(10),
            },
            {
                title: 'Design Employee Profile Page',
                description: 'Figma design for employee detail view',
                status: 'IN_PROGRESS',
                priority: 'medium',
                employeeId: employees[0].id,
                dueDate: futureDate(3),
            },
            {
                title: 'Setup CI/CD Pipeline',
                description: 'GitHub Actions for auto deploy to staging',
                status: 'COMPLETED',
                priority: 'high',
                employeeId: employees[3].id,
                dueDate: pastDate(2),
            },
            {
                title: 'Analyze Q4 User Metrics',
                description: 'Generate report from analytics dashboard',
                status: 'COMPLETED',
                priority: 'medium',
                employeeId: employees[4].id,
                dueDate: pastDate(7),
            },
            {
                title: 'Build REST API for Tasks',
                description: 'CRUD endpoints for task management',
                status: 'IN_PROGRESS',
                priority: 'high',
                employeeId: employees[1].id,
                dueDate: futureDate(5),
            },
            {
                title: 'Optimize Database Queries',
                description: 'Add indexes and improve N+1 queries',
                status: 'ASSIGNED',
                priority: 'medium',
                employeeId: employees[2].id,
                dueDate: futureDate(7),
            },
            {
                title: 'Write Unit Tests for API',
                description: 'Jest tests for all route handlers',
                status: 'ASSIGNED',
                priority: 'low',
                employeeId: employees[2].id,
                dueDate: futureDate(10),
            },
            {
                title: 'Setup Kubernetes Cluster',
                description: 'EKS cluster setup for production deployment',
                status: 'IN_PROGRESS',
                priority: 'high',
                employeeId: employees[3].id,
                dueDate: futureDate(2),
            },
            {
                title: 'Create Data Pipeline for Reports',
                description: 'ETL pipeline for monthly report generation',
                status: 'ASSIGNED',
                priority: 'medium',
                employeeId: employees[4].id,
                dueDate: futureDate(14),
            },
        ];

        for (const taskData of tasksData) {
            const task = await prisma.task.create({
                data: {
                    title: taskData.title,
                    description: taskData.description,
                    status: taskData.status,
                    priority: taskData.priority,
                    employeeId: taskData.employeeId,
                    dueDate: taskData.dueDate,
                    orgId: org.id,
                },
            });
            console.log(`✅ Task: ${task.title} [${task.status}]`);
        }
    }

    console.log('\n🎉 Seed completed!');
    console.log('Login credentials: admin@techcorp.com / password123');
}

main()
    .catch((e) => {
        console.error('Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
