# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Student attendance / class management web app for HUST (Đại học Bách Khoa Hà Nội). Two independent npm projects, no monorepo tooling:

- `backend/` — Express 5 + Mongoose (CommonJS), REST API on port 8000
- `frontend/` — Create React App (React 19, react-router-dom 7, react-bootstrap, axios), port 3000

UI text, API error messages, and code comments are in Vietnamese — keep new ones consistent with that.

## Commands

```bash
# backend (needs backend/.env: MONGO_URI, PORT=8000, JWT_SECRET, JWT_EXPIRES)
cd backend && npm run dev      # node --watch src/app.js
cd backend && npm start        # node src/app.js

# frontend
cd frontend && npm start       # dev server on http://localhost:3000
cd frontend && npm run build
cd frontend && npm test        # Jest via react-scripts (no test files exist yet)
cd frontend && npm test -- --watchAll=false src/path/to/File.test.js   # single test
```

Backend has no tests or linter. Frontend lint is the CRA built-in ESLint (`react-app` config), surfaced during `npm start`/`build`.

Seed data (run from `backend/`, in this order; `class.js` requires students to exist first — register some or add via admin UI):
`node seed/admin.js` → `node seed/teacher.js` → `node seed/class.js` → `node seed/attendance.js`. All seeded accounts use password `123456` (admin: `admin.ad000000@sis.hust.edu.vn`).

Optional backend env vars: `QR_SESSION_MINUTES` (default 5), `QR_RADIUS_METERS` (default 50), `FRONTEND_URL` (default `http://localhost:3000`, used to build QR links).

## Architecture

### Auth & roles
- Login sets an httpOnly `token` cookie (JWT payload `{ userId, role }`). All frontend axios calls use `withCredentials: true`; backend CORS is pinned to `http://localhost:3000` with credentials.
- Three roles: `student`, `teacher`, `admin`. Each role has its own route file mounted at `/api/students`, `/api/teachers`, `/api/admin`, which applies `verifyToken` + `authorize(role)` once via `router.use(...)`. `/api/auth` handles register/login/verify/profile.
- Frontend: `AuthContext` calls `/api/auth/verify` on load; `RoleRoute` guards each role's subtree (`/student`, `/teacher`, `/admin`) in `App.js`, all rendered inside `MainLayout`. Redirects to `/login` keep `state.from` so the user returns after login.
- Emails must match `name.surname<6 digits>@sis.hust.edu.vn`. On register, the student code (MSSV) and `schoolYear` (khóa) are derived from those digits (e.g. `...215555` → code `20215555`, schoolYear 66).

### Backend layout
- Controllers are shared across roles; the same handler is mounted on multiple role routers and enforces per-user scoping internally. `utils/class.js#findAccessibleClass` is the standard access check: admin → any class, teacher → classes they teach, student → classes they're enrolled in. Returns `{ cls }` or `{ status, message }`.
- `user.controller.js` uses role-parameterized factories (`getAllUsers('student')`, `updateUser('teacher')`, …) driven by a `ROLES` config map, so student/teacher management share one implementation.
- Validation uses `express-validator` chains in `validation/` ending with a shared `validate` middleware that returns `{ success: false, errors: [{ field, message }] }`.
- Classes store their schedule (`dayOfWeek` in Vietnamese, `HH:mm` times) plus an explicit `date[]` list of session dates.

### Attendance model
- One `Attendances` document per `(classId, date)` with an embedded `records[]` array (`status: 'yes' | 'no' | null`, `method: manual|qr|face`). The separate `AttendanceRecords` model is unused legacy. `faceData` on Users is reserved for a future face check-in method.
- Dates are compared as `YYYY-MM-DD` keys; "today" is computed in `Asia/Ho_Chi_Minh` (`utils/attendance.js#todayInVN`).
- **QR check-in flow:** teacher starts a session (`POST /api/teachers/timetable/:classId/qr-session`, today only, optional teacher geolocation) → backend stores a random `qrToken`, `expiresAt`, optional `location`/`radius` on that day's Attendances doc → frontend shows a QR encoding `${FRONTEND_URL}/attendance/verify?token=...` → student opens `AttendanceVerifyPage`, which calls `GET/POST /api/students/attendance/qr`. If the session has a location, the student's browser geolocation is required and checked with Haversine distance against `radius`.
- A QR session is active iff `qrToken` set, `endedAt == null`, and `expiresAt > now` (`activeQrFilter` / `isQrActive`). Check-in uses an atomic `updateOne` with `$elemMatch` to avoid races between concurrent students.
- Manual saves go through `mergeManualRecords`, which preserves QR check-in metadata for students whose status didn't change.

### Frontend layout
- `services/{auth,student,teacher,admin}Service.js` wrap axios calls with hard-coded `http://localhost:8000/api/...` base URLs (one per role prefix).
- `hooks/useClassAttendance.js` loads class info + attendances and builds `attendanceMap[date].recordMap[studentId]`; it's shared by the teacher `AttendancePage` and `AdminAttendancePage`. The `fetchData` argument must be stable (`useCallback`).
- Several routes in `App.js` are still `PlaceholderPage` stubs (scholarship, support, contact, settings, student/teacher project pages).
