import { useState } from "react";
import { register } from "../services/authService";

function Register() {
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("student");
    const [error, setError] = useState("");




    return (
        <div className="register">
            <h2>Register Page</h2>
        </div>
    )
}

export default Register;