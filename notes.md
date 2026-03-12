# DollarToGo Developer Notes

This file is a central place to keep all technical notes, ideas, command references, and to-do items for the project.

## Architecture Guidelines
- **Frontend**: Next.js 14 (React) in `apps/web`
- **Backend API**: Node.js + Express in `apps/api`
- **Database**: PostgreSQL 16 (Neon)
- **ORM**: Prisma (`apps/api/prisma/schema.prisma`)

## Useful Commands

### 1. Database
Using remote Neon Postgres Database.

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

## Database connection urls:
Database url: postgresql://neondb_owner:npg_Mv8Tbd2sqHjK@ep-curly-violet-adcmqo8c-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

Direct Connection: postgresql://neondb_owner:npg_Mv8Tbd2sqHjK@ep-curly-violet-adcmqo8c.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

## commands to run for migrating the schema changes to neon db
```bash
npx prisma migrate dev
```
