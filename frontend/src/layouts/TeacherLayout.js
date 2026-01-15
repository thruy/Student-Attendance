import { Outlet } from 'react-router-dom';
import TeacherNavBar from '../components/TeacherNavBar';

const TeacherLayout = () => {
    return (
        <>
            <TeacherNavBar />
            <main className="container mt-3">
                <Outlet />
            </main>
        </>
    );
};

export default TeacherLayout;
