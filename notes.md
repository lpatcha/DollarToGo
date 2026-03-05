# DollarToGo Developer Notes

This file is a central place to keep all technical notes, ideas, command references, and to-do items for the project.

## Architecture Guidelines
- **Frontend**: Next.js 14 (React) in `apps/web`
- **Backend API**: Node.js + Express in `apps/api`
- **Database**: PostgreSQL 16 (local via Docker Compose)
- **ORM**: Prisma (`apps/api/prisma/schema.prisma`)

## Useful Commands

### 1. Database & Docker
Start background database:
```bash
docker compose up -d
```
Stop database:
```bash
docker compose down
```

### 2. Prisma Commands (Run these inside apps/api)
Apply schema changes:
```bash
cd apps/api
npx prisma migrate dev
```
Open Prisma Studio to view DB records:
```bash
cd apps/api
npx prisma studio
```

### 3. Running the App
Start both frontend & backend servers (from project root):
```bash
npm install
npm run dev
```

## Immediate To-Do List
- [ ] Connect backend to frontend Auth
- [ ] Verify Prisma relations (User -> DriverProfile)
- [ ] Implement socket.io for real-time tracking
- [ ] Polish UI

## Scratchpad / Ideas
*Put unorganized thoughts or API payloads to test here*

