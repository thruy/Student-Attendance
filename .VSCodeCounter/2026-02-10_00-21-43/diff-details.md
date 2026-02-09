# Diff Details

Date : 2026-02-10 00:21:43

Directory c:\\Users\\Admin\\Student Attendance\\backend

Total : 84 files,  -18726 codes, -141 comments, -248 blanks, all -19115 lines

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [backend/package-lock.json](/backend/package-lock.json) | JSON | 1,260 | 0 | 1 | 1,261 |
| [backend/package.json](/backend/package.json) | JSON | 22 | 0 | 1 | 23 |
| [backend/seed/admin.js](/backend/seed/admin.js) | JavaScript | 31 | 0 | 3 | 34 |
| [backend/seed/attendance.js](/backend/seed/attendance.js) | JavaScript | 36 | 0 | 10 | 46 |
| [backend/seed/class.js](/backend/seed/class.js) | JavaScript | 82 | 0 | 8 | 90 |
| [backend/seed/teacher.js](/backend/seed/teacher.js) | JavaScript | 37 | 0 | 5 | 42 |
| [backend/src/app.js](/backend/src/app.js) | JavaScript | 22 | 0 | 4 | 26 |
| [backend/src/config/db.js](/backend/src/config/db.js) | JavaScript | 12 | 0 | 2 | 14 |
| [backend/src/controllers/admin.controller.js](/backend/src/controllers/admin.controller.js) | JavaScript | 889 | 13 | 121 | 1,023 |
| [backend/src/controllers/auth.controller.js](/backend/src/controllers/auth.controller.js) | JavaScript | 110 | 0 | 11 | 121 |
| [backend/src/controllers/student.controller.js](/backend/src/controllers/student.controller.js) | JavaScript | 137 | 1 | 16 | 154 |
| [backend/src/controllers/teacher.controller.js](/backend/src/controllers/teacher.controller.js) | JavaScript | 219 | 0 | 25 | 244 |
| [backend/src/middleware/auth.middleware.js](/backend/src/middleware/auth.middleware.js) | JavaScript | 15 | 0 | 2 | 17 |
| [backend/src/middleware/role.middleware.js](/backend/src/middleware/role.middleware.js) | JavaScript | 9 | 0 | 1 | 10 |
| [backend/src/models/AttendanceRecords.js](/backend/src/models/AttendanceRecords.js) | JavaScript | 27 | 0 | 8 | 35 |
| [backend/src/models/Attendances.js](/backend/src/models/Attendances.js) | JavaScript | 47 | 0 | 10 | 57 |
| [backend/src/models/Classes.js](/backend/src/models/Classes.js) | JavaScript | 65 | 0 | 11 | 76 |
| [backend/src/models/Project.js](/backend/src/models/Project.js) | JavaScript | 66 | 0 | 14 | 80 |
| [backend/src/models/Users.js](/backend/src/models/Users.js) | JavaScript | 87 | 0 | 21 | 108 |
| [backend/src/routes/admin.route.js](/backend/src/routes/admin.route.js) | JavaScript | 42 | 4 | 5 | 51 |
| [backend/src/routes/auth.route.js](/backend/src/routes/auth.route.js) | JavaScript | 13 | 0 | 2 | 15 |
| [backend/src/routes/student.route.js](/backend/src/routes/student.route.js) | JavaScript | 9 | 0 | 2 | 11 |
| [backend/src/routes/teacher.route.js](/backend/src/routes/teacher.route.js) | JavaScript | 14 | 0 | 3 | 17 |
| [backend/src/validation/adminValidate.js](/backend/src/validation/adminValidate.js) | JavaScript | 163 | 0 | 8 | 171 |
| [backend/src/validation/validate.js](/backend/src/validation/validate.js) | JavaScript | 85 | 0 | 6 | 91 |
| [frontend/README.md](/frontend/README.md) | Markdown | -38 | 0 | -33 | -71 |
| [frontend/package-lock.json](/frontend/package-lock.json) | JSON | -18,098 | 0 | -1 | -18,099 |
| [frontend/package.json](/frontend/package.json) | JSON | -48 | 0 | -1 | -49 |
| [frontend/public/index.html](/frontend/public/index.html) | HTML | -17 | -23 | -3 | -43 |
| [frontend/public/manifest.json](/frontend/public/manifest.json) | JSON | -25 | 0 | -1 | -26 |
| [frontend/src/App.css](/frontend/src/App.css) | PostCSS | 0 | -38 | -1 | -39 |
| [frontend/src/App.js](/frontend/src/App.js) | JavaScript | -78 | 0 | -8 | -86 |
| [frontend/src/components/AdminNavBar.js](/frontend/src/components/AdminNavBar.js) | JavaScript | -53 | -26 | -8 | -87 |
| [frontend/src/components/AttendanceModal.js](/frontend/src/components/AttendanceModal.js) | JavaScript | -65 | 0 | -7 | -72 |
| [frontend/src/components/ChangePassword.js](/frontend/src/components/ChangePassword.js) | JavaScript | -68 | 0 | -10 | -78 |
| [frontend/src/components/ClassAddModal.js](/frontend/src/components/ClassAddModal.js) | JavaScript | -134 | 0 | -11 | -145 |
| [frontend/src/components/ClassEditModal.js](/frontend/src/components/ClassEditModal.js) | JavaScript | -122 | 0 | -8 | -130 |
| [frontend/src/components/ClassInfoModal.js](/frontend/src/components/ClassInfoModal.js) | JavaScript | -60 | 0 | -3 | -63 |
| [frontend/src/components/ClassStudentModal.js](/frontend/src/components/ClassStudentModal.js) | JavaScript | -152 | 0 | -19 | -171 |
| [frontend/src/components/Footer.js](/frontend/src/components/Footer.js) | JavaScript | -11 | 0 | -1 | -12 |
| [frontend/src/components/Header.js](/frontend/src/components/Header.js) | JavaScript | -33 | -24 | -7 | -64 |
| [frontend/src/components/ProjectAddModal.js](/frontend/src/components/ProjectAddModal.js) | JavaScript | -67 | 0 | -8 | -75 |
| [frontend/src/components/ProjectStudentModal.js](/frontend/src/components/ProjectStudentModal.js) | JavaScript | -136 | 0 | -16 | -152 |
| [frontend/src/components/StudentAddModal.js](/frontend/src/components/StudentAddModal.js) | JavaScript | -52 | 0 | -5 | -57 |
| [frontend/src/components/StudentDetailModal.js](/frontend/src/components/StudentDetailModal.js) | JavaScript | -50 | 0 | -5 | -55 |
| [frontend/src/components/StudentEditModal.js](/frontend/src/components/StudentEditModal.js) | JavaScript | -104 | 0 | -6 | -110 |
| [frontend/src/components/StudentNavBar.js](/frontend/src/components/StudentNavBar.js) | JavaScript | -50 | 0 | -8 | -58 |
| [frontend/src/components/TeacherAddModal.js](/frontend/src/components/TeacherAddModal.js) | JavaScript | -52 | 0 | -5 | -57 |
| [frontend/src/components/TeacherDetailModal.js](/frontend/src/components/TeacherDetailModal.js) | JavaScript | -48 | 0 | -5 | -53 |
| [frontend/src/components/TeacherEditModal.js](/frontend/src/components/TeacherEditModal.js) | JavaScript | -100 | 0 | -6 | -106 |
| [frontend/src/components/TeacherNavBar.js](/frontend/src/components/TeacherNavBar.js) | JavaScript | -50 | 0 | -7 | -57 |
| [frontend/src/components/navbar.css](/frontend/src/components/navbar.css) | PostCSS | -60 | -10 | -12 | -82 |
| [frontend/src/context/AuthContext.js](/frontend/src/context/AuthContext.js) | JavaScript | -41 | 0 | -5 | -46 |
| [frontend/src/index.css](/frontend/src/index.css) | PostCSS | -12 | 0 | -4 | -16 |
| [frontend/src/index.js](/frontend/src/index.js) | JavaScript | -19 | 0 | -3 | -22 |
| [frontend/src/layouts/AdminLayout.js](/frontend/src/layouts/AdminLayout.js) | JavaScript | -13 | 0 | -3 | -16 |
| [frontend/src/layouts/StudentLayout.js](/frontend/src/layouts/StudentLayout.js) | JavaScript | -13 | 0 | -3 | -16 |
| [frontend/src/layouts/TeacherLayout.js](/frontend/src/layouts/TeacherLayout.js) | JavaScript | -13 | 0 | -3 | -16 |
| [frontend/src/pages/AdminAttendancePage.js](/frontend/src/pages/AdminAttendancePage.js) | JavaScript | -236 | -3 | -24 | -263 |
| [frontend/src/pages/AttendancePage.js](/frontend/src/pages/AttendancePage.js) | JavaScript | -188 | -2 | -20 | -210 |
| [frontend/src/pages/ClassManagePage.js](/frontend/src/pages/ClassManagePage.js) | JavaScript | -231 | 0 | -29 | -260 |
| [frontend/src/pages/ContactPage.js](/frontend/src/pages/ContactPage.js) | JavaScript | -15 | 0 | -4 | -19 |
| [frontend/src/pages/Intro.css](/frontend/src/pages/Intro.css) | PostCSS | -109 | -14 | -16 | -139 |
| [frontend/src/pages/Intro.js](/frontend/src/pages/Intro.js) | JavaScript | -64 | 0 | -8 | -72 |
| [frontend/src/pages/Login.js](/frontend/src/pages/Login.js) | JavaScript | -48 | 0 | -8 | -56 |
| [frontend/src/pages/Main.js](/frontend/src/pages/Main.js) | JavaScript | -15 | 0 | -4 | -19 |
| [frontend/src/pages/ProjectManagePage.js](/frontend/src/pages/ProjectManagePage.js) | JavaScript | -166 | 0 | -20 | -186 |
| [frontend/src/pages/ProjectPage.js](/frontend/src/pages/ProjectPage.js) | JavaScript | -15 | 0 | -4 | -19 |
| [frontend/src/pages/Register.js](/frontend/src/pages/Register.js) | JavaScript | -59 | 0 | -10 | -69 |
| [frontend/src/pages/ScholarshipManagePage.js](/frontend/src/pages/ScholarshipManagePage.js) | JavaScript | -15 | 0 | -4 | -19 |
| [frontend/src/pages/ScholarshipPage.js](/frontend/src/pages/ScholarshipPage.js) | JavaScript | -15 | 0 | -4 | -19 |
| [frontend/src/pages/SettingPage.js](/frontend/src/pages/SettingPage.js) | JavaScript | -15 | 0 | -4 | -19 |
| [frontend/src/pages/StudentManagePage.js](/frontend/src/pages/StudentManagePage.js) | JavaScript | -177 | 0 | -21 | -198 |
| [frontend/src/pages/StudyPage.js](/frontend/src/pages/StudyPage.js) | JavaScript | -144 | 0 | -14 | -158 |
| [frontend/src/pages/SupportPage.js](/frontend/src/pages/SupportPage.js) | JavaScript | -15 | 0 | -4 | -19 |
| [frontend/src/pages/TeacherManagePage.js](/frontend/src/pages/TeacherManagePage.js) | JavaScript | -177 | 0 | -21 | -198 |
| [frontend/src/pages/TeachingPage.js](/frontend/src/pages/TeachingPage.js) | JavaScript | -129 | 0 | -11 | -140 |
| [frontend/src/pages/UserProfilePage.js](/frontend/src/pages/UserProfilePage.js) | JavaScript | -161 | 0 | -13 | -174 |
| [frontend/src/pages/timetable.css](/frontend/src/pages/timetable.css) | PostCSS | -82 | -15 | -17 | -114 |
| [frontend/src/routes/RoleRoute.js](/frontend/src/routes/RoleRoute.js) | JavaScript | -10 | 0 | -3 | -13 |
| [frontend/src/services/adminService.js](/frontend/src/services/adminService.js) | JavaScript | -154 | -4 | -37 | -195 |
| [frontend/src/services/authService.js](/frontend/src/services/authService.js) | JavaScript | -32 | 0 | -8 | -40 |
| [frontend/src/services/studentService.js](/frontend/src/services/studentService.js) | JavaScript | -26 | 0 | -5 | -31 |
| [frontend/src/services/teacherService.js](/frontend/src/services/teacherService.js) | JavaScript | -45 | 0 | -9 | -54 |

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details