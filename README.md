# Mini AI-HRMS — Workforce Intelligence Platform

> **RizeOS Intern Assessment Submission**
> Demonstrating clean architecture, practical AI integration, Web3 workforce verification readiness, product-level scalability awareness, and ownership-driven execution.

---

<div align="center">
  <img src="./img/Screenshot%202026-02-26%20at%2010.03.13%E2%80%AFPM.png" alt="Dashboard" width="49%">
  <img src="./img/Screenshot%202026-02-26%20at%2010.03.25%E2%80%AFPM.png" alt="Employees" width="49%">
</div>
<div align="center">
  <img src="./img/Screenshot%202026-02-26%20at%2010.03.29%E2%80%AFPM.png" alt="Tasks Kanban" width="49%">
  <img src="./img/Screenshot%202026-02-26%20at%2010.03.38%E2%80%AFPM.png" alt="AI Insights" width="49%">
</div>

---

## Executive Summary

This project is a production-grade mini-HRMS designed to demonstrate the kind of workforce intelligence architecture that sits at the core of a platform like RizeOS. It goes beyond a standard CRUD application: it features a composable AI scoring engine, a Kanban task workflow with real-time state transitions, a skill gap analysis system, and an immutable on-chain task verification layer via MetaMask and the Polygon network.

Every technical decision made in this build — from the database schema to the Web3 transaction pattern — was made with scale and ownership in mind. This README documents not just what was built, but why each decision was made and how it maps to the real-world concerns stated in the RizeOS assessment brief.

---

## Assessment Criteria Mapping

| RizeOS Criteria | Where It's Demonstrated |
|----------------|------------------------|
| Clean architecture & modular backend | Section 1: Monorepo structure, route/service/middleware split |
| Practical AI integration thinking | Section 2: Scoring formula, skill gap, smart assignment |
| Web3 readiness | Section 3: On-chain task log, burn address pattern, upgrade path |
| Product-level scalability awareness | Section 4: Multi-tenancy, migration roadmap, horizontal scale |
| Ownership-driven execution mindset | Section 5: Design decisions, tradeoffs, end-to-end delivery |

---

## Section 1 — Clean Architecture & Modular Backend Design

### 1.1 Monorepo Structure

```
mini-ai-hrms/
├── client/                    # React + Vite SPA
│   └── src/
│       ├── components/        # Navbar, Modal, StatCard, StatusBadge, PriorityBadge, LoadingSpinner
│       ├── pages/             # Dashboard, Employees, EmployeeDetail, Tasks, AIInsights, Login, Register, Landing
│       └── services/          # api.js (Axios + interceptors), web3.js (ethers.js)
│
├── server/                    # Express.js REST API
│   ├── middleware/            # auth.js — JWT guard, attaches req.org
│   ├── routes/                # auth.js, employees.js, tasks.js, ai.js, dashboard.js
│   ├── services/              # aiService.js — pure AI logic, no HTTP coupling
│   └── lib/                   # prisma.js — singleton connection
│
├── prisma/
│   ├── schema.prisma          # Multi-tenant Org → Employee → Task data model
│   └── seed.js               # Deterministic seed with realistic org + team data
│
└── img/                       # Project screenshots
```

### 1.2 Layered Responsibility Model

The backend enforces a clean layered architecture with explicit role separation:

**Routes** — HTTP only. Parse params, call services, shape the response. No business logic.

**Services (`aiService.js`)** — All computation happens here. This module has zero Express dependencies, making it independently testable, replaceable, or extractable into a microservice without touching routes.

**Middleware (`auth.js`)** — JWT verification runs once and attaches `req.org` to the request context. Every downstream route becomes one line shorter and the auth logic lives in exactly one place.

**Prisma Singleton (`lib/prisma.js`)** — Prevents connection pool exhaustion in long-running Node.js instances where re-instantiating Prisma per-request creates dangling connections.

```js
// lib/prisma.js — singleton pattern
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
module.exports = prisma
```

### 1.3 Multi-Tenant Data Model

The schema enforces org-level isolation from row 1. Every query is scoped by `orgId` pulled from the validated JWT — not a client-supplied parameter — meaning cross-tenant data leaks are architecturally prevented.

```prisma
model Organization {
  id        String     @id @default(cuid())
  name      String
  email     String     @unique
  password  String
  employees Employee[]
  tasks     Task[]
  createdAt DateTime   @default(now())
}

model Employee {
  id            String       @id @default(cuid())
  orgId         String
  org           Organization @relation(fields: [orgId], references: [id])
  name          String
  email         String
  role          String
  department    String
  skills        String[]
  isActive      Boolean      @default(true)
  walletAddress String?
  tasks         Task[]
  createdAt     DateTime     @default(now())
}

model Task {
  id          String    @id @default(cuid())
  orgId       String
  employeeId  String
  title       String
  description String?
  status      Status    @default(ASSIGNED)     // ASSIGNED | IN_PROGRESS | COMPLETED
  priority    Priority  @default(MEDIUM)       // LOW | MEDIUM | HIGH
  dueDate     DateTime?
  txHash      String?                          // Polygon transaction hash (on-chain proof)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

This schema is ready to evolve: adding a `Contract` model for payroll, a `Review` model for performance cycles, or a `Wallet` model for on-chain identity — all sit naturally within this org-scoped hierarchy.

---

## Section 2 — Practical AI Integration Thinking

The AI layer is fully in-house — no LLM API dependencies, no black-box models. Every score is calculable, auditable, and explainable, which is the correct approach for an HR system where employees and managers need to trust and challenge the system's outputs.

### 2.1 Productivity Score

Each employee receives a live productivity score computed from their task history:

```
completionRate = completedTasks / totalTasks
onTimeRate     = tasksCompletedOnTime / completedTasks

score = round((completionRate × 0.6 + onTimeRate × 0.4) × 100)

Performance Band:
  score ≥ 80  →  "High Performance"
  score ≥ 50  →  "Medium Performance"
  score < 50  →  "Needs Attention"
```

**Why these weights?** Completion (60%) matters more than timeliness (40%) because a completed task is always better than an abandoned one. On-time delivery is a signal of planning quality and should be rewarded, but not at the expense of completion breadth.

The score surfaces on the Employee Detail page alongside a full breakdown: total tasks, completed, on-time count, completion rate %, and on-time rate % — so managers can see exactly what drove the number.

### 2.2 Skill Gap Detection

Every role maps to a predefined required skill set via `roleSkillMap`. The system compares an employee's actual skills against their role requirements and surfaces:

- `required` — the full expected skill set for the role
- `missing` — skills not listed on the employee profile
- `matched` — skills they already have
- `matchPercent` — a clear 0–100 coverage score

```js
const roleSkillMap = {
  'Frontend Developer':  ['React', 'CSS', 'TypeScript', 'Git', 'Figma'],
  'Backend Developer':   ['Node.js', 'SQL', 'REST APIs', 'Docker', 'Redis'],
  'DevOps Engineer':     ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'AWS'],
  'Full Stack Developer':['React', 'Node.js', 'SQL', 'Git', 'Docker'],
  'Data Analyst':        ['Python', 'SQL', 'Excel', 'Tableau', 'Statistics'],
  'Product Manager':     ['Roadmapping', 'Figma', 'Analytics', 'Agile', 'SQL'],
}
```

The gap result is shown as a progress bar and a color-coded tag grid in the Employee Detail view, giving managers an at-a-glance development roadmap for each team member.

### 2.3 Smart Task Assignment

Given a task description, the engine ranks all active employees in the org by a composite suitability score:

```
suitabilityScore = completedTaskCount + (skillMatchCount × 2)
```

The task description is lowercased and matched character-by-character against each employee's skills array. Skill matches are weighted 2x over pure task volume because skill alignment is a stronger predictor of success than raw output history.

The top 3 candidates are returned with full reasoning:
```json
{
  "name": "Priya Sharma",
  "role": "Frontend Developer",
  "score": 8,
  "reason": "Skills match: React, CSS. Completed 3 tasks."
}
```

The reasoning field makes the system auditable — a manager can override the suggestion and understand why it was made in the first place.

### 2.4 Org-Wide Insights Aggregation

The `/api/ai/insights` endpoint runs productivity scoring across all active employees in parallel and returns a full intelligence summary:

- `avgProductivityScore` — the org's single headline KPI
- `highPerformers` (score > 80) — for recognition and project-critical assignments
- `lowPerformers` / `needsAttention` (score < 50) — for structured check-ins
- `departmentBreakdown` — avg score per department for macro HR decisions
- `totalAnalyzed` — audit transparency on how many employees were included

---

## Section 3 — Web3 Readiness for Workforce Verification

### 3.1 The Real-World Problem This Solves

In a decentralized workforce platform like RizeOS, proof-of-work is more than a UI label. Contractors, DAO contributors, and gig workers need tamper-proof records that a task was completed at a given time by a given identity. This cannot live in a centralized database alone — it can be edited, disputed, or deleted.

The Web3 layer in this project provides the foundation for immutable workforce attestation.

### 3.2 Implementation

When a task is moved to **In Progress**, a "Log on Chain" button appears. On click:

1. MetaMask requests wallet access (`eth_requestAccounts`)
2. The task payload is serialized as JSON and hex-encoded:
   ```json
   { "taskId": "cmm3g...", "employeeId": "cmm38...", "status": "COMPLETED", "timestamp": 1740000000000 }
   ```
3. A transaction is sent to the Polygon **burn address** (`0x000000000000000000000000000000000000dEaD`) with the encoded payload as the `data` field:
   ```js
   const tx = await signer.sendTransaction({
     to: '0x000000000000000000000000000000000000dEaD',
     value: 0n,
     data: ethers.hexlify(ethers.toUtf8Bytes(payload))
   })
   ```
4. The transaction hash is stored in the database as `task.txHash`
5. A live PolygonScan link is shown: `https://mumbai.polygonscan.com/tx/{txHash}`

**Why the burn address?** Sending a transaction with custom `data` to your own EOA wallet raises an "External transactions to internal accounts cannot include data" error on most RPC nodes. The burn address is a widely-used, owner-less contract that accepts any transaction — making it the standard pattern for on-chain logging without deploying a custom smart contract.

### 3.3 Upgrade Path to Production Web3

This architecture is designed for zero-breaking-change upgrades:

| Current (MVP) | Production |
|--------------|-----------|
| Burn address with hex-encoded JSON | Deployed Solidity contract with structured events |
| Manual MetaMask sign | Session wallet via WalletConnect or embedded wallet SDK |
| txHash stored in Postgres | Event indexer (The Graph / Subgraph) for queryable on-chain history |
| Polygon Mumbai testnet | Polygon Mainnet or Base L2 for low gas costs |
| Employee wallet address (optional) | Required wallet for payroll + attestation identity |

The single change point is `web3.js` — the rest of the system (task status logic, UI, database) is completely unaffected.

---

## Section 4 — Product-Level Scalability Awareness

### 4.1 What's Already Scalable

- **Stateless authentication**: JWTs mean any number of API server instances can handle any request — no session store needed.
- **Org-scoped queries**: Every database query filters by `orgId`. Row-level security can be added in Postgres with zero query changes.
- **Service-layer separation**: `aiService.js` can be extracted to a Lambda function, a worker queue, or a dedicated microservice with no changes to routes.
- **Prisma ORM**: Migrations are version-controlled, making schema evolution safe and reversible across environments.

### 4.2 Known Scale Bottlenecks and Mitigations

| Bottleneck | Current Behavior | At Scale |
|-----------|-----------------|----------|
| Productivity calculation | Computed per-request for every employee | Move to nightly job with Redis cache; expose stale-while-revalidate scores |
| Smart Assignment | In-memory string matching across all employees | Replace with pgvector similarity search on skill embeddings |
| Org insight aggregation | Sequential Promise.all across all employees | Batch with a task queue (BullMQ); stream results via SSE or WebSockets |
| On-chain logging | One MetaMask prompt per task | Batch signing with EIP-712 structured data + nonce management |
| Database | Single Postgres instance | Read replicas for analytics queries; write to primary only |

