import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../components/common/AdminHeader";
import AdminContents from "../components/common/AdminContents";
import useUserInfo from "../util/useUserInfo";
import axios from "axios";

const AdminPage = () => {
    const navigate = useNavigate();

    // 로그인 상태에 따라 사용자 정보 가져오기
    const { userInfo, loading, error, isLoggedIn } = useUserInfo();

    const AdminContainerStyle = {
        display: "flex",
        flexDirection: "column",
        height: "100vh",
    };

    // 로딩 중이면 로딩 메시지 표시
    if (loading) return <div>Loading...</div>;

    // 로그인이 안 된 상태면 아무것도 렌더링하지 않음.
    if (!isLoggedIn) return null;

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    const handleLogout = async () => {
        try {
        await axios.post("http://localhost:8080/api/admin/logout", {
            withCredentials: true,
        });
        navigate("/admin/login");
        } catch (error) {
        console.error("Logout failed:", error);
        }
    };
    // const [ loading2, setLoading ] = useState(false);
    // const [isLoggedIn, setIsLoggedIn] = useState(false);
    // const navigate = useNavigate();

    // // 로그인 상태에 따라 사용자 정보 가져오기
    // const { userInfo, loading, error } = useUserInfo(isLoggedIn);

    // const AdminContainerStyle = {
    //     display: "flex",
    //     flexDirection: "column",
    //     height: "100vh",
    // };

    


    //   // 로딩 중이면 로딩 메시지 표시
    // if (loading) return <div>Loading...</div>;

    // // 로그인이 안 된 상태면 아무것도 렌더링하지 않음.
    // if (!isLoggedIn) return null;


    // // useEffect 및 checkAuth 함수 제거
    // const handleLogout = async () => {
    //     try {
    //         await fetch("http://localhost:8080/api/admin/logout", {
    //             method: "POST",
    //             credentials: "include",
    //         });
    //         navigate("/admin/login"); // navigate 사용
    //     } catch (error) {
    //         console.error("Logout failed:", error);
    //     }
    // };

    return (
        <div style={AdminContainerStyle}>
            <AdminHeader onLogout={handleLogout} /> {/* 로그아웃 핸들러 전달 */}
            <AdminContents />
        </div>
    );
};

export default AdminPage;