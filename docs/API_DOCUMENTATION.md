# Unified Student Placement System (USPS) — API Documentation

Comprehensive REST API specification for the **Unified Student Placement System (USPS)**.

---

## Base URL & Headers

- **Base URL**: `http://localhost:5000/api`
- **Content-Type**: `application/json`
- **Authorization**: `Bearer <JWT_TOKEN>` (or via HttpOnly `token` cookie)
- **Tracing**: Every response contains an `X-Request-Id` tracking header.

---

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "07ce9264-3d61-49fc-9b81-53a2641d2bf0"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | RATE_LIMIT_EXCEEDED",
    "message": "Human-readable descriptive message.",
    "requestId": "07ce9264-3d61-49fc-9b81-53a2641d2bf0",
    "details": []
  }
}
```

---

## 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates user credentials, sets HttpOnly cookie, and returns JWT access token + profile. |
| `POST` | `/api/auth/logout` | Authenticated | Clears user authentication session cookie. |
| `GET` | `/api/auth/me` | Authenticated | Retrieves current authenticated session user profile. |
| `POST` | `/api/auth/password/change` | Authenticated | Updates account password (requires old password verification). |
| `POST` | `/api/auth/password/forgot` | Public | Requests password reset link without leaking email enumeration. |
| `POST` | `/api/auth/mfa/enroll` | Authenticated | Generates TOTP secret key and QR code link for multi-factor setup. |
| `POST` | `/api/auth/mfa/verify` | Authenticated | Verifies 6-digit TOTP code and activates MFA status. |

---

## 2. Student Portal Endpoints (`/api/students/me`)

*All student endpoints require `student` role authentication.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/students/me/profile` | Fetches student profile, 5-semester academics, skills, projects, certifications, and completion percentage score. |
| `PUT` | `/api/students/me/profile` | Updates personal and contact details. |
| `POST` | `/api/students/me/skills` | Adds a technical skill with competency level (`Beginner`, `Intermediate`, `Advanced`, `Expert`). |
| `DELETE` | `/api/students/me/skills/:id` | Removes a technical skill tag. |
| `POST` | `/api/students/me/projects` | Attaches a software/engineering project with repository URLs. |
| `DELETE` | `/api/students/me/projects/:id` | Deletes a project entry. |
| `POST` | `/api/students/me/certifications` | Registers a verified credential / certification. |
| `DELETE` | `/api/students/me/certifications/:id` | Removes a certification. |
| `POST` | `/api/students/me/resume` | Uploads PDF resume (enforces max 5MB, PDF MIME type, magic byte checking). |
| `GET` | `/api/students/me/drives` | Lists placement drives with live, deterministic 7-factor eligibility evaluation. |
| `GET` | `/api/students/me/drives/:id/eligibility` | Evaluates detailed eligibility breakdown for a specific drive. |
| `GET` | `/api/students/me/applications` | Fetches student application pipeline with stage history. |
| `POST` | `/api/students/me/applications` | Submits application to an open drive (enforces atomic eligibility & duplicate checks). |
| `DELETE` | `/api/students/me/applications/:id` | Voluntarily withdraws an active application. |
| `GET` | `/api/students/me/interviews` | Retrieves scheduled interview rounds, date/times, and video meeting URLs. |
| `GET` | `/api/students/me/offers` | Retrieves formal recruitment offers extended to student. |
| `POST` | `/api/students/me/offers/:id/accept` | Atomically accepts offer under University Single-Offer Policy. |
| `POST` | `/api/students/me/offers/:id/decline` | Declines placement offer with optional feedback reason. |
| `GET` | `/api/students/me/certificate` | Streams dynamically generated Graduation Placement & Clearance Certificate PDF. |

---

## 3. Recruiter Portal Endpoints (`/api/recruiter` & `/api/drives`)

*Requires `recruiter` or `tpo_admin` role authentication.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/recruiter/drives` | Creates or saves draft of a placement drive wizard. |
| `PUT` | `/api/recruiter/drives/:id` | Modifies drive parameters in `DRAFT` or `REJECTED` state. |
| `GET` | `/api/recruiter/drives/mine` | Lists recruiter's drives with applicant count & shortlisting rate. |
| `GET` | `/api/recruiter/drives/:id` | Fetches drive specification and criteria. |
| `GET` | `/api/recruiter/drives/:id/applications` | Fetches candidate pool for drive with search and branch/CGPA filtering. |
| `POST` | `/api/recruiter/drives/:id/applications/:appId/shortlist` | Shortlists candidate for interview rounds. |
| `POST` | `/api/recruiter/drives/:id/applications/:appId/reject` | Rejects candidate application. |
| `POST` | `/api/recruiter/drives/:id/rounds` | Schedules technical or HR interview round with candidate notification. |
| `POST` | `/api/recruiter/drives/:id/offers` | Issues formal placement job offer with package CTC. |
| `GET` | `/api/recruiter/drives/:id/shortlist/export` | Downloads authorized CSV spreadsheet of shortlisted candidates. |
| `GET` | `/api/recruiter/interviews` | Lists scheduled interview sessions. |

---

## 4. TPO / Admin Endpoints (`/api/admin`)

*Requires `tpo_admin` role authentication.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/drives` | Fetches all placement drives across all statuses. |
| `POST` | `/api/admin/drives/:id/approve` | Authorizes pending drive, marks `OPEN`, notifies recruiter, writes audit log. |
| `POST` | `/api/admin/drives/:id/reject` | Rejects drive with mandatory justification reason. |
| `POST` | `/api/admin/eligibility-overrides` | Grants administrative eligibility override with mandatory justification. |
| `POST` | `/api/admin/offers/override-policy` | Grants Single-Offer policy exception with audit log. |
| `GET` | `/api/admin/students` | Full university student directory with CGPA, backlogs, and placement records. |
| `GET` | `/api/admin/users` | Lists system user accounts. |
| `PATCH` | `/api/admin/users/:id/status` | Activates or deactivates user accounts. |
| `GET` | `/api/admin/audit-log` | Explores immutable system audit ledger with role, action, and payload diffs. |
| `POST` | `/api/admin/sis/sync` | Executes mock Student Information System (SIS) batch synchronization. |
| `GET` | `/api/admin/sis/sample` | Fetches sample registrar SIS dataset. |

---

## 5. Reports & Governance Endpoints (`/api/reports`)

*Requires `tpo_admin` or `leadership` role authentication.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/reports/summary` | Aggregate placement KPIs (placement rate, avg package, highest CTC, total offers). |
| `GET` | `/api/reports/departments` | Discipline-wise placement rates, cohort counts, and mean compensation. |
| `GET` | `/api/reports/companies` | Corporate recruitment hiring analytics, offers issued, and acceptance counts. |
| `GET` | `/api/reports/packages` | Placed student distribution by CTC compensation band. |
| `GET` | `/api/reports/export` | Downloads official placement summary report in CSV format. |

---

## 6. Real-Time Notifications (`/api/notifications`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/notifications/me` | Fetches in-app notifications and unread counter. |
| `PATCH` | `/api/notifications/:id/read` | Marks notification as read. |
| `PATCH` | `/api/notifications/read-all` | Marks all user notifications as read. |
