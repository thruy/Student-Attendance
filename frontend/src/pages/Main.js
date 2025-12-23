import { useState, useEffect } from 'react';
import axios from 'axios';

function Main() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/auth/verify', { withCredentials: true });
                setUser(response.data.user);
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };
        fetchUser();
    }, []);

    return (
        <div>
            <h2>Trang chủ</h2>
            {user ? (
                <p>Chào {user.name}, bạn đã đăng nhập thành công.</p>
            ) : (
                <p>Đang tải...</p>
            )}
        </div>
    );
}

export default Main;
