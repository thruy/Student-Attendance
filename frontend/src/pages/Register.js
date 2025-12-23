import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

function Register() {
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("student");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await authService.register(name, email, password, code, role);
            await authService.login(email, password);
            navigate("/main");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="register-container">
            <h2>Register Page</h2>
            <form onSubmit={handleSubmit} className="register-form">
                <div>
                    <label>Name:</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                    <label>Code:</label>
                    <input type="text" value={code} onChange={(e) => setCode(e.target.value)} required />
                </div>
                <div>
                    <label>Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <button type="submit">Register</button>
            </form>
        </div>
    );
}

export default Register;