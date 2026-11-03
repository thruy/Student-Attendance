import { Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';

// layout chung cho cả 3 role, NavBar tự hiển thị menu theo role đang đăng nhập
const MainLayout = () => {
    return (
        <>
            <NavBar />
            <main className="container mt-3">
                <Outlet />
            </main>
        </>
    );
};

export default MainLayout;
