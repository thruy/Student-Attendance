import { useState } from "react";
import authService from "../services/authService";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const data = await authService.login(email, password);
            localStorage.setItem("token", data.token);
            alert("Login successful!");
        } catch (error) {
            setError(error.response?.data?.message || "Login failed, please try again.");
        }
    }

    return (
        <form className="login-form" onSubmit={handleSubmit}>
            <h2>Đăng nhập</h2>

            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="Mật khẩu" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="submit">Đăng nhập</button>

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
    )
}

export default Login;