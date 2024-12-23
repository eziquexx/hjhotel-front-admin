import React, { useState, useEffect } from 'react';
import config    from "../../../../config";

export default function AdminStaffContent() {
    const [staffs, setStaffs] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStaffs = async () => {
            try {
                const response = await fetch(`${config.API_BASE_URL}/api/admin/staff`, {
                    credentials: "include", // 쿠키를 요청에 포함
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch staff data');
                }

                const data = await response.json();
                setStaffs(data);
            } catch (error) {
                console.error('Error fetching staff data:', error);
                setError(error.message);
            }
        };

        fetchStaffs();
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>직원 관리</h2>
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>아이디</th>
                    <th>이름</th>
                    <th>이메일</th>
                    <th>전화번호</th>

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

                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
