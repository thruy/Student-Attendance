import { Routes, Route } from 'react-router-dom';
import RoleRoute from './routes/RoleRoute';
import Intro from './pages/Intro';
import Login from './pages/Login';
import Register from './pages/Register';

import Main from './pages/Main';
import Footer from './components/Footer';
import Header from './components/Header';

import MainLayout from './layouts/MainLayout';
import PlaceholderPage from './pages/PlaceholderPage';
import TimetablePage from './pages/TimetablePage';
import UserProfilePage from './pages/UserProfilePage';
import AttendancePage from './pages/AttendancePage';
import UserManagePage from './pages/UserManagePage';
import ClassManagePage from './pages/ClassManagePage';
import ProjectManagePage from './pages/ProjectManagePage';
import AdminAttendancePage from './pages/AdminAttendancePage';
import AttendanceVerifyPage from './pages/AttendanceVerifyPage';

// các trang chưa phát triển
const projectPage = <PlaceholderPage title="Trang đồ án" description="bạn đang ở trang đồ án." />;
const scholarshipPage = <PlaceholderPage title="Trang học bổng" description="bạn đang ở trang học bổng." />;
const supportPage = <PlaceholderPage title="Hỗ trợ sinh viên" description="bạn đang ở trang hỗ trợ." />;
const contactPage = <PlaceholderPage title="Liên hệ" description="bạn đang ở trang liên hệ." />;
const settingPage = <PlaceholderPage title="Trang cài đặt" description="bạn đang ở trang cài đặt." />;
const scholarshipManagePage = <PlaceholderPage title="Trang quản lý học bổng" description="bạn đã đăng nhập thành công." />;

function App() {
  return (
    <div className='d-flex flex-column min-vh-100'>
      <div className='header-container'>
        <Header />
      </div>

      <main>
        <Routes>
          <Route path="/" element={<Intro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* link trong mã QR điểm danh, trang tự xử lý trường hợp không phải sinh viên */}
          <Route path="/attendance/verify" element={<RoleRoute allowedRoles={['student', 'teacher', 'admin']}><AttendanceVerifyPage /></RoleRoute>} />
          {/* student */}
          <Route path='/student' element={<RoleRoute allowedRoles={['student']}><MainLayout /></RoleRoute>}>
            <Route index element={<Main />} />
            <Route path='study' element={<TimetablePage role="student" />} />
            <Route path='project' element={projectPage} />
            <Route path='scholarship' element={scholarshipPage} />
            <Route path='support' element={supportPage} />
            <Route path='contact' element={contactPage} />
            <Route path='profile' element={<UserProfilePage />} />
            <Route path='setting' element={settingPage} />
          </Route>

          {/* teacher */}
          <Route path='/teacher' element={<RoleRoute allowedRoles={['teacher']}><MainLayout /></RoleRoute>}>
            <Route index element={<Main />} />
            <Route path='teaching' element={<TimetablePage role="teacher" />} />
            <Route path="teaching/attendance/:classId" element={<AttendancePage />} />
            <Route path='project' element={projectPage} />
            <Route path='support' element={supportPage} />
            <Route path='contact' element={contactPage} />
            <Route path='profile' element={<UserProfilePage />} />
            <Route path='setting' element={settingPage} />
          </Route>

          {/* admin */}
          <Route path='/admin' element={<RoleRoute allowedRoles={['admin']}><MainLayout /></RoleRoute>} >
            <Route index element={<Main />} />
            {/* key theo role để reset state (trang, tìm kiếm) khi chuyển giữa 2 trang quản lý */}
            <Route path='student' element={<UserManagePage key="student" role="student" />} />
            <Route path='teacher' element={<UserManagePage key="teacher" role="teacher" />} />
            <Route path='class' element={<ClassManagePage />} />
            <Route path="class/:classId" element={<AdminAttendancePage />} />
            <Route path='project' element={<ProjectManagePage />} />
            <Route path='scholarship' element={scholarshipManagePage} />
            <Route path='profile' element={<UserProfilePage />} />
            <Route path='setting' element={settingPage} />
          </Route>

        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
