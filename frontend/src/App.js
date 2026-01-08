//import logo from './logo.svg';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Main from './pages/Main';
import PrivateRoute from './routes/PrivateRoute';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Header from './components/Header';
import Intro from './pages/Intro';
import StudyPage from './pages/StudyPage';
import ProjectPage from './pages/ProjectPage';
import ScholarshipPage from './pages/ScholarshipPage';
import SupportPage from './pages/SupportPage';
import ContactPage from './pages/ContactPage';
import UserProfilePage from './pages/UserProfilePage';
import SettingPage from './pages/SettingPage';

function App() {
  return (
    <div className='d-flex flex-column min-vh-100'>
      <div className='header-container'>
        <Header />
      </div>
      <div className='navbar-container'>
        <NavBar />
      </div>
      <main>
        <Routes>
          <Route path="/" element={<Intro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/main" element={<PrivateRoute><Main /></PrivateRoute>} />
          <Route path="/study" element={<PrivateRoute><StudyPage /></PrivateRoute>} />
          <Route path="/project" element={<PrivateRoute><ProjectPage /></PrivateRoute>} />
          <Route path='/scholarship' element={<PrivateRoute><ScholarshipPage /></PrivateRoute>} />
          <Route path='/support' element={<PrivateRoute><SupportPage /></PrivateRoute>} />
          <Route path='/contact' element={<PrivateRoute><ContactPage /></PrivateRoute>} />
          <Route path='/profile' element={<PrivateRoute><UserProfilePage /></PrivateRoute>} />
          <Route path='/setting' element={<PrivateRoute><SettingPage /></PrivateRoute>} />
        </Routes>
      </main>

      <Footer />
    </div>

  );
}

export default App;
