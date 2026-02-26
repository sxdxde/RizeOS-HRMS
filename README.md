# Mini AI-HRMS

A full-stack AI-powered Human Resource Management System built as a 3-day intern assessment project.

<div align="center">
  <img src="./img/Screenshot%202026-02-26%20at%2010.03.13%E2%80%AFPM.png" alt="Dashboard" width="49%">
  <img src="./img/Screenshot%202026-02-26%20at%2010.03.25%E2%80%AFPM.png" alt="Employees" width="49%">
</div>
<div align="center">
  <img src="./img/Screenshot%202026-02-26%20at%2010.03.29%E2%80%AFPM.png" alt="Tasks" width="49%">
  <img src="./img/Screenshot%202026-02-26%20at%2010.03.38%E2%80%AFPM.png" alt="Insights" width="49%">
</div>

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js (Vite), Tailwind CSS, React Router v6 |
| Backend | Node.js, Express.js |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Web3 | ethers.js, MetaMask, Polygon Mumbai |
| API Layer | Axios with interceptors |

---

## Project Structure

```text
mini-ai-hrms/
├── client/               # React + Vite frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route pages
│   │   └── services/     # API + Web3 services
├── server/               # Express backend
│   ├── middleware/       # JWT auth middleware
│   ├── routes/           # API routes
│   ├── services/         # AI service logic
│   └── prisma/           # Seed script
├── prisma/
│   └── schema.prisma     # Database schema
└── .env.example          # Environment variables template
```

---

## Setup Instructions

### 1. Clone and install

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure environment

**Server** - create `server/.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/hrms
JWT_SECRET=your_super_secret_key_here
PORT=5000
```

**Client** - create `client/.env`:
```env
VITE_API_URL=http://localhost:5000
```

### 3. Database setup

```bash
# From the root of the project
cd server

# Generate Prisma client
npx prisma generate --schema=../prisma/schema.prisma

# Run migrations
npx prisma migrate dev --schema=../prisma/schema.prisma --name init

# Seed with sample data
node prisma/seed.js
```

### 4. Start servers

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

Visit:
**https://rize-os-hrms-assessment.vercel.app/**

**http://localhost:3000**

Demo login: `admin@techcorp.com` / `password123`

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new organization |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/dashboard` | Org dashboard stats |
| GET | `/api/employees` | List all employees |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Soft-delete (deactivate) |
| GET | `/api/employees/:id` | Employee + task history |
| GET | `/api/tasks` | List tasks (filterable) |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id/status` | Update task status + txHash |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/ai/productivity/:id` | Employee productivity score |
| GET | `/api/ai/skill-gap/:id` | Skill gap analysis |
| GET | `/api/ai/smart-assign` | Smart task assignment |
| GET | `/api/ai/insights` | Org-wide AI summary |

---

## AI Scoring Formula

### Productivity Score
```text
completionRate = completedTasks / totalTasks
onTimeRate = onTimeTasks / completedTasks
score = round((completionRate * 0.6 + onTimeRate * 0.4) * 100)

label:
  score >= 80 -> "High"
  score >= 50 -> "Medium"  
  score < 50 -> "Low"
```

### Smart Assignment
```text
employeeScore = completedTaskCount + (skillMatches * 2)
```
Top 3 employees ranked by `employeeScore`.

### Skill Gap
Compares employee's current skills vs. role-required skills from a predefined `roleSkillMap`. Returns `matchPercent` and a list of missing skills.

---

## Web3 Integration

When a task is marked **In Progress**, a **Log on Polygon** button appears. On click:

1. MetaMask prompts to connect wallet
2. A self-transaction is sent with the task payload encoded as `data`:
   ```json
   { "taskId": "...", "employeeId": "...", "status": "COMPLETED", "timestamp": 1234567890 }
   ```
3. `tx.hash` is saved to the database
4. A PolygonScan link is shown: `https://mumbai.polygonscan.com/tx/{txHash}`

---

## Environment Variables

### Server
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `PORT` | Server port (default: 5000) |

### Client
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

---

## Deployment

### Frontend - Vercel
```bash
cd client
npm run build
# Deploy the dist/ folder to Vercel
# Set VITE_API_URL env var in Vercel dashboard
```

### Backend - Render
- Connect your GitHub repo
- Set root directory to `server/`
- Start command: `npm start`
- Add all environment variables in Render dashboard
- Run `npx prisma migrate deploy` on first deploy

---

## Screenshots

> Add screenshots here after running the app

- Dashboard overview
- Employee list with skill badges
- Kanban task board
- AI Insights page
- Employee detail with productivity score

---

## License

MIT - Built for educational purposes.
