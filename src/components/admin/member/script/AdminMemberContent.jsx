import React, { useState, useEffect } from 'react';
import config from '../../../../config';

export default function AdminMemberContent() {
    const [members, setMembers] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await fetch(`${config.API_BASE_URL}/api/admin/member`, {
                    credentials: "include", // 쿠키를 요청에 포함
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch members');
                }

                const data = await response.json();
                setMembers(data);
            } catch (error) {
                console.error('Error fetching members:', error);
                setError(error.message);
            }
        };

        fetchMembers();
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>

            <div>

                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>이름</th>
                        <th>이메일</th>
                        <th>전화번호</th>
                        {/* 추가 필드 */}
                    </tr>
                    </thead>
                    <tbody>
                    {members.map((member) => (
                        <tr key={member.memberId}>
                            <td>{member.user_id}</td>
                            <td>{member.name}</td>
                            <td>{member.email}</td>
                            <td>{member.phone}</td>
                            {/* 추가 필드 데이터 */}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}