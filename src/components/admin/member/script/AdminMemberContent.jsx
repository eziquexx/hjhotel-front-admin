import React, { useState } from "react";
import { Spinner, Table, Button } from "react-bootstrap";
import AdminMemberPaginavigation from "../../member/script/AdminMemberPaginavigation";
import usePaginationFetch from "../../payments/script/usePaginationFetch";

export default function AdminMemberContent() {
    const urlTest = "member";
    const {
        data: members,
        loading,
        error,
        totalPages,
        totalElements,
        page,
        setPage,
        size,
    } = usePaginationFetch(urlTest);

    // 비활성화/활성화 API 호출
    const handleToggleActivation = async (memberId, isActive) => {
        const endpoint = `http://localhost:8080/api/admin/member/${memberId}/activate`;
        try {
            await fetch(endpoint, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !isActive }),
            });
            alert("회원 활성 상태가 변경되었습니다.");
            window.location.reload(); // 목록 갱신
        } catch (error) {
            alert("활성 상태 변경 중 오류가 발생했습니다.");
        }
    };

    // 삭제 API 호출
    const handleDelete = async (memberId) => {
        const endpoint = `http://localhost:8080/api/admin/member/${memberId}`;
        try {
            if (window.confirm("정말로 삭제하시겠습니까?")) {
                await fetch(endpoint, { method: "DELETE" });
                alert("회원이 삭제되었습니다.");
                window.location.reload(); // 목록 갱신
            }
        } catch (error) {
            alert("회원 삭제 중 오류가 발생했습니다.");
        }
    };

    if (loading)
        return (
            <div>
                <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                />{" "}
                Loading...
            </div>
        );

    if (error) return <div>Error: {error}</div>;

    if (!members || members.length === 0)
        return <div>No members data available.</div>;

    return (
        <div>
            <h5 className="contentTitle">회원 목록</h5>
            <div className="contentTable">
                <Table
                    responsive="xl"
                    border={1}
                    className="table-hover table-bordered text-center"
                >
                    <thead className="table-light">
                    <tr>
                        <th>Number</th>
                        <th>ID</th>
                        <th>이름</th>
                        <th>이메일</th>
                        <th>전화번호</th>
                        <th>활성화</th>
                        <th>삭제</th>
                    </tr>
                    </thead>
                    <tbody className="table-group-divider">
                    {members.map((member) => (
                        <tr key={member.memberId}>
                            <td>{member.memberId}</td>
                            <td>{member.userId}</td>
                            <td>{member.name}</td>
                            <td>{member.email}</td>
                            <td>{member.phone}</td>
                            <td>
                                <Button
                                    variant={member.isActive ? "success" : "secondary"}
                                    onClick={() => handleToggleActivation(member.memberId, member.isActive)}
                                >
                                    {member.isActive ? "활성화" : "비활성화"}
                                </Button>
                            </td>
                            <td>
                                <Button
                                    variant="danger"
                                    onClick={() => handleDelete(member.memberId)}
                                >
                                    삭제
                                </Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
                <AdminMemberPaginavigation
                    page={page}
                    totalElements={totalElements}
                    totalPages={totalPages}
                    size={size}
                    onPageChange={(newPage) => setPage(newPage)}
                />
            </div>
        </div>
    );
}
