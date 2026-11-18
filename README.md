# Ministry of Agriculture (MoA) — Staff Gym Management System

> **Official internal management system for the Ministry of Agriculture Staff Wellness & Fitness Center.**  
> Built strictly following the MoA Design System (`#00843D` Green, `#FCDD09` Gold, `#07572A` Deep Green).

---

## 1. Facility Specifications

| Parameter | Specification |
|---|---|
| **Facility** | Single Main Fitness Room (Ministry Headquarters) |
| **Working Sessions** | **Morning Session:** 06:00 AM – 08:30 AM (*ከማለዳው 12:00 – 2:30*)<br/>**Evening Session:** 05:30 PM – 09:00 PM (*ከምሽቱ 11:30 – 3:00*) |
| **Weekend Schedule** | **Saturday:** Open (Normal sessions)<br/>**Sunday:** Closed for sanitization and maintenance |
| **Lockers** | 30 Daily Lockers (`L-01` to `L-30`), assigned upon entrance scan, reset nightly at 23:59 |
| **Membership Fee** | **Internal MoA Staff:** 100% Free (Institutional Wellness Benefit)<br/>**External Members:** Monthly tiered subscription |
| **Workout Guidance** | Self-guided workouts supported by step-by-step video guides in Amharic & English |

---

## 2. Pre-Seeded Default Accounts

All default passwords: **`Password123!`**

| Role | Name | Identifier / Email | Default Landing | Primary Responsibilities |
|---|---|---|---|---|
| **ADMIN** | Dr. Girma Bekele | `EMP-ADM-01` / `admin@moa.gov.et` | `/admin/dashboard` | Directorate analytics, membership records, user RBAC, reports |
| **GYM_ATTENDANT** | Tigist Alemayehu | `EMP-DSK-01` / `desk@moa.gov.et` | `/terminal` | Fast-lane QR check-in & 30-locker assignment |
| **STAFF_MEMBER** | Dawit Yohannes | `EMP-MOA-001` / `dawit.y@moa.gov.et` | `/dashboard` | Personal digital QR entry pass, timetable & video guides |

---

## 3. Core Capabilities by Role

### 1. Staff Members (`STAFF_MEMBER`)
* **Self-Registration (`/signup` & `/claim`)**: Fast intake pre-checked against HR whitelist. Free institutional wellness benefit with zero payment step.
* **Personal Digital Entry Pass (`/dashboard`)**: High-contrast, offline-capable scannable QR code and barcode with live occupancy meter.
* **Gym Timetable (`/schedule`)**: Real-time open/closed status for morning (6:00 – 8:30 AM) and evening (5:30 – 9:00 PM) working sessions.
* **Exercise Video Guides (`/guides`)**: Equipment form, safe lifting techniques, and desk worker mobility routines in Amharic and English.

### 2. Front Desk Attendants (`GYM_ATTENDANT`)
* **Gate Terminal (`/terminal`)**: Fast-lane check-in with 2-second keyboard flow (`[Enter]` verify $\rightarrow$ `[Enter]` check-in). Auto-assigns available locker.
* **Locker Control (`/floor`)**: Live grid of all 30 lockers (`L-01` to `L-30`). View active occupants, release lockers, or perform manual reassignment.

### 3. Executive Administrators (`ADMIN` / `HR_ADMIN`)
* **Executive Dashboard (`/admin/dashboard`)**: Directorate wellness engagement metrics, live floor count, and session preference distribution.
* **Membership (`/registrations`)**: Search and manage members, import staff rosters via Excel/CSV, print official A4 membership cards.
* **User Management (`/admin/users`)**: Role-based access control (RBAC), password resets, and account status management.
* **Attendance Reports (`/reports`)**: Date-range attendance analytics, peak utilization graphs, and exportable CSV audit records.

---

## 4. Quick Start & Setup

### Environment & Ports

| Service | Port / URL | Description |
|---|---|---|
| **Frontend** | `http://localhost:3005` | React 19 + Vite + Tailwind CSS |
| **Backend API** | `http://localhost:5005` | NestJS 11 + Prisma ORM 6 |
| **API Documentation** | `http://localhost:5005/api/docs` | Swagger OpenAPI specification |
| **PostgreSQL** | Port `5436` (internal `5432`) | Database container (`moa-gym-db`) |

### Run with Docker Compose

```bash
# 1. Start all containers (Database, Backend, Frontend)
docker-compose up -d --build

# 2. Apply database migrations and seed default data
docker-compose exec backend npm run prisma:migrate
docker-compose exec backend npm run prisma:seed
```

### Local Development Setup

```bash
# Backend
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev

# Frontend
cd frontend
npm install
npm run dev
```

---

## 5. Technology Stack

* **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, TanStack Query, React Router v7, Lucide Icons, `html5-qrcode`.
* **Backend**: NestJS v11, TypeScript, Prisma ORM v6, PostgreSQL 16, JWT & Passport RBAC, `@nestjs/schedule` (auto-reset cron).
* **Infrastructure**: Docker Compose, Nginx, Multi-stage builds.

---

© 2026 Ministry of Agriculture (MoA) · Staff Wellness & Fitness Center