### 4.3 Frontend Architecture for Scale

- **Vite** builds produce optimized, tree-shaken bundles deployable to Vercel's CDN edge in under 2 seconds.
- **React Router v6** with lazy loading can code-split every page route, reducing initial bundle size by ~60% for large apps.
- **Axios interceptors** centralize auth token injection and 401 redirect handling — adding retry logic, request deduplication, or request cancellation requires changes to one file only.

---

## Section 5 — Ownership-Driven Execution Mindset

This project was built end-to-end — from database schema design to UI animation tokens — with the following principles:

**Decisions, not just implementations**: Every choice (burn address, weighted scoring, Prisma singleton, bento UI) was intentional and documented. The code can be handed off without tribal knowledge.

**Edge cases handled**: The AI scoring handles zero-task employees (returns 0, not NaN). Skill gap handles employees with no assigned skills. The Web3 layer gracefully handles MetaMask not being installed. Auth handles 401s silently — users are redirected to login without stack traces in the UI.

**No placeholders**: Every component renders real data from the backend. The seed script creates a realistic org with 5 employees across Engineering, DevOps, and Analytics — the AI scoring engine has real data to compute against from day one.

**Design as a product signal**: The editorial bento-box UI is not cosmetic. It reflects the product perspective that a workforce platform needs to be trusted and adopted by managers — which means it needs to feel premium, clear, and information-dense without being cluttered.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js (Vite), Custom CSS Design System |
| Routing | React Router v6 |
| Backend | Node.js + Express.js |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT + bcryptjs |
| Web3 | ethers.js, MetaMask, Polygon Mumbai |
| HTTP Client | Axios with interceptors |

---

## Setup & Running Locally

### Install

```bash
cd server && npm install
cd ../client && npm install
```

### Environment

**`server/.env`**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/hrms
JWT_SECRET=your_super_secret_key_here
PORT=5000
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:5000
```

### Database

```bash
cd server
npx prisma generate --schema=../prisma/schema.prisma
npx prisma migrate dev --schema=../prisma/schema.prisma --name init
node prisma/seed.js
```

### Start

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Visit **http://localhost:5173** — Demo: `admin@techcorp.com` / `password123`

---

## API Reference

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | — | Create new organization |
| POST | `/api/auth/login` | — | Return signed JWT |
| GET | `/api/dashboard` | JWT | Org stats snapshot |
| GET | `/api/employees` | JWT | List employees |
| POST | `/api/employees` | JWT | Add employee |
| PUT | `/api/employees/:id` | JWT | Edit employee |
| DELETE | `/api/employees/:id` | JWT | Soft-deactivate |
| GET | `/api/employees/:id` | JWT | Profile + task history |
| GET | `/api/tasks` | JWT | List tasks (filter: `?employeeId=`) |
| POST | `/api/tasks` | JWT | Create task |
| PUT | `/api/tasks/:id/status` | JWT | Update status + store txHash |
| DELETE | `/api/tasks/:id` | JWT | Delete task |
| GET | `/api/ai/productivity/:id` | JWT | Score + breakdown |
| GET | `/api/ai/skill-gap/:id` | JWT | Skill match % and gaps |
| GET | `/api/ai/smart-assign` | JWT | Top 3 candidates for task |
| GET | `/api/ai/insights` | JWT | Org-wide AI summary |

---

## Deployment

### Frontend — Vercel
```bash
cd client && npm run build
# Deploy dist/ to Vercel, set VITE_API_URL env var
```

### Backend — Render / Railway
- Root directory: `server/`
- Start command: `node index.js`
- Add all env vars in dashboard
- Run `npx prisma migrate deploy` on first deploy

---

## License

MIT — Built for educational and assessment purposes.
