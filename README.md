# MoA Staff Gym Management System (`moa-gym`)
> **Federal Democratic Republic of Ethiopia — Ministry of Agriculture (MoA)**  
> **Staff Wellness & Fitness Center Management System**

![MoA Branding](frontend/public/moa-logo.png)

---

## 1. Overview & Core Pillars

**MoA-Gym** is an internal, resilient web application designed for the Ministry of Agriculture to streamline staff gym enrollment, gate verification, daily locker tracking, and facility utilization.

Aligned with the MoA Design Standard (`#00843D` primary, institutional gold `#FCDD09`, clean typography):

1. **Staff Registration (`/registrations`) — Exclusive to `ADMIN`**:
   * **Single Staff Intake**: Search MoA HR roster for instant auto-fill, or type manually.
   * **Photo Capture**: Auto-sync from HR, local file upload (`.jpg`/`.png`), or live desk webcam snapshot.
   * **Bulk Spreadsheet Import**: Drag-and-drop `.xlsx` (Excel) and `.csv` files with automatic English & Amharic column mapping, row validation preview, and downloadable template.
   * **Clean Master Roster**: 6-column table (`Full Name`, `Directorate`, `Employee ID`, `Enrolled Date`, `Status`, `Action`) optimized for standard displays with zero horizontal scrolling.
   * **Reporting & Export**: Official A4 Printable Master Roster with Ministry letterhead and full CSV export.

2. **Gate Checking Fast Lane (`/terminal`) — Exclusive to `GYM_ATTENDANT`**:
   * **Employee ID Fast Lane**: Attendant simply asks for Employee ID or Name. Cursor is auto-focused for instant typing.
   * **2-Press Keyboard Flow**: `[Enter]` to verify $\rightarrow$ `[Enter]` to confirm check-in with auto-assigned locker (`L-01` to `L-30`). Takes 1.5 seconds.
   * **Visual Verification**: Shows employee's official photo, full name, and directorate on screen.
   * **Integrated Active Floor Roster**: Live list of currently present staff with 1-click **Check-Out** when returning locker keys.
   * **Camera Scanner Option**: Optional webcam QR scanner toggle for digital mobile passes.

3. **Staff Member Digital Access (`/dashboard`) — Exclusive to `STAFF_MEMBER`**:
   * **Permanent Digital Member Card**: Official institutional badge with photo, directorate, and employee ID.
   * **Static Offline QR Code**: Works without internet or mobile data; screenshot-friendly and printable.
   * **Live Facility Meter**: Real-time gym occupancy gauge so staff can check crowd levels before visiting.

4. **Reports & Analytics (`/reports`) — Exclusive to `ADMIN`**:
   * Real-time facility occupancy metrics and peak attendance hours.
   * Directorate participation breakdown.
   * Filtered attendance logs exported to CSV.

---

## 2. Tech Stack

* **Backend**: NestJS v11/v12, Prisma ORM v6, PostgreSQL 16, JWT & Passport RBAC, `@nestjs/schedule` (auto-checkout timer), Swagger OpenAPI (`/api/docs`).
* **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, TanStack React Query, React Router v7, `html5-qrcode`, `qrcode.react`, `read-excel-file`, Lucide icons.
* **Containerization**: Docker Compose with multi-stage builds and Nginx reverse proxy.

---

## 3. Pre-Seeded Default Accounts

| Role | Name | Identifier / Email | Default Password | Primary Screen |
|---|---|---|---|---|
| **ADMIN** | Dr. Girma Bekele | `EMP-ADM-01` / `admin@moa.gov.et` | `Password123!` | `/registrations` & `/reports` |
| **GYM_ATTENDANT** | Tigist Alemayehu | `EMP-DSK-01` / `desk@moa.gov.et` | `Password123!` | `/terminal` (Gate Fast Lane) |
| **STAFF_MEMBER** | Dawit Yohannes | `EMP-MOA-001` / `dawit.y@moa.gov.et` | `Password123!` | `/dashboard` (Digital Pass) |

---

## 4. Port Allocations & Setup

* **Frontend (React / Nginx)**: `http://localhost:3005`
* **Backend API (NestJS)**: `http://localhost:5005`
* **Swagger API Docs**: `http://localhost:5005/api/docs`
* **PostgreSQL Database**: Port `5436` (internal `5432`)

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

## 5. Daily Gate Operations (Check-In & Check-Out)

* **Check-In**:
  1. Staff member gives their MoA Employee ID (e.g. `EMP-MOA-001`) or shows their badge.
  2. Attendant presses `[Enter]` to verify $\rightarrow$ system checks active membership and pre-selects an available locker.
  3. Attendant presses `[Enter]` to confirm $\rightarrow$ entrance authorized, locker assigned, occupancy count +1.

* **Check-Out**:
  1. Staff member returns locker key when leaving.
  2. Attendant clicks **Check Out** on their name in the active floor list (or re-enters ID).
  3. Locker is returned to `AVAILABLE` and occupancy count -1.
  * *(A background timer automatically closes any forgotten sessions after 2 hours).*

---

© 2026 Federal Democratic Republic of Ethiopia – Ministry of Agriculture. Internal Staff Portal.
