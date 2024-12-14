import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from 'js-cookie';
import "../components/common/css/AdminLoginPage.css";

const AdminLoginPage = () => {
    const [staffUserId, setStaffUserId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("http://localhost:8080/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ staffUserId, password }),
                credentials: 'include',  // 쿠키를 포함하여 요청
            });
    
            if (response.ok) {
                navigate('/admin');  // 로그인 성공 후 /admin으로 이동
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Invalid credentials.");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
            console.error(err);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">HJ HOTEL <br />관리자 로그인</h1>
                {error && <p className="login-error">{error}</p>}
                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-group">
                        <label className="login-label">ID:</label>
                        <input
                            type="text"
                            value={staffUserId}
                            onChange={(e) => setStaffUserId(e.target.value)}
                            className="login-input"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="login-label">Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="login-input"
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">Login</button>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginPage;