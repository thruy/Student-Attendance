//import logo from './logo.svg';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Main from './pages/Main';
import PrivateRoute from './routes/PrivateRoute';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Header from './components/Header';

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
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/main" element={<PrivateRoute><Main /></PrivateRoute>} />
        </Routes>
      </main>

      <Footer />

    </div>

  );
}

export default App;
