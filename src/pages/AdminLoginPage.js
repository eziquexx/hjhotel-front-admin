import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../components/common/css/AdminLoginPage.css";
import config from '../config';

const AdminLoginPage = () => {
    const [staffUserId, setStaffUserId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch(`${config.API_BASE_URL}/api/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // 쿠키를 요청에 포함
                body: JSON.stringify({ staffUserId, password }),
            });

            if (response.ok) {
                const contentType = response.headers.get("Content-Type");
                let data;

                // 응답 타입에 따라 처리
                if (contentType && contentType.includes("application/json")) {
                    data = await response.json();
                } else {
                    data = { message: await response.text() };
                }

                console.log("Response Data:", data); // 디버깅용

                // 관리자 여부 확인
                if (data.role && data.role === "ADMIN") {
                    // 관리자 권한 확인 성공
                    console.log("Login successful:", data);
                    navigate("/admin", { replace: true });
                } else {
                    setError("You are not authorized to access this page.");
                }
            } else {
                const errorData = await response.text();
                setError(errorData || "Invalid credentials.");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
            console.error("Error:", err);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">StarellaHotel<br />관리자 로그인</h1>
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
