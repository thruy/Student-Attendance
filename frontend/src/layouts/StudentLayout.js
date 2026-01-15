import { Outlet } from 'react-router-dom';
import Navbar from '../components/NavBar';

const StudentLayout = () => {
    return (
        <>
            <Navbar />
            <main className="container mt-3">
                <Outlet />
            </main>
        </>
    );
};

export default StudentLayout;
