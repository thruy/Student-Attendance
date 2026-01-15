import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            await login(email, password)
            navigate("/main");
        } catch (error) {
            setError(error.response?.data?.message || "Lỗi đăng nhập, vui lòng thử lại.");
        }
    }

    return (
        <div className="container d-flex justify-content-center mt-5">
            <div className="card shadow p-4" style={{ width: "500px" }}>
                <h3 className="text-center mb-4">Đăng nhập</h3>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Mật khẩu</label>
                        <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>

                    <button type="submit" className="btn btn-dark w-100"> Đăng nhập </button>
                </form>
            </div>
        </div>
    );
}

export default Login;