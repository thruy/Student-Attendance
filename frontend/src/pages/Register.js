import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [gender, setGender] = useState("");
    const [dob, setDob] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await authService.register(name, gender, dob, email, password);
            await authService.login(email, password);
            navigate("/main");
        } catch (err) {
            setError(err.response?.data?.message || "Đăng kí thất bại");
        }
    };

    return (
        <div className="container d-flex justify-content-center mt-5">
            <div className="card shadow p-4" style={{ width: "500px" }}>
                <h3 className="text-center mb-4">Đăng kí</h3>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Họ và tên</label>
                        <input type="text" value={name} className="form-control" onChange={(e) => setName(e.target.value)} required />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Giới tính:</label>
                        <select className="form-select" aria-label="Default select example" value={gender} onChange={(e) => setGender(e.target.value)} required>
                            <option value="">-- Chọn giới tính --</option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Ngày sinh:</label>
                        <input type="date" className="form-control" value={dob} onChange={(e) => setDob(e.target.value)} required />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Email:</label>
                        <input type="email" value={email} className="form-control" onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Mật khẩu:</label>
                        <input type="password" value={password} className="form-control" onChange={(e) => setPassword(e.target.value)} required />
                    </div>

                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <button type="submit" className="btn btn-dark w-100">Đăng kí</button>
                </form>
            </div>
        </div>
    );
}

export default Register;