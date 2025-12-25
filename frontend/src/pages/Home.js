import videoHome from '../assets/videoHome.mp4'
import './Home.scss'

function Home() {
    return (
        <div className='home-container'>
            <video autoPlay loop muted width={750} height={500} className='home-video' >
                <source src={videoHome} />
            </video>
            <div className='home-content'>
                <h2>Hệ thống quản lý sinh viên</h2>
                <h1>S-a-S</h1>
                <p>Quản lý điểm danh nhanh chóng, chính xác và tiện lợi</p>
                <p>Giúp bạn xây dựng các kết nối làm thay đổi những điều có thể</p>

            </div>
        </div>
    );
}

export default Home;
