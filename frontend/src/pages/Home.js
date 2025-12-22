import { Link } from 'react-router-dom';

function Home() {
    return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <h1>Hệ thống điểm danh sinh viên</h1>
            <p>Quản lý điểm danh nhanh chóng, chính xác và tiện lợi</p>

            <div style={{ marginTop: '30px' }}>
                <Link to="/login">
                    <button>Đăng nhập</button>
                </Link>

                <Link to="/register" style={{ marginLeft: '10px' }}>
                    <button>Đăng ký</button>
                </Link>
            </div>
        </div>
    );
}

export default Home;
