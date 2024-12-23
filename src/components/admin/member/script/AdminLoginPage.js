import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
// import useAuthStore from 'src/state/authStore';
import config from '../../../../config';

const LoginPage = () => {
    const [formData, setFormData] = useState({ userId: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const { setToken } = useAuthStore(); // Zustand 상태 관리

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleLogin = async () => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/api/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || '로그인 실패');
            }

            const data = await response.json();
            const decodedToken = jwtDecode(data.token); // JWT 디코딩
            const role = decodedToken.role; // JWT에서 역할 정보 추출

            setToken(data.token, role); // Zustand에 토큰과 역할 저장
            alert('로그인 성공!');
            if (role === 'ADMIN') {
                navigate('/admin'); // 관리자는 /admin으로 이동
            } else {
                navigate('/'); // 일반 사용자는 홈으로 이동
            }
        } catch (error) {
            setErrorMessage(error.message || '로그인 요청 중 오류가 발생했습니다.');
        }
    };
    return (
        <div className="login-page">
            <h1>관리자 로그인</h1>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <input
                type="text"
                name="email"
                placeholder="이메일"
                value={formData.email}
                onChange={handleChange}
            />
            <input
                type="password"
                name="password"
                placeholder="비밀번호"
                value={formData.password}
                onChange={handleChange}
            />
            <button onClick={handleLogin}>로그인</button>
        </div>
    );
}

export default AdminLoginPage;
