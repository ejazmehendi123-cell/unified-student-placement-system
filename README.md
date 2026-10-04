# USPS — Unified Student Placement System

---

## Table of Contents

- [Overview](#-overview)
- [Live Demo and Credentials](#-live-demo-and-credentials)
- [System Architecture](#-system-architecture)
- [Feature Breakdown by Role](#-feature-breakdown-by-role)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Security Architecture](#-security-architecture)
- [Data Model](#-data-model)
- [Eligibility Engine](#-eligibility-engine)
- [Real-Time Notifications](#-real-time-notifications)
- [Seed Data](#-seed-data)
- [Running Tests](#-running-tests)
- [Supabase and Production Deployment](#-supabase-and-production-deployment)
- [Design System](#-design-system)
- [Contributing](#-contributing)
- [License](#-license)

---

## Overview

**USPS (Unified Student Placement System)** is a production-ready enterprise platform that digitises and governs the entire campus recruitment lifecycle for Indian universities. It replaces fragmented spreadsheets and manual processes with a secure, role-segregated, audit-compliant digital system.

### What it solves

| Problem | USPS Solution |
|---|---|
| Students unaware of eligible drives | Real-time 7-factor eligibility engine with instant breakdown |
| Recruiter-TPO drive approval friction | Digital drive creation wizard + structured approval workflow |
| Single-Offer Policy violations | Atomic enforcement with TPO override mechanism |
| Missing audit trails | Immutable audit ledger with actor, IP, diff, and timestamp |
| Academic data silos | Integrated SIS (Student Information System) batch sync |
| Leadership reporting gaps | Automated department and company analytics dashboards |

---

## 🚀 Live Demo and Credentials

### ✅ Prerequisites

| Tool | Minimum Version | Check |
|------|----------------|-------|
| Node.js | v18+ | `node -v` |
| npm | v9+ | `npm -v` |

### Option A — Run Everything Together (Recommended)

```powershell
# From project root
npm install
npm run dev
```

Both backend (port 5000) and frontend (port 5173) start concurrently.

### Option B — Two Terminals

**Terminal 1 — Backend API Server**

```powershell
cd "c:\Projects\The USPS\backend"
npm install
npm run dev
```

Expected output:
```
🚀 USPS Backend Server running on http://localhost:5000
🏛️  Platform: Unified Student Placement System (USPS)
🛡️  Security: Helmet, CORS, Rate-Limiting, Strict RBAC Active
```

**Terminal 2 — Frontend Dev Server**

```powershell
cd "c:\Projects\The USPS\frontend"
npm install
npm run dev
```

Expected output:
```
VITE v6.x  ready in ~400ms
➜  Local:   http://localhost:5173/
```

### 🌐 Open in Browser

**→ http://localhost:5173**

> **Tip:** The Login page has **one-click demo role cards** — simply click a card to auto-fill credentials.

### 👥 Demo Login Credentials

All accounts use password: **`DemoPass@2026`**

| Role | Email | Password | Portal |
|------|-------|----------|--------|
| Student | `student@usps.demo` | `DemoPass@2026` | `/student/dashboard` |
| Recruiter | `recruiter@usps.demo` | `DemoPass@2026` | `/recruiter/dashboard` |
| TPO Admin | `admin@usps.demo` | `DemoPass@2026` | `/admin/dashboard` |
| Dean / Leadership | `leadership@usps.demo` | `DemoPass@2026` | `/leadership/dashboard` |

### Available npm Scripts (Root)

| Command | Description |
|---|---|
| `npm run dev` | Start both backend and frontend concurrently |
| `npm run dev:backend` | Start backend only |
| `npm run dev:frontend` | Start frontend only |
| `npm run build` | Production build for both |
| `npm test` | Run backend Jest integration tests |
| `npm run seed` | Re-seed the in-memory data store |

---

## System Architecture

```
+------------------------------------------------------------------+
|                         USPS Platform                            |
+----------------------+-------------------------------------------+
|      FRONTEND        |              BACKEND                      |
|   React 18 + Vite 6  |       Node.js 18 + Express 4             |
|   TypeScript 5       |       TypeScript 5                        |
|   TailwindCSS 3      |       JWT Auth + bcrypt                   |
|   React Query 5      |       Socket.IO 4 (WebSocket)             |
|   Recharts           |       Zod Request Validation              |
|   Socket.IO Client   |       Helmet + Rate-Limiting              |
|   React Router v7    |       PDFKit (Certificate Gen)            |
|   React Hook Form    |       Multer (File Upload)                |
+----------------------+--------------------+----------------------+
|       In-Memory DataStore (Dev)          |    Supabase          |
|  35 Students, 8 Companies, 6 Drives      |    PostgreSQL        |
|  15+ Applications, 8 Interview Rounds    |    (Production)      |
|  5 Offers, 3 Notifications pre-seeded    |    + RLS Policies    |
+------------------------------------------+----------------------+
```

### Request Lifecycle

```
Browser  -->  Vite Dev Proxy  -->  Express API
                                   |
                                   --> authenticate() middleware
                                   --> RBAC requireRole() check
                                   --> Zod schema validation
                                   --> Service Layer (business logic)
                                   --> DataStore / Supabase (data)
                                   --> AuditService.logAction()
                                   --> NotificationService.send() --> Socket.IO
                                   <-- JSON Response { success, data, meta.requestId }
```

---

## Feature Breakdown by Role

### 🎓 Student Portal

| Feature | Description |
|---|---|
| **Dashboard** | Placement readiness score, stat cards (CGPA, drives, applications, interviews), active pipeline with live stepper |
| **Profile Wizard** | 5-step guided profile: Personal Info > Academics (5 semesters) > Skills > Projects > Certifications |
| **Resume Upload** | PDF enforcement with magic-byte verification (max 5MB), server-side MIME validation |
| **Drive Browser** | All open drives with real-time 7-factor eligibility evaluation per drive |
| **Eligibility Detail** | Per-drive breakdown: CGPA, Backlogs, Branch, Profile, Policy, Deadline, Drive Status |
| **Application Management** | Apply with duplicate prevention, withdraw applications, full status history timeline |
| **Interviews** | Upcoming interview rounds with meeting links, schedule, and mode (Online/Offline) |
| **Offers** | View extended offers, accept/decline under Single-Offer Policy enforcement |
| **Placement Certificate** | Dynamically generated PDF clearance certificate via PDFKit |

**Routes:** `/student/dashboard` | `/student/profile` | `/student/drives` | `/student/applications` | `/student/interviews` | `/student/offers`

### 🏢 Recruiter Portal

| Feature | Description |
|---|---|
| **Dashboard** | KPI cards: total drives, applicant pool size, shortlist rate, pending interviews |
| **Drive Wizard** | Multi-step drive creation: Job Details > Eligibility Criteria > Schedule > Submit for TPO Approval |
| **Drive Management** | View all drives with live status: DRAFT / PENDING_APPROVAL / OPEN / CLOSED / REJECTED |
| **Applicant Management** | Full candidate table with search, branch/CGPA filters, shortlist/reject actions |
| **Interview Scheduling** | Schedule Technical/HR rounds with date, venue, meeting URL, student instructions |
| **Offer Issuance** | Issue formal placement offers with CTC package to selected candidates |
| **Shortlist Export** | Authorized CSV download of shortlisted candidates |

**Routes:** `/recruiter/dashboard` | `/recruiter/drives` | `/recruiter/drives/new` | `/recruiter/applicants` | `/recruiter/interviews`

### 🛡️ TPO Admin Portal

| Feature | Description |
|---|---|
| **Admin Dashboard** | Platform-wide KPIs, pending approvals queue, recent audit events |
| **Drive Approvals** | Review recruiter submissions → Approve (opens to students) or Reject (with reason) |
| **Student Directory** | Full university roster: CGPA, backlogs, placement status, profile completion |
| **Eligibility Overrides** | Grant administrative override for a specific student + drive combination |
| **Single-Offer Override** | Grant policy exception allowing a placed student to pursue additional offers |
| **SIS Sync** | Execute batch Student Information System sync (mock integration with registrar API) |
| **Audit Log** | Immutable ledger: actor, role, action, entity, IP, timestamp, data diff |
| **User Management** | View all system users, activate or deactivate accounts |
| **Reports** | Full placement analytics dashboard |

**Routes:** `/admin/dashboard` | `/admin/approvals` | `/admin/students` | `/admin/reports` | `/admin/sis` | `/admin/audit-log` | `/admin/users`

### 👔 Leadership / Dean Dashboard

| Feature | Description |
|---|---|
| **Executive KPIs** | Placement rate, average package, highest CTC, total offers issued |
| **Department Analytics** | Branch-wise placement rates, cohort counts, mean compensation (bar chart) |
| **Company Analytics** | Corporate hiring breakdown, offers per company (bar chart) |
| **Package Distribution** | CTC band histogram across all placed students |
| **CSV Export** | Official placement summary export |

**Routes:** `/leadership/dashboard`

---

## Technology Stack

### Backend

| Layer | Technology | Purpose |
|---|---|---|
| Runtime | Node.js 18+ | JavaScript server runtime |
| Framework | Express 4 | HTTP server and routing |
| Language | TypeScript 5.8 | Full type safety |
| Authentication | jsonwebtoken | Stateless JWT auth tokens |
| Password Hashing | bcryptjs | Secure credential storage (10 salt rounds) |
| Validation | Zod 3 | Runtime request schema validation |
| Real-Time | Socket.IO 4 | WebSocket notification delivery |
| Security | Helmet 8 | 11 HTTP security headers |
| Rate Limiting | express-rate-limit | DDoS and brute-force protection |
| Logging | Morgan | Structured HTTP request logger |
| PDF Generation | PDFKit | Placement certificate generation |
| File Upload | Multer | Resume upload with MIME validation |
| Database | @supabase/supabase-js | Supabase PostgreSQL client (production) |
| Session | cookie-parser | HttpOnly cookie management |
| Testing | Jest + Supertest | API integration test suite |

### Frontend

| Layer | Technology | Purpose |
|---|---|---|
| Build Tool | Vite 6 | Ultra-fast dev server and bundler |
| Framework | React 18 | Component-based UI |
| Language | TypeScript 5.8 | Type-safe components |
| Routing | React Router v7 | Client-side navigation with protected routes |
| State Management | TanStack Query v5 | Server state and caching |
| HTTP Client | Axios | API requests with JWT interceptors |
| Styling | TailwindCSS 3 | Utility-first CSS with custom design tokens |
| Icons | Lucide React | Consistent SVG icon library |
| Charts | Recharts 2 | Placement analytics visualizations |
| Forms | React Hook Form + Zod | Validated form management |
| Real-Time | Socket.IO Client 4 | WebSocket notification listener |

---

## Project Structure

```
The USPS/
+-- package.json                    # Root npm workspace (backend + frontend)
+-- README.md                       # This file
+--
+-- backend/
|   +-- src/
|   |   +-- index.ts                # Server entry: Express + Socket.IO init
|   |   +-- config/
|   |   |   +-- env.ts              # Zod-validated environment schema
|   |   |   +-- supabase.ts         # Supabase client initialization
|   |   +-- types/
|   |   |   +-- index.ts            # Shared domain types (User, Student, Drive, etc.)
|   |   +-- repositories/
|   |   |   +-- dataStore.ts        # In-memory database with full seed data
|   |   +-- middleware/
|   |   |   +-- auth.ts             # JWT authentication middleware
|   |   |   +-- rbac.ts             # Role-Based Access Control
|   |   |   +-- validate.ts         # Zod body + query string validators
|   |   |   +-- rateLimiter.ts      # Rate limiting (general + auth)
|   |   |   +-- errorHandler.ts     # Centralized error handler + X-Request-Id
|   |   +-- services/
|   |   |   +-- authService.ts      # Login, JWT, password, MFA
|   |   |   +-- studentService.ts   # Profile, skills, projects, certifications
|   |   |   +-- eligibilityService.ts   # 7-factor eligibility engine
|   |   |   +-- applicationService.ts   # Apply, withdraw, shortlist, reject
|   |   |   +-- driveService.ts     # Drive CRUD + approval workflow
|   |   |   +-- interviewService.ts # Schedule and retrieve interviews
|   |   |   +-- offerService.ts     # Issue, accept, and decline offers
|   |   |   +-- reportService.ts    # KPI aggregations + CSV export
|   |   |   +-- sisService.ts       # SIS batch sync integration
|   |   |   +-- auditService.ts     # Immutable audit log writer
|   |   |   +-- notificationService.ts  # Socket.IO notification dispatcher
|   |   |   +-- pdfService.ts       # Placement certificate PDF generator
|   |   +-- controllers/
|   |   |   +-- authController.ts
|   |   |   +-- studentController.ts
|   |   |   +-- recruiterController.ts
|   |   |   +-- adminController.ts
|   |   |   +-- reportController.ts
|   |   +-- routes/
|   |   |   +-- index.ts            # /api router mount point
|   |   |   +-- authRoutes.ts       # /api/auth/*
|   |   |   +-- studentRoutes.ts    # /api/students/me/*
|   |   |   +-- recruiterRoutes.ts  # /api/recruiter/*
|   |   |   +-- adminRoutes.ts      # /api/admin/*
|   |   |   +-- reportRoutes.ts     # /api/reports/*
|   |   +-- validators/
|   |       +-- index.ts            # All Zod request body schemas
|   +-- tests/
|   |   +-- api.test.ts             # Jest + Supertest (5 suites, 11 tests)
|   +-- package.json
|   +-- tsconfig.json
|   +-- jest.config.js
+--
+-- frontend/
|   +-- index.html
|   +-- vite.config.ts              # Vite + /api proxy to backend
|   +-- tailwind.config.js          # Custom USPS design tokens
|   +-- src/
|       +-- main.tsx                # React entry point
|       +-- App.tsx                 # Root: QueryClient + AuthProvider + BrowserRouter
|       +-- index.css               # Global styles + Tailwind + custom scrollbar
|       +-- types/index.ts          # Frontend domain types (mirrors backend)
|       +-- hooks/useAuth.tsx        # Auth context: login/logout/switchDemoRole
|       +-- services/api.ts          # Axios instance + all API call namespaces
|       +-- routes/AppRoutes.tsx     # Protected routes + RBAC redirect guard
|       +-- components/
|       |   +-- shell/AppShell.tsx   # Sidebar, top bar, notifications, role switcher
|       |   +-- ui/
|       |       +-- Alert.tsx        # info / success / warning / error variants
|       |       +-- Badge.tsx        # Badge + StatusBadge (application status)
|       |       +-- Button.tsx       # primary / outline / ghost / accent
|       |       +-- Card.tsx         # Card / CardHeader / StatCard
|       |       +-- Modal.tsx        # Modal overlay
|       |       +-- Stepper.tsx      # ApplicationStepper pipeline visualizer
|       +-- features/
|           +-- auth/LoginPage.tsx
|           +-- student/
|           |   +-- StudentDashboard.tsx
|           |   +-- StudentProfileWizard.tsx   # 5-step profile builder
|           |   +-- StudentDrives.tsx           # Drive browser + eligibility
|           |   +-- StudentApplications.tsx
|           |   +-- StudentInterviews.tsx
|           |   +-- StudentOffers.tsx
|           +-- recruiter/
|           |   +-- RecruiterDashboard.tsx
|           |   +-- RecruiterDriveWizard.tsx   # Multi-step drive creation
|           |   +-- RecruiterDrives.tsx
|           |   +-- RecruiterApplicants.tsx    # Applicant management table
|           |   +-- RecruiterInterviews.tsx
|           +-- tpo/
|           |   +-- TPODashboard.tsx
|           |   +-- TPODriveApprovals.tsx
|           |   +-- TPOStudents.tsx
|           |   +-- TPOReports.tsx
|           |   +-- TPOSISSync.tsx
|           |   +-- TPOAuditLog.tsx
|           |   +-- TPOUsers.tsx
|           +-- leadership/
|               +-- LeadershipDashboard.tsx
+--
+-- supabase/migrations/
|   +-- 001_initial_schema.sql       # All core tables
|   +-- 002_functions_and_triggers.sql   # PL/pgSQL automation
|   +-- 003_rls_and_storage.sql      # Row Level Security + storage policies
|   +-- 004_reporting_views.sql      # Analytics materialized views
|   +-- 005_seed_data.sql            # Production seed data
+--
+-- docs/
    +-- API_DOCUMENTATION.md         # Full REST API reference
    +-- banner.jpg                   # Project banner
```

---

## Environment Variables

Backend reads from `backend/.env` (already pre-configured for development).

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | Runtime environment |
| `PORT` | `5000` | Backend HTTP port |
| `JWT_SECRET` | (see env.ts) | JWT signing secret — **change in production** |
| `JWT_EXPIRES_IN` | `15m` | JWT access token expiry |
| `REFRESH_TOKEN_EXPIRES_IN` | `7d` | Refresh token expiry |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed frontend origin |
| `SUPABASE_URL` | demo URL | Supabase project URL |
| `SUPABASE_ANON_KEY` | demo key | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | — | Service role key (production only) |
| `STORAGE_DIR` | `./uploads` | Local file upload directory |

> In development/demo mode, the system uses an **in-memory DataStore**. No actual Supabase connection is required.

---

## API Reference

Full documentation: **`docs/API_DOCUMENTATION.md`**

### Base URL

```
http://localhost:5000/api
```

### Authentication

```
Authorization: Bearer <JWT_TOKEN>
```

Or via HttpOnly `token` cookie set automatically on login.

### Standard Response Envelope

```json
{
  "success": true,
  "data": { },
  "meta": { "requestId": "uuid-v4" }
}
```

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description.",
    "requestId": "uuid-v4",
    "details": [{ "field": "email", "message": "Invalid email format" }]
  }
}
```

### API Modules Summary

| Module | Endpoints | Required Role |
|---|---|---|
| Auth | `/auth/login`, `/auth/me`, `/auth/logout`, `/auth/password/change`, `/auth/mfa/*` | Public / Any |
| Student | `/students/me/profile`, skills, projects, certifications, resume, drives, applications, interviews, offers, certificate | `student` |
| Recruiter | drives CRUD, applicants, shortlist/reject, interviews, offers, CSV export | `recruiter` / `tpo_admin` |
| Admin | drive approvals, eligibility overrides, policy overrides, students, users, audit log, SIS sync | `tpo_admin` |
| Reports | summary KPIs, departments, companies, packages, CSV export | `tpo_admin` / `leadership` |
| Notifications | fetch, mark read, mark all read | Any authenticated |

---

## 🔒 Security Architecture

### Authentication and Session

- **JWT** signed with `HS256` — 15-minute expiry in production, 8-hour in demo
- Bearer token via `Authorization` header **or** `HttpOnly` cookie (CSRF-resistant)
- Passwords hashed with **bcrypt** (10 salt rounds)
- Login failures are audit-logged without leaking whether the email exists (anti-enumeration)

### Role-Based Access Control (RBAC)

Four strictly isolated roles — no privilege escalation possible:

```
student       ->  /api/students/me/* only
recruiter     ->  /api/recruiter/* + own-drive applicant data
tpo_admin     ->  /api/admin/* + /api/recruiter/* + /api/reports/*
leadership    ->  /api/reports/* (read-only, no student PII)
```

Every resource access validates **ownership** before serving data (IDOR prevention).

### Input Validation

All request bodies and query strings pass through **Zod schemas** before reaching service code.

### Transport Security

- **Helmet.js**: `X-Content-Type-Options`, `X-Frame-Options`, `HSTS`, CSP, `Referrer-Policy`, and more
- **CORS** restricted to declared frontend origin only
- **Rate limiting:** 100 req/15 min (general) | 5 req/15 min (auth)
- Morgan logger **never** records `Authorization` headers or cookie values

### Data Privacy

- Leadership reports return **zero student PII** (enforced and verified by integration test)
- Recruiter interview `notes` field is **stripped** from student-facing responses
- Forgot-password returns identical message regardless of email registration status

### Audit Trail

Every mutative action appends an immutable `AuditLog` record:

```
actorUserId | actorRole | action | entityType | entityId
oldData (diff) | newData (diff) | reason | ipAddress | userAgent | createdAt
```

The audit log is **append-only** — no update or delete operations exist.

---

## Data Model

```
UserProfile
  +-- Student
  |     +-- StudentAcademic[] (one per semester, up to 5)
  |     +-- StudentSkill[]
  |     +-- StudentProject[]
  |     +-- StudentCertification[]
  |     +-- DocumentRecord (resume)
  |
  +-- Recruiter --> Company

PlacementDrive (belongs to Recruiter)
  +-- Application[] (Student applies to Drive)
        +-- ApplicationStatusHistory[]
        +-- InterviewRound[]
        +-- Offer --> Placement (when accepted)

Notification (userId -> Socket.IO room: user:<userId>)
AuditLog (append-only global ledger)
EligibilityOverride (studentId + driveId composite key)
PolicyOverride (studentId + policyName composite key)
```

### Business Rules

| Rule | Enforcement Layer |
|---|---|
| Single-Offer Policy | `applicationService` — blocks apply if `isPlaced === true` (unless policy override exists) |
| Profile Completeness | `eligibilityService` — drive application blocked until profile complete or resume uploaded |
| Duplicate Application Prevention | `applicationService` — unique constraint on studentId + driveId |
| Drive Ownership | `interviewService` / `offerService` — recruiter must own the drive |
| Immutable Audit | `auditService` — append-only, no update/delete method exists |

---

## Eligibility Engine

`EligibilityService.evaluateStudent()` evaluates **7 deterministic factors** for each student-drive pair:

```
Factor 1: Drive Status      drive.status === 'OPEN'
Factor 2: Deadline          Date.now() < new Date(drive.applicationDeadline)
Factor 3: Profile           profileStatus === 'COMPLETE' OR resumeDocumentId exists
Factor 4: Policy            student.isPlaced === false OR policyOverride exists
Factor 5: CGPA              student.cgpa >= drive.minCgpa
Factor 6: Backlogs          student.backlogCount <= drive.maxBacklogs
Factor 7: Branch            student.branch in drive.eligibleBranches[]
```

If a TPO Admin grants an **Eligibility Override** for a specific `(studentId, driveId)` pair, all 7 checks return `true` and the result carries `isOverridden: true` with the justification reason.

`EligibilityService.runMassScreening(drive)` batch-evaluates all students and returns eligible/ineligible counts.

---

## Real-Time Notifications

Socket.IO delivers real-time notifications to specific users via named rooms:

```
Client connects with ?userId=<id>
Server: socket.join('user:<userId>')

Server emits: io.to('user:<userId>').emit('notification', payload)
Client receives and increments unread badge counter
```

| Event | Recipient |
|---|---|
| Drive approved | Recruiter |
| Drive rejected | Recruiter |
| Application shortlisted | Student |
| Application rejected | Student |
| Interview scheduled | Student |
| Interview updated | Student |
| Offer received | Student |
| Offer accepted | Recruiter |
| Offer declined | Recruiter |

Notifications persist in DataStore and are fetched via `GET /api/notifications/me`.

---

## 🗃️ Seed Data

The in-memory DataStore is pre-seeded on every server start:

| Entity | Count | Notes |
|---|---|---|
| User Profiles | 40+ | 4 demo + 36 seeded students |
| Students | 35 | CSE, ECE, ME, CE, EE branches — realistic CGPA spread |
| Academic Records | 175 | 5 semesters per student |
| Companies | 8 | Tech, consulting, manufacturing |
| Recruiters | 1 | Demo recruiter (Priya Deshmukh / Bharat Tech) |
| Placement Drives | 6 | OPEN, PENDING_APPROVAL, DRAFT, CLOSED statuses |
| Applications | 15+ | Covers full status pipeline |
| Interview Rounds | 8 | Technical and HR round types |
| Job Offers | 5 | PENDING, ACCEPTED, DECLINED states |
| Notifications | 3 | Pre-seeded for demo student |

---

## Running Tests

```powershell
# From project root
npm test

# Or from backend directory
cd "c:\Projects\The USPS\backend"
npm test
```

**5 test suites | 11 integration tests** using Jest + Supertest:

| Suite | Coverage |
|---|---|
| Authentication and Security | Wrong password rejection, unauthenticated 401, RBAC 403 cross-role |
| Student Workflows and Eligibility | Profile retrieval + score, 7-factor eligibility evaluation, application listing |
| Recruiter Drive Management | Drive listing with metrics, applicant pool access |
| Admin Approvals and Audit | Drive approval flow, audit log entry verification, SIS sync metrics |
| Leadership Reports | Summary KPIs with PII minimization check, department breakdown |

All tests run with `--runInBand` to share in-memory state across suites sequentially.

---

## ⚙️ Supabase and Production Deployment

### Step 1: Create Supabase Project

Create a new project at **https://supabase.com** and note your project URL and keys.

### Step 2: Run Migrations

In the Supabase **SQL Editor**, execute each file in order:

```
supabase/migrations/001_initial_schema.sql        -- All core tables
supabase/migrations/002_functions_and_triggers.sql -- Triggers + PL/pgSQL
supabase/migrations/003_rls_and_storage.sql        -- RLS policies + storage
supabase/migrations/004_reporting_views.sql        -- Analytics views
supabase/migrations/005_seed_data.sql              -- Production seed
```

### Step 3: Update Environment

Edit `backend/.env`:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-secure-random-secret-min-32-characters
JWT_EXPIRES_IN=15m
NODE_ENV=production
```

### Step 4: Build Frontend

```powershell
cd "c:\Projects\The USPS\frontend"
npm run build
# Output in frontend/dist/
```

Configure Nginx or a reverse proxy:
- Serve `frontend/dist/` for all non-API routes
- Proxy `/api/*` to `http://localhost:5000`

### Migration File Summary

| File | Contents |
|---|---|
| `001_initial_schema.sql` | 15+ tables: profiles, students, academics, companies, drives, applications, interviews, offers, placements, notifications, audit_logs, documents |
| `002_functions_and_triggers.sql` | `updated_at` auto-triggers, placement status automation, SIS sync procedures |
| `003_rls_and_storage.sql` | Row Level Security per role, storage bucket policies for resumes and documents |
| `004_reporting_views.sql` | `v_placement_summary`, `v_department_stats`, `v_company_stats` views |
| `005_seed_data.sql` | Full realistic student cohort for production demo |

---

## Design System

USPS uses a custom academic-institutional palette built on TailwindCSS:

| Token | Hex | Usage |
|---|---|---|
| `navy` | `#1B2A4A` | Primary: headings, nav, buttons |
| `paper` | `#FAF7F1` | Background surface |
| `brass` | `#B8863B` | Accent: deadlines, highlights |
| `sage` | `#4C7A63` | Success: eligible, accepted |
| `clay` | `#B4543E` | Danger: ineligible, rejected |
| `charcoal` | `#23262B` | Body text |
| `charcoal-muted` | `#5A606A` | Secondary labels |

**Typography:**
- Headings: Source Serif 4 / IBM Plex Serif (institutional serif)
- Body: Public Sans / IBM Plex Sans (clean sans-serif)

**Shadows:** `shadow-subtle` | `shadow-card` | `shadow-elevated`

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes following the code standards below
4. Run tests: `npm test`
5. Commit: `git commit -m 'feat: describe your change'`
6. Push: `git push origin feature/your-feature-name`
7. Open a Pull Request

### Code Standards

- TypeScript throughout — avoid untyped `any` in service or controller layers
- Zod validation schema required for every new API endpoint
- `AuditService.logAction()` required for all mutative admin and recruiter actions
- Jest + Supertest integration test required for all new routes
- Recruiter data scoped to owned resources — enforce IDOR checks

---

## License

This project is licensed under the **MIT License**.

---

Built for Indian university placement departments.
Unified Student Placement System — Bridging Academia and Industry.
