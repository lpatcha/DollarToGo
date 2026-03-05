# 🚗 DollarToGo

An open-source, community-driven ride-sharing platform where **riders set the price**.

---

## What is DollarToGo?

DollarToGo connects riders with drivers in their city — but with a twist: **the user decides what to pay**. Post a ride with your from/to locations, name your price, browse available drivers based on ratings and history, and pick the one you trust.

### Key Features

- 🧑‍💼 **Three portals** — User, Driver, and Admin interfaces
- 💰 **User-set pricing** — riders post rides and fix the fare
- 📍 **Zip-code matching** — drivers are matched based on service area
- ⭐ **Driver ratings & history** — users pick drivers based on preferences
- 🔔 **Real-time notifications** — instant ride updates via Socket.IO
- 🗺️ **Free maps** — powered by Leaflet + OpenStreetMap (no API keys)
- 🛡️ **Role-based access** — Admin dashboard with full visibility

### Status

🚧 **Proof of Concept** — targeting 100 initial users.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 14 (React) | SSR, file-based routing, great DX |
| **Styling** | Tailwind CSS | Rapid UI development |
| **Backend API** | Node.js + Express | Fast to build, JS everywhere |
| **Database** | PostgreSQL 16 | Reliable, free, zip-code queries |
| **ORM** | Prisma | Type-safe queries, easy migrations |
| **Auth** | JWT + bcrypt | Simple, stateless |
| **Maps** | Leaflet + OpenStreetMap | 100% free (no API key needed) |
| **Geocoding** | Nominatim (OSM) | Free geocoding for zip codes |
| **Realtime** | Socket.IO | Ride status updates |
| **Testing** | Jest + React Testing Library | Standard, well-documented |
| **CI/CD** | GitHub Actions | Free for public repos |

---

## Architecture Overview

```
                    ┌──────────────────────────────────┐
                    │     Frontend — Next.js App        │
                    │  ┌──────┐ ┌────────┐ ┌─────────┐ │
                    │  │ User │ │ Driver │ │  Admin  │ │
                    │  └──┬───┘ └───┬────┘ └────┬────┘ │
                    └─────┼─────────┼───────────┼──────┘
                          │         │           │
                          ▼         ▼           ▼
                    ┌──────────────────────────────────┐
                    │   Backend — Node.js / Express     │
                    │  ┌──────┐ ┌───────┐ ┌──────────┐ │
                    │  │ Auth │ │ Rides │ │ Matching │ │
                    │  └──┬───┘ └───┬───┘ └────┬─────┘ │
                    └─────┼─────────┼──────────┼───────┘
                          │         │          │
                          ▼         ▼          ▼
                    ┌──────────────────────────────────┐
                    │    Data Layer — PostgreSQL        │
                    └──────────────────────────────────┘
```

---

## Project Structure

```
DollarToGo/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/
│   │   │   ├── (user)/         # User-facing pages
│   │   │   ├── (driver)/       # Driver-facing pages
│   │   │   ├── (admin)/        # Admin dashboard pages
│   │   │   ├── auth/           # Login / Register pages
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/             # Reusable UI primitives
│   │   │   ├── user/           # User-specific components
│   │   │   ├── driver/         # Driver-specific components
│   │   │   └── admin/          # Admin-specific components
│   │   └── lib/                # API client, utils, hooks
│   │
│   └── api/                    # Express backend
│       ├── src/
│       │   ├── routes/         # Route handlers
│       │   ├── controllers/    # Business logic
│       │   ├── middleware/     # Auth, validation, error handling
│       │   ├── services/       # Driver matching, ride mgmt
│       │   ├── models/         # Prisma client wrapper
│       │   └── utils/          # Helpers (geocoding, etc.)
│       └── prisma/
│           └── schema.prisma   # Database schema
│
├── packages/
│   └── shared/                 # Shared types, constants, validation
│
├── docker-compose.yml          # Local dev (Postgres)
├── package.json                # Workspace root
└── README.md
```

---

## Database Schema

### Users
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `email` | String | Unique email |
| `password_hash` | String | Hashed password |
| `role` | Enum | `ADMIN`, `DRIVER`, or `USER` |
| `first_name` | String | First name |
| `last_name` | String | Last name |
| `phone` | String | Phone number |
| `zip_code` | String | User's zip code |
| `city` | String | City |

### Driver Profiles
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK → Users |
| `license_number` | String | Driving license |
| `vehicle_make` | String | e.g. Toyota |
| `vehicle_model` | String | e.g. Camry |
| `vehicle_year` | Int | e.g. 2020 |
| `vehicle_color` | String | Vehicle color |
| `license_plate` | String | Plate number |
| `avg_rating` | Float | Average star rating |
| `total_rides` | Int | Completed ride count |
| `is_available` | Boolean | Currently accepting rides |
| `service_zip_codes` | String | Zip codes they serve |

### Rides
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK → Users (rider) |
| `driver_id` | UUID | FK → Users (nullable until accepted) |
| `from_address` | String | Pickup address |
| `from_zip` | String | Pickup zip code |
| `to_address` | String | Drop-off address |
| `to_zip` | String | Drop-off zip code |
| `price` | Decimal | Price set by user |
| `status` | Enum | `PENDING` → `ACCEPTED` → `IN_PROGRESS` → `COMPLETED` / `CANCELLED` |

### Ratings
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `ride_id` | UUID | FK → Rides |
| `rated_by` | UUID | FK → Users |
| `rated_user` | UUID | FK → Users |
| `score` | Int | 1–5 stars |
| `comment` | String | Optional review |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (role: user/driver) |
| POST | `/api/auth/login` | Login → returns JWT |
| GET | `/api/auth/me` | Get current user profile |

