import { useAuth } from '../context/AuthContext'

function ContactPage() {
    const { user } = useAuth();

    return (
        <div>
            <h2>Liên hệ</h2>
            {user ? (
                <p>Chào {user.name}, bạn đang ở trang liên hệ.</p>
            ) : (
                <p>Đang tải...</p>
            )}
        </div>
    );
}

export default ContactPage;
