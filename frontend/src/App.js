import { Routes, Route } from 'react-router-dom';
import RoleRoute from './routes/RoleRoute';
import Intro from './pages/Intro';
import Login from './pages/Login';
import Register from './pages/Register';

import Main from './pages/Main';
import Footer from './components/Footer';
import Header from './components/Header';

import StudyPage from './pages/StudyPage';
import ProjectPage from './pages/ProjectPage';
import ScholarshipPage from './pages/ScholarshipPage';
import SupportPage from './pages/SupportPage';
import ContactPage from './pages/ContactPage';
import UserProfilePage from './pages/UserProfilePage';
import SettingPage from './pages/SettingPage';
import TeachingPage from './pages/TeachingPage';
import TeacherLayout from './layouts/TeacherLayout';
import StudentLayout from './layouts/StudentLayout';
import AttendancePage from './pages/AttendancePage';
import AdminLayout from './layouts/AdminLayout';
import StudentManagePage from './pages/StudentManagePage';
import TeacherManagePage from './pages/TeacherManagePage';
import ClassManagePage from './pages/ClassManagePage';
import ScholarshipManagePage from './pages/ScholarshipManagePage';
import ProjectManagePage from './pages/ProjectManagePage';

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
          {/* student */}
          <Route path='/student' element={<RoleRoute allowedRoles={['student']}><StudentLayout /></RoleRoute>}>
            <Route index element={<Main />} />
            <Route path='study' element={<StudyPage />} />
            <Route path='project' element={<ProjectPage />} />
            <Route path='scholarship' element={<ScholarshipPage />} />
            <Route path='support' element={<SupportPage />} />
            <Route path='contact' element={<ContactPage />} />
            <Route path='profile' element={<UserProfilePage />} />
            <Route path='setting' element={<SettingPage />} />
          </Route>

          {/* teacher */}
          <Route path='/teacher' element={<RoleRoute allowedRoles={['teacher']}><TeacherLayout /></RoleRoute>}>
            <Route index element={<Main />} />
            <Route path='teaching' element={<TeachingPage />} />
            <Route path="teaching/attendance/:classId" element={<AttendancePage />} />
            <Route path='project' element={<ProjectPage />} />
            <Route path='support' element={<SupportPage />} />
            <Route path='contact' element={<ContactPage />} />
            <Route path='profile' element={<UserProfilePage />} />
            <Route path='setting' element={<SettingPage />} />
          </Route>

          {/* admin */}
          <Route path='/admin' element={<RoleRoute allowedRoles={['admin']}><AdminLayout /></RoleRoute>} >
            <Route index element={<Main />} />
            <Route path='student' element={<StudentManagePage />} />
            <Route path='teacher' element={<TeacherManagePage />} />
            <Route path='class' element={<ClassManagePage />} />
            <Route path='project' element={<ProjectManagePage />} />
            <Route path='scholarship' element={<ScholarshipManagePage />} />
            <Route path='profile' element={<UserProfilePage />} />
            <Route path='setting' element={<SettingPage />} />
          </Route>

        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;