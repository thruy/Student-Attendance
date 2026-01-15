import { Outlet } from 'react-router-dom';
import StudentNavBar from '../components/StudentNavBar';

const StudentLayout = () => {
    return (
        <>
            <StudentNavBar />
            <main className="container mt-3">
                <Outlet />
            </main>
        </>
    );
};

export default StudentLayout;
