# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Student attendance / class management web app for HUST (Đại học Bách Khoa Hà Nội). Two independent npm projects, no monorepo tooling:

- `backend/` — Express 5 + Mongoose (CommonJS), REST API on port 8000
- `frontend/` — Create React App (React 19, react-router-dom 7, react-bootstrap, axios), port 3000
- `face-service/` — tiny Flask service wrapping the deepface library (Docker, `docker-compose.yml` at repo root), only used for face check-in

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

# face recognition service (needs FACE_SERVICE_KEY in root .env and backend/.env)
docker compose up -d --build face-service   # 127.0.0.1:5005, GET /health
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
- One `Attendances` document per `(classId, date)` with an embedded `records[]` array (`status: 'yes' | 'no' | null`, `method: manual|qr|face`). The separate `AttendanceRecords` model is unused legacy. Face check-in exists only for exam rooms (see below).
- `examCode` distinguishes the two kinds of session in the same collection: `null` (or missing) = a class session, a string = the single attendance session of that exam room (partial unique index on `(classId, examCode)`). Every class-session query in `attendance.controller.js` must include `examCode: null` (`CLASS_SESSION`), otherwise exam sessions leak into class attendance.
- Dates are compared as `YYYY-MM-DD` keys; "today" is computed in `Asia/Ho_Chi_Minh` (`utils/attendance.js#todayInVN` / `dateKeyInVN`).
- **QR check-in flow:** teacher starts a session (`POST /api/teachers/timetable/:classId/qr-session`, today only, optional teacher geolocation) → backend stores a random `qrToken`, `expiresAt`, optional `location`/`radius` on that day's Attendances doc → frontend shows a QR encoding `${FRONTEND_URL}/attendance/verify?token=...` → student opens `AttendanceVerifyPage`, which calls `GET/POST /api/students/attendance/qr`. If the session has a location, the student's browser geolocation is required and checked with Haversine distance against `radius`.
- A QR session is active iff `qrToken` set, `endedAt == null`, and `expiresAt > now` (`activeQrFilter` / `isQrActive`). Check-in uses an atomic `updateOne` with `$elemMatch` to avoid races between concurrent students. Opening a session (class or exam) goes through `applyQrSession` + `parseQrMinutes`. The student QR endpoints serve both kinds; for exam sessions `findQrAttendance` checks membership against the room's `students`, not the class.
- Manual saves go through `mergeManualRecords`, which preserves QR check-in metadata for students whose status didn't change.

### Exam classes (chia lớp thi)
- One `ExamClasses` document per class (`classId` unique — each class has exactly one exam), with embedded `rooms[]` (`examCode`, `room`, `startTime`/`endTime`, `invigilators` = teacher `Users` refs, `students`). Saving overwrites the whole document (`PUT .../exam`, upsert); there is no draft/publish state — students see their room (`GET /api/students/exams`) as soon as it's saved.
- `exam.controller.js` is mounted on teacher (`/timetable/:classId/exam`) and admin (`/classes/:classId/exam`) routers, scoped via `findAccessibleClass`. On save it checks every student belongs to the class and appears in at most one room, and that invigilators are teachers. Unassigned students are allowed.
- The even split (ceil(n/a) rooms, sizes differ by ≤1) and Vietnamese name ordering (given name → family name → MSSV) live in `frontend/src/utils/exam.js` and run client-side only; `ExamRoomPage` (shared by teacher/admin via `role` prop) edits the draft before saving.
- Deleting a class/teacher removes its `ExamClasses`; removing/deleting a student or deleting a teacher `$pull`s them from `rooms.$[].students` / `rooms.$[].invigilators`.
- Each room's `startTime`/`endTime` must fall on the same VN day (`examValidate`); that day is the exam date (`utils/exam.js#examDateKey`).
- **Exam attendance** (`examAttendance.controller.js`, teacher `/exams/:classId/rooms/:examCode/...`, admin `/classes/:classId/exam/rooms/:examCode/...`): access via `utils/exam.js#findAccessibleExamRoom` — admin and the room's invigilators can take attendance, the class's teacher can only view. QR only on the exam date (admin too); manual: invigilators only on the exam date, admin any time. Teachers find their rooms via `GET /api/teachers/exams` (`InvigilationPage`, nav "Coi thi"); `ExamAttendancePage` is shared by teacher/admin via `role` prop.
- Once any exam attendance exists for a class (`isExamAttendanceLocked`), `PUT`/`DELETE .../exam` return 409 and `ExamRoomPage` becomes read-only (`attendanceLocked`). Only admin can delete an exam attendance session (`DELETE /api/admin/classes/:classId/exam/rooms/:examCode/attendance`, mirroring class-session deletion which is also admin-only); deleting the last one unlocks the exam split.

### Face check-in (điểm danh khuôn mặt, exam rooms only)
- `face-service/app.py` exposes only `POST /embed` (raw JPEG bytes, `Authorization: Bearer FACE_SERVICE_KEY`, `?anti_spoofing=1`) → one 512-d embedding, fixed **Facenet512 + RetinaFace**, ONNX engine; errors are 422 `{ code: BAD_IMAGE | NO_FACE | MULTIPLE_FACES | SPOOF }`. It never accepts paths/URLs. Runs with 1 gunicorn worker/thread (RetinaFace isn't thread-safe); deepface is pinned to a commit in `requirements.txt`.
- Matching lives in Node (`utils/face.js`): cosine distance against the **room's** students only; a match needs `distance <= FACE_MATCH_THRESHOLD` (0.30) and a gap of `FACE_MATCH_MARGIN` (0.05) to the runner-up. Embeddings are only compared when `model`/`detector` match (`isComparable`) — changing the model means re-registering.
- `Users.faceData` (`embedding`, `model`, `detector`, `photoPath`, `registeredAt`) is `select: false`; read it with `.select('+faceData')` and never send `embedding`/`photoPath` to clients. Photos are stored outside any public folder (`FACE_UPLOAD_DIR`, default `backend/uploads/faces`, gitignored) and served only through authenticated endpoints with `Cache-Control: private, no-store` (student: own photo `GET /api/students/face/photo`; admin: `GET /api/admin/students/:id/face/photo`).
- Students upload once (`POST /api/students/face`, multipart `photo`, JPEG only — the frontend re-encodes via canvas in `utils/camera.js`); only admin can delete (`DELETE /api/admin/students/:id/face`) so they can re-upload. Uploads go through `middleware/upload.middleware.js#photoUpload` (multer memory storage, 5MB).
- `POST .../rooms/:examCode/face-checkin` (teacher + admin, `permissions.face` = same rule as QR) embeds the frame with anti-spoofing, then `findOrCreateRoomAttendance` + atomic `$elemMatch` update (`method: 'face'`, `distance` = cosine). Unmatched returns 200 `{ matched: false }` so `FaceCheckInPanel` keeps auto-capturing every 2s; camera frames are not stored.

### Frontend layout
- `services/{auth,student,teacher,admin}Service.js` wrap axios calls with hard-coded `http://localhost:8000/api/...` base URLs (one per role prefix).
- `hooks/useClassAttendance.js` loads class info + attendances and builds `attendanceMap[date].recordMap[studentId]`; it's shared by the teacher `AttendancePage` and `AdminAttendancePage`. The `fetchData` argument must be stable (`useCallback`).
- Several routes in `App.js` are still `PlaceholderPage` stubs (scholarship, support, contact, settings, student/teacher project pages).
