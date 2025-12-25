import videoHome from '../assets/videoHome.mp4'
import './Intro.scss'

function Intro() {
    return (
        <div className='intro-container'>
            <video autoPlay loop muted width={750} height={500} className='intro-video' >
                <source src={videoHome} />
            </video>
            <div className='intro-content'>
                <h2>Hệ thống quản lý sinh viên</h2>
                <h1>S-a-S</h1>
                <p>Quản lý điểm danh nhanh chóng, chính xác và tiện lợi</p>
                <p>Giúp bạn xây dựng các kết nối làm thay đổi những điều có thể</p>

            </div>
        </div>
    );
}

export default Intro;
