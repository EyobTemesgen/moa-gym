# MoA Staff Gym Management System (`moa-gym`)
> **Federal Democratic Republic of Ethiopia — Ministry of Agriculture (MoA)**  
> **Staff Wellness & Fitness Center Management System**

![MoA Branding](frontend/public/moa-logo.png)

---

## 1. Overview & Core Business Rules

**MoA-Gym** is an internal, on-premise resilient web application engineered for the Ministry of Agriculture (MoA) to digitize staff fitness center access, health screening compliance, daily locker tracking, group fitness scheduling, and live facility occupancy.

- **Zero Billing or Commercial Logic**: Facility access is an internal employee wellness benefit. No payments, invoices, or subscriptions.
- **Strict HR Whitelist Eligibility**: Only active MoA employees registered on the HR-approved staff roster may self-register or enter the gym.
- **Zero Specialized Hardware Required**: Front-desk verification runs through a standard web browser camera (`html5-qrcode`) paired with a manual MoA Employee ID fallback.
- **Anti-Screenshot Rotating QR Pass**: Staff mobile passes automatically refresh signed JWT tokens every 45 seconds (60-second expiration) with watermarks to prevent screenshot fraud.
- **On-Premise / Intranet Resilience**: Completely self-contained Docker Compose stack (`PostgreSQL 16`, `NestJS 12`, `React 19 + Nginx`) requiring zero external cloud dependencies.
- **Official Institutional Branding**: MoA tri-color gradient accent bar (`#F5B81C` Gold -> `#0B7A3B` Green -> `#145B8C` Blue), circular emblem with offline SVG fallback, and bilingual typography (Amharic & English).

---

## 2. Tech Stack

- **Backend**: NestJS v11/v12, Prisma ORM v6, PostgreSQL 16, JWT & Passport RBAC, `@nestjs/schedule` (nightly 23:59 auto-checkout cron), Swagger OpenAPI (`/api/docs`), `class-validator`, `csv-parse`.
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, TanStack React Query (15s live polling), React Router v7, `html5-qrcode`, `qrcode.react`, Lucide icons.
- **Containerization**: Docker Compose with multi-stage builds and Nginx reverse proxy.

---

## 3. Pre-Seeded Default Accounts

| Role | Name | Identifier / Email | Default Password |
|---|---|---|---|
| **HR_ADMIN** | Dr. Girma Bekele | `EMP-ADM-01` / `admin@moa.gov.et` | `Password123!` |
| **GYM_ATTENDANT** | Tigist Alemayehu | `EMP-DSK-01` / `desk@moa.gov.et` | `Password123!` |
| **STAFF_MEMBER (Active)** | Dawit Yohannes | `EMP-MOA-001` / `dawit.y@moa.gov.et` | `Password123!` |
| **STAFF_MEMBER (Pending Waiver)** | Selamawit Kebede | `EMP-MOA-002` / `selamawit.k@moa.gov.et` | `Password123!` |
| **STAFF_MEMBER (Unclaimed Roster)** | Mulugeta Tadesse | `EMP-MOA-003` | *(Self-claim via `/claim`)* |

---

## 4. Port Allocations & Setup

To prevent port conflicts with other MoA projects (`asset-tracking-system` and `procurement-tracking-system`), the ports are allocated as:

- **Frontend (Nginx / Vite)**: `http://localhost:3005`
- **Backend API (NestJS)**: `http://localhost:5005`
- **Swagger Documentation**: `http://localhost:5005/api/docs`
- **PostgreSQL Database**: Port `5436` (internal `5432`)

### Running with Docker Compose

```bash
docker compose up -d --build
```

To run Prisma migrations & seed:
```bash
docker compose exec backend npm run prisma:migrate
docker compose exec backend npm run prisma:seed
```

---

## 5. Automated 6-Step Gate Verification Workflow

1. **Cryptographic Token Check**: Validates signature and non-expiration of presented QR pass JWT (`exp: 60s`).
2. **HR Whitelist Check**: Queries `HrEmployeeRoster`. If missing or status != `ACTIVE`, rejects with `NOT_ACTIVE_EMPLOYEE`.
3. **Account Claim Check**: If user has not created a password, returns `UNREGISTERED` with employee profile preview for assisted self-registration.
4. **Waiver Compliance Check**: Confirms PAR-Q health questionnaire and liability agreement have been submitted.
5. **Duplicate & Capacity Check**: Rejects if already checked in or if floor count >= `maxCapacity`.
6. **Physical Confirmation & Approval**: Front-desk attendant verifies face/badge against photo on screen, selects optional daily locker (`L-01` to `L-30`), and authorizes entrance.

---

## 6. Nightly Auto-Checkout Cron

At **23:59 EAT** every evening:
- An automated cron job closes all active attendance sessions (`checkOutTime = now`, `autoClosed = true`).
- All held lockers are released back to `AVAILABLE`.
- Live gym floor count safely resets to 0 for the following morning.

---

© 2026 Federal Democratic Republic of Ethiopia – Ministry of Agriculture. Internal Staff Portal.