### Rides (User)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rides` | Create ride (from, to, price) |
| GET | `/api/rides/my` | User's ride history |
| GET | `/api/rides/:id/drivers` | Available drivers for a ride |
| PUT | `/api/rides/:id/pick-driver` | User picks a driver |
| PUT | `/api/rides/:id/cancel` | Cancel a ride |

### Rides (Driver)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/driver/requests` | Pending ride requests |
| PUT | `/api/driver/requests/:id/accept` | Accept a ride |
| PUT | `/api/driver/requests/:id/reject` | Reject a ride |
| PUT | `/api/rides/:id/complete` | Mark ride complete |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/rides` | All rides (filterable) |
| GET | `/api/admin/users` | All users |
| GET | `/api/admin/drivers` | All drivers + stats |
| GET | `/api/admin/stats` | Dashboard statistics |

---

## Ride Flow

```
  User                          API                         Driver
   │                             │                            │
   ├── POST /rides ────────────► │                            │
   │   (from, to, price)        ├── Save ride (PENDING)      │
   │                             │                            │
   │ ◄── Matching drivers ──────┤                            │
   │                             │                            │
   ├── PUT /pick-driver ───────► │                            │
   │                             ├── Notify driver ─────────► │
   │                             │                            │
   │                             │ ◄── Accept request ────────┤
   │ ◄── Driver accepted! ──────┤                            │
   │     (contact info shared)   │                            │
   │                             │                            │
   │                             │ ◄── Complete ride ─────────┤
   │ ◄── Ride completed ────────┤                            │
   │                             │                            │
   ├── POST /ratings ──────────► │                            │
   │                             │                            │
```

---

## Developer Assignment (4 Developers)

| Dev | Focus Area | Responsibilities |
|-----|-----------|-----------------|
| **Dev 1** | Backend Core | Auth, database schema, Prisma, API scaffolding, middleware |
| **Dev 2** | Backend Features | Ride CRUD, driver matching, ratings, Socket.IO |
| **Dev 3** | Frontend — User & Driver | User portal, driver portal, map integration |
| **Dev 4** | Frontend — Admin & Shared | Admin dashboard, shared components, deployment |

---

## Sprint Plan (8 Weeks)

### Sprint 1 — Foundation (Weeks 1–2)

| Dev | Tasks |
|-----|-------|
| **Dev 1** | Monorepo setup, Prisma schema, DB migrations, auth endpoints, middleware |
| **Dev 2** | Express project structure, basic ride CRUD, input validation |
| **Dev 3** | Next.js setup, design tokens, auth pages (login/register), navigation |
| **Dev 4** | Shared component library, Docker Compose for local dev |

> ✅ **Milestone**: Users can register, log in, and see a dashboard shell.

### Sprint 2 — Core Features (Weeks 3–4)

| Dev | Tasks |
|-----|-------|
| **Dev 1** | User & driver profile APIs, driver profile CRUD, RBAC |
| **Dev 2** | Driver matching by zip code, ride request flow, status transitions |
| **Dev 3** | Ride creation form with map (Leaflet), address input, ride history |
| **Dev 4** | Admin dashboard — user list, driver list with stats, ride table |

> ✅ **Milestone**: Full ride creation → driver matching → acceptance flow works E2E.

### Sprint 3 — User Picks Driver & Realtime (Weeks 5–6)

| Dev | Tasks |
|-----|-------|
| **Dev 1** | Ratings API, driving history aggregation, Socket.IO backend |
| **Dev 2** | User picks driver feature, ride notifications |
| **Dev 3** | Driver portal — incoming requests, accept/reject, active ride, contact exchange |
| **Dev 4** | Admin stats (charts), ride filters, driver approval workflow |

> ✅ **Milestone**: User browses drivers, picks one, driver accepts. Admin sees everything.

### Sprint 4 — Polish & Deploy (Weeks 7–8)

| Dev | Tasks |
|-----|-------|
| **Dev 1** | API hardening, error handling, rate limiting, seed scripts |
| **Dev 2** | E2E testing, API integration tests, bug fixes |
| **Dev 3** | Responsive design, loading states, error boundaries, UX polish |
| **Dev 4** | CI/CD (GitHub Actions), deployment to Render/Vercel, documentation |

> ✅ **Milestone**: Deployed, working POC ready for 100 users.

---

## Infrastructure (Low-Cost)

| Service | Provider | Cost |
|---------|----------|------|
| Frontend hosting | Vercel | **Free** |
| Backend API | Render | **Free** |
| PostgreSQL | Neon | **Free** (0.5 GB) |
| CI/CD | GitHub Actions | **Free** (public repos) |
| Domain | Optional | ~$12/year |

**Estimated monthly cost for POC: $0 – $12**

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- Docker Desktop

### Setup

```bash
# Clone the repo
git clone https://github.com/<your-org>/DollarToGo.git
cd DollarToGo

# Install dependencies
npm install

# Start local database
docker compose up -d

# Run database migrations
cd apps/api && npx prisma migrate dev

# Start development servers
npm run dev
# Frontend → http://localhost:3000
# Backend  → http://localhost:4000
```

---

## Future Enhancements

- 💳 Payment integration (Stripe)
- 📍 Real-time GPS tracking
- 📱 Push notifications / PWA
- 🤖 Advanced matching algorithm (rating + distance + price)
- 📄 Driver document verification
- 🕐 Scheduled rides
- 💬 In-app messaging

---

## Contributing

We're a small team building this in the open. Contributions, feedback, and ideas are welcome!

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT — see [LICENSE](LICENSE) for details.
