import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get("http://localhost:8080/api/admin/admininfo", {
          withCredentials: true,
        });
        if (response.status === 200) {
            setUserInfo(response.data);
            setIsLoggedIn(true);
            console.log("User Info:", response.data);
        } else {
          setIsLoggedIn(false);
          navigate("/admin/login");
        }
      } catch (err) {
          console.error("Error:", err);
           setIsLoggedIn(false);
          setError(err);
          navigate("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  return { userInfo, loading, error, isLoggedIn };
};

// const useUserInfo = (isLoggedIn) => {
//     const [userInfo, setUserInfo] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const navigate = useNavigate();


//     useEffect(() => {
//       const checkLoginStatus = async () => {
//           setLoading(true);
//           setError(null);

//           try {
//               const response = await fetch('http://localhost:8080/api/admininfo', {
//                   method: 'GET',
//                   credentials: 'include',
//               });
//                console.log("Response Status:", response.status); // 응답 상태 로그
//               if (response.ok) {
//                   const data = await response.json();
//                   setUserInfo(data);
//                   console.log("User Info:", data); // 콘솔에 사용자 정보 로그
//               } else {
//                   console.error("로그인되지 않았습니다. Status:", response.status);
//                    if(response.status === 403){
//                     console.error("403 오류 발생, 토큰 만료 또는 유효하지 않음")
//                   }
//                 navigate("/admin/login");
//               }
//           } catch (err) {
//             console.error("Error:", err);
//               setError(err);
//             navigate("/admin/login");
//           } finally {
//               setLoading(false);
//           }
//         };
//       if(isLoggedIn){
//            checkLoginStatus();
//        }else{
//            setLoading(false);
//        }

//     }, [navigate,isLoggedIn]);

//     return { userInfo, loading, error };
// };

export default useUserInfo;