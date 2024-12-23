import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../components/common/AdminHeader";
import AdminContents from "../components/common/AdminContents";
import config from "../config";

const AdminPage = () => {
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const AdminContainerStyle = {
        display: "flex",
        flexDirection: "column",
        height: "100vh",
    };

    // useEffect 및 checkAuth 함수 제거

    const handleLogout = async () => {
        try {
            await fetch(`${config.API_BASE_URL}/api/admin/logout`, {
                method: "POST",
                credentials: "include",
            });
            window.location.href = "/admin/login"; // 로그아웃 후 로그인 페이지로 이동
        } catch (error) {
            console.error("Logout failed:", error); // 에러 로그 출력
        }
    };



    useEffect(() => {
        const checkAccess = async () => {
            try {
                const response = await fetch(`${config.API_BASE_URL}/api/admin/protected`, {
                    method: "GET",
                    credentials: "include", // JWT 쿠키 자동 포함
                });

                if (response.ok) {
                    console.log("Access granted!");
                    setAuthorized(true); // 권한 확인 성공 시 authorized = true
                } else {
                    throw new Error("Unauthorized access");
                }
            } catch (err) {
                console.error(err.message);
                navigate("/admin/login");
            } finally {
                setLoading(false); // 로딩 상태 해제
            }
        };

        checkAccess();
    }, [navigate]);

    if (loading) {
        return <div>Loading...</div>; // 로딩 중 화면 표시
    }

    if (!authorized) {
        return null; // 권한이 없으면 아무것도 표시하지 않음
    }

    return (
        <div style={AdminContainerStyle}>
            <AdminHeader onLogout={handleLogout} /> {/* 로그아웃 핸들러 전달 */}
            <AdminContents />
        </div>);
};

export default AdminPage;
