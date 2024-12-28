import React, { useState, useEffect } from "react";
import { Table, Button, Spinner } from "react-bootstrap";

export default function AdminStaffContent() {
    const [staffs, setStaffs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 직원 데이터 가져오기
    useEffect(() => {
        const fetchStaffs = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/admin/staff", {
                    credentials: "include", // 쿠키 포함
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch staff data");
                }

                const data = await response.json();
                const sortedData = data.sort((a, b) => b.staffId - a.staffId);
                setStaffs(data);
            } catch (error) {
                console.error("Error fetching staff data:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStaffs();
    }, []);

    // 활성화/비활성화 토글
    const handleToggleActivation = async (staffId, isActive) => {
        const endpoint = `http://localhost:8080/api/admin/staff/${staffId}/activate`;
        try {
            await fetch(endpoint, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !isActive }),
            });
            alert("직원 활성 상태가 변경되었습니다.");
            window.location.reload(); // 목록 갱신
        } catch (error) {
            alert("활성 상태 변경 중 오류가 발생했습니다.");
        }
    };

    // 직원 삭제
    const handleDelete = async (staffId) => {
        const endpoint = `http://localhost:8080/api/admin/staff/${staffId}`;
        try {
            if (window.confirm("정말로 삭제하시겠습니까?")) {
                await fetch(endpoint, { method: "DELETE" });
                alert("직원이 삭제되었습니다.");
                window.location.reload(); // 목록 갱신
            }
        } catch (error) {
            alert("직원 삭제 중 오류가 발생했습니다.");
        }
    };

    if (loading)
        return (
            <div>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (staffs.length === 0) {
        return <div>No staff data available.</div>;
    }

    return (
        <div>
            <h2>직원 관리</h2>
            <Table responsive="xl" bordered hover className="text-center">
                <thead className="table-light">
                <tr>
                    <th>ID</th>
                    <th>아이디</th>
                    <th>이름</th>
                    <th>이메일</th>
                    <th>전화번호</th>
                    <th>활성화</th>
                    <th>삭제</th>
                </tr>
                </thead>
                <tbody>
                {staffs.map((staff) => (
                    <tr key={staff.staffId}>
                        <td>{staff.staffId}</td>
                        <td>{staff.staffUserId}</td>
                        <td>{staff.name}</td>
                        <td>{staff.email}</td>
                        <td>{staff.phone}</td>
                        <td>
                            {/* 특정 계정 조건에 따라 활성화/비활성화 버튼 */}
                            <Button
                                variant={staff.isActive ? "success" : "secondary"}
                                onClick={() => handleToggleActivation(staff.staffId, staff.isActive)}
                                disabled={staff.staffUserId === "admin"} // admin 계정 비활성화 불가능
                            >
                                {staff.isActive ? "활성화" : "비활성화"}
                            </Button>
                        </td>
                        <td>
                            {/* 특정 계정 조건에 따라 삭제 버튼 비활성화 */}
                            <Button
                                variant="danger"
                                onClick={() => handleDelete(staff.staffId)}
                                disabled={staff.staffUserId === "admin"} // admin 계정 삭제 불가능
                            >
                                삭제
                            </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </div>
    );
}
