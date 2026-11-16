FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA — MINISTRY OF AGRICULTURE
MoA Staff Gym Management System (MoA-Gym)
Software Requirements, System Architecture & Full-Stack Implementation Specification (React + NestJS + PostgreSQL)
Project Codemoa-gym
Target OrganizationMinistry of Agriculture (MoA)
ArchitectureModular Monolith (Docker)
Tech StackReact 19 + NestJS 12 + PG 16
Access ModelInternal Staff Only (No Billing)
Gate HardwareZero Special Hardware (Browser QR)
Primary BrandingMoA Green / Gold / Blue
Document Version1.0 (AI-Editor Ready)
1. System Overview & Core Business Rules
MoA-Gym is an internal web application built for the Federal Democratic Republic of Ethiopia — Ministry of Agriculture (MoA) to digitize employee gym onboarding, health and liability compliance, entrance access verification, daily locker tracking, group fitness scheduling, and live facility occupancy monitoring.
Zero Billing or Commercial Logic: No payment gateways, invoicing, receipts, or paid membership plans. Facility access is an internal employee wellness benefit.
Strict Employee Whitelist Eligibility: Only active MoA employees present in the HR-approved staff roster may self-register or enter the gym.
Zero Specialized Hardware Required: Front-desk verification operates entirely through a standard web browser on any laptop, tablet, or desktop PC with a camera, paired with a manual Employee ID lookup fallback.
On-Premise / Intranet Resilience: Packaged as a self-contained Docker Compose stack with zero reliance on external paid cloud APIs so it runs reliably on the Ministry's internal network.
2. Official MoA Branding & Visual Identity
The user interface must reflect the official institutional identity of the Ministry of Agriculture, incorporating its tri-color circular emblem (sun/harvest gold, agricultural green, and water/irrigation deep blue) alongside bilingual Amharic and English headers.
Institutional Header & Footer: Display the official MoA circular emblem (/frontend/public/moa-logo.png) with a built-in React SVG fallback (<MoaLogo/>) for offline intranet use. Header displays bilingual institutional titles and 'Staff Wellness & Fitness Center (MoA-Gym)'. Footer displays '© 2026 Federal Democratic Republic of Ethiopia – Ministry of Agriculture. Internal Staff Portal.'
Top Emblem Accent Bar: Include a 4px gradient bar at the very top of the viewport transitioning across #F5B81C (Gold) -> #0B7A3B (Green) -> #145B8C (Blue).
Bilingual Typography: Configure 'Inter' for English UI controls paired with 'Noto Sans Ethiopic' so Amharic employee names and directorate titles render clearly.
Design Token
Emblem Meaning
Hex Code
Primary UI Application
moa-green
Center agricultural bands
#0B7A3B
Primary buttons, active tabs, APPROVED gate status, headers
moa-green-dark
Deep leaf accent
#07572A
Sidebar navigation background, button hover states
moa-gold
Top sun & harvest bands
#F5B81C
Highlights, UNREGISTERED / PENDING WAIVER alerts, focus rings
moa-blue
Bottom water & irrigation
#145B8C
Secondary actions, occupancy progress bars, info cards
moa-surface
Institutional neutral
#F7F9F8
Main app canvas background (#FFFFFF for card surfaces)
moa-danger
Status alert
#DC2626
DENIED / INACTIVE gate alerts, out-of-order equipment tags
3. Actors & Role-Based Access Control (RBAC)
System Role
Actor Description
Core Responsibilities & Permissions
STAFF_MEMBER
MoA Employee
Claims account via Employee ID; completes mandatory PAR-Q health screening & liability waiver; views live gym occupancy; displays refreshing QR Entry Pass; books group classes.
GYM_ATTENDANT
Front-Desk Staff / Trainer
Scans staff QR passes or searches by Employee ID; visually matches staff photo/ID badge; logs check-ins/outs; assigns daily lockers; creates classes; reports broken equipment.
HR_ADMIN
HR / Facility Officer
Uploads/updates eligible MoA staff roster via CSV; activates/deactivates staff eligibility; configures max gym capacity & waiver text; exports utilization analytics.
SYSTEM_CRON
Automated Scheduler
Runs nightly at 23:59 to auto-checkout unclosed sessions, flag unreturned lockers as overdue, and reset live occupancy to 0 for the next morning.
4. Tech Stack & Monorepo Architecture
Runtime & Containers: Node.js v22 LTS, PostgreSQL 16, orchestrated via Docker Compose (postgres, backend, and frontend Nginx reverse proxy).
Backend (/backend): NestJS v12 (TypeScript), Prisma ORM v7, @nestjs/jwt + Passport RBAC Guards, @nestjs/schedule, @nestjs/swagger (/api/docs), class-validator DTOs, and csv-parse.
Frontend (/frontend): React v19 + Vite + TypeScript, Tailwind CSS, React Router v7, @tanstack/react-query (15-second occupancy polling), html5-qrcode (camera scanner), and qrcode.react (staff QR pass).
4.1 Repository Directory Structure
moa-gym/├── docker-compose.yml├── SPEC.md├── backend/│   ├── Dockerfile│   ├── prisma/│   │   ├── schema.prisma│   │   └── seed.ts│   └── src/│       ├── main.ts│       ├── app.module.ts│       ├── prisma/          # Global PrismaService module│       ├── auth/            # Login, Employee account claim, JWT + RolesGuard│       ├── hr-roster/       # CSV bulk upsert, employee eligibility status│       ├── users/           # Profile, PAR-Q & Waiver signing, rotating QR token│       ├── attendance/      # Gate verification, check-in/out, occupancy, 23:59 cron│       ├── lockers/         # Locker inventory & check-in/out assignment coupling│       ├── wellness/        # Group classes, bookings, equipment issue log│       └── reports/         # HR utilization aggregations & CSV export└── frontend/    ├── Dockerfile    ├── nginx.conf    ├── public/moa-logo.png    └── src/        ├── components/      # MoaHeader, MoaLogo (SVG fallback), OccupancyBanner, RoleGuard        ├── pages/        │   ├── auth/        # LoginPage, RegisterClaimPage        │   ├── staff/       # OnboardingWaiverPage, StaffDashboardPage        │   ├── desk/        # CheckInTerminalPage, ActiveFloorPage, ClassesPage        │   └── admin/       # HrRosterPage, AnalyticsPage, SettingsPage        └── lib/             # API client, AuthContext, TypeScript DTO interfaces
5. Automated Entrance Verification Logic
Entrance access is controlled by a two-step gate combining automated database validation (POST /api/attendance/verify) with physical visual verification by the Gym Attendant:
Anti-Screenshot Rotating QR Pass: The staff dashboard requests GET /api/users/me/qr-pass every 45 seconds to obtain a short-lived signed JWT (exp: 60s) encoding { employeeId, userId, type: 'GYM_PASS' }.
Step 1 — Cryptographic Token Check: Verify JWT signature and expiration. Reject expired or tampered tokens with 401 (DENIED: EXPIRED_OR_INVALID_QR).
Step 2 — HR Whitelist Check: Query HrEmployeeRoster by employeeId. If missing or employmentStatus != ACTIVE, reject with 403 (DENIED: NOT_ACTIVE_EMPLOYEE).
Step 3 — Account Claim Check: If userAccount is null, return 200 with status: UNREGISTERED and employee preview (Name, Department) so the attendant can guide on-the-spot self-registration.
Step 4 — Waiver Compliance Check: If waiverSigned == false, reject with 403 (DENIED: WAIVER_NOT_SIGNED).
Step 5 — Duplicate & Capacity Check: If an open Attendance record exists (checkOutTime == null), return 409 (DENIED: ALREADY_CHECKED_IN). If active floor count >= SystemConfig.maxCapacity, return 429 (DENIED: GYM_AT_MAX_CAPACITY).
Step 6 — Approve & Identity Match: Create Attendance record, return 200 (APPROVED) with employee photo, name, directorate, and available lockers. The attendant visually confirms the person matches the photo/MoA ID badge and optionally assigns a locker.
6. PostgreSQL Database Schema (Prisma ORM)
generator client {  provider = "prisma-client-js"}datasource db {  provider = "postgresql"  url      = env("DATABASE_URL")}enum Role { HR_ADMIN GYM_ATTENDANT STAFF_MEMBER }enum EmploymentStatus { ACTIVE INACTIVE SUSPENDED }enum LockerStatus { AVAILABLE OCCUPIED MAINTENANCE }enum IssueStatus { OPEN IN_PROGRESS RESOLVED }model HrEmployeeRoster {  employeeId       String           @id  fullName         String  department       String  phone            String  email            String?  photoUrl         String?  employmentStatus EmploymentStatus @default(ACTIVE)  syncedAt         DateTime         @updatedAt  userAccount      User?}model User {  id                    String           @id @default(uuid())  employeeId            String           @unique  hrRecord              HrEmployeeRoster @relation(fields: [employeeId], references: [employeeId])  passwordHash          String  role                  Role             @default(STAFF_MEMBER)  waiverSigned          Boolean          @default(false)  waiverSignedAt        DateTime?  parqResponses         Json?  emergencyContactName  String?  emergencyContactPhone String?  createdAt             DateTime         @default(now())  updatedAt             DateTime         @updatedAt  attendanceLogs        Attendance[]  classBookings         ClassBooking[]}model Attendance {  id            String    @id @default(uuid())  userId        String  user          User      @relation(fields: [userId], references: [id])  checkInTime   DateTime  @default(now())  checkOutTime  DateTime?  lockerNumber  String?  checkedInById String?  autoClosed    Boolean   @default(false)}model Locker {  id             String       @id @default(uuid())  lockerNumber   String       @unique  status         LockerStatus @default(AVAILABLE)  assignedUserId String?}model WellnessClass {  id             String         @id @default(uuid())  title          String  instructorName String  scheduledDate  DateTime  startTime      String  endTime        String  capacity       Int  bookings       ClassBooking[]}model ClassBooking {  id        String        @id @default(uuid())  classId   String  class     WellnessClass @relation(fields: [classId], references: [id])  userId    String  user      User          @relation(fields: [userId], references: [id])  attended  Boolean       @default(false)  createdAt DateTime      @default(now())  @@unique([classId, userId])}model EquipmentIssue {  id            String      @id @default(uuid())  equipmentName String  description   String  status        IssueStatus @default(OPEN)  reportedAt    DateTime    @default(now())  resolvedAt    DateTime?}model SystemConfig {  id          Int    @id @default(1)  maxCapacity Int    @default(40)  waiverText  String}
7. AI Code Editor Incremental Build Plan
Provide this specification to your AI code editor (e.g., Cursor, Claude Code, Antigravity) and execute in four sequential prompts:
Phase 1 — Monorepo & Database Seed: Initialize /backend (NestJS 12 + Prisma 7 + Swagger) and /frontend (React 19 + Vite + Tailwind with MoA color tokens and Noto Sans Ethiopic) plus docker-compose.yml. Implement schema.prisma and prisma/seed.ts with 1 HR_ADMIN, 1 GYM_ATTENDANT, 15 HrEmployeeRoster rows, 30 lockers (L-01 to L-30), and default SystemConfig.
Phase 2 — NestJS Core APIs & Cron: Build AuthModule, HrRosterModule (CSV import), UsersModule (PAR-Q + waiver + rotating QR JWT), AttendanceModule (6-step verification + 23:59 auto-checkout cron), LockersModule, WellnessModule, and ReportsModule with DTO validation and Role Guards.
Phase 3 — Staff & Attendant Interfaces: Build the MoA-branded layout (bilingual header, 3-color top stripe, SVG logo fallback, live OccupancyBanner), Staff Onboarding Waiver gate + QR Pass view, and Attendant Split-Screen Check-In Terminal (html5-qrcode + manual ID lookup + locker assignment + floor checkout).
Phase 4 — HR Portal & End-to-End Test: Build the HR CSV Roster Uploader, Directorate & Peak-Hour Analytics dashboard with CSV export, and SystemConfig settings page. Verify Docker startup and full registration -> waiver -> check-in -> locker -> check-out lifecycle.
