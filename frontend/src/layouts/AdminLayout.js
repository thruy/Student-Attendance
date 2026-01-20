import { Outlet } from 'react-router-dom';
import AdminNavBar from '../components/AdminNavBar';

const AdminLayout = () => {
    return (
        <>
            <AdminNavBar />
            <main className="container mt-3">
                <Outlet />
            </main>
        </>
    );
};

export default AdminLayout;
