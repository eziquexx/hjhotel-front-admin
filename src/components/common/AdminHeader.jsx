import { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import ButtonEx from "./ButtonEx";
import "./css/AdminHeader.css";
import config from '../../config';

//24.11.25 지은 [완료] : AdminHeader 링크 테스트
export default function AdminHeader() {
  const [staffUserId, setStaffUserId] = useState(""); // 관리자 아이디 상태

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

  // 관리자 아이디 가져오기
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${config.API_BASE_URL}/api/admin/protected`, {
          credentials: "include", // 세션 정보를 포함
        });
        if (response.ok) {
          const data = await response.json();
          setStaffUserId(data.staffUserId); // staffUserId 업데이트
        } else {
          console.error("Failed to fetch profile");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div id="adminHeaderContainer">
      <Navbar collapseOnSelect expand="xxl" className="bg-body-tertiary">
        <Container fluid>
          <Navbar.Brand>
            <ButtonEx
              id={"adminHome"}
              url={"/admin"}
              className={"adminHomeBtn"}
            >
              StarellaHotel Admin
            </ButtonEx>
          </Navbar.Brand>
          <Nav className="me-auto">
            <Link to="/admin">
              <span className="material-symbols-outlined">home</span>
            </Link>
          </Nav>
          <Navbar.Text>{staffUserId}님 환영합니다.</Navbar.Text>
          <Button
              variant="outline-primary"
              className="logoutBtn"
              onClick={handleLogout} // onClick 이벤트에 handleLogout 연결
          >
            로그아웃
          </Button>



        </Container>
      </Navbar>
    </div>
  );
}
