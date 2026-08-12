# Military Asset Management System (MAMS)

A robust, full-stack logistics and inventory platform built for tracking equipment across military bases with strict, mathematically pure transactional logging and role-based access.

## Architecture & Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Lucide React, Recharts. Features a unique NATO STANAG / Field Manual aesthetic using deep olive greens, hazard yellows, and technical-drawing stencil fonts.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL.
- **Security**: JWT Authentication, Role-Based Access Control (RBAC), and strict cross-base segregation (`enforceBaseScope` middleware).
- **Integrity**: All mutating actions are wrapped in atomic `prisma.$transaction` calls, tightly coupled with immutable `AuditLog` writes. Ledger balances are derived dynamically from transaction history.

## Getting Started (Local Development)

### Prerequisites
- Node.js (v20+)
- Docker (for PostgreSQL database)

### 1. Database Setup
Start the local PostgreSQL container (runs on port 5433 to avoid conflicts):
```bash
docker-compose up -d
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```

**Environment Variables (`backend/.env`)**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/mams?schema=public"
JWT_SECRET="supersecret_mams_key_2026"
JWT_EXPIRY="1d"
PORT=3000
```

### 3. Database Seeding (Crucial)
To populate the database with bases, equipment types, users, and realistic scenario data (purchases, transfers, assignments):
```bash
cd backend
npx prisma generate
npx prisma db push
npx tsx src/scripts/seed.ts
```

*Default login after seeding:*
- **Operator ID**: `admin@mams.local`
- **Passcode**: `admin123`

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`.

## Deployment (Docker)

Both the frontend and backend contain `Dockerfile`s optimized for production environments.

1. **Backend**: A multi-stage build that compiles TypeScript and runs only the JS artifacts.
2. **Frontend**: A multi-stage build that compiles the Vite React app into static files and serves them via an Nginx alpine container (`nginx.conf` provided for SPA routing).

