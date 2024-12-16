import React, { useState, useEffect } from "react";
import "../css/ToggleSwitch.css";
import ToggleSwitch from "./comn/ToggleSwitch"; // 토글 버튼 컴포넌트
import RoomTable from "./comn/RoomTable";


export default function AdminRoomContent() {
    const [rooms, setRooms] = useState([]);
    const [date, setDate] = useState(""); // 날짜
    const [resStatus, setStatus] = useState(""); // 객실 상태
    const [loading, setLoading] = useState(false); // 로딩 상태
    const statusOptions = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];
    const headers = ["#","예약ID","객실ID","객실타입","객실호수","층수","객실전망","예약상태","객실상태","상태변경",""]
    const headerKeyMap = {
      "예약ID": "reservationId",
      "객실ID": "roomId",
      "객실타입": "name",
      "객실호수": "roomNumber",
      "층수": "floor",
      "객실상태": "status",
      "객실전망": "view",
      "예약상태":"reservationStatus"
  };
  
    // API 요청
    const fetchRooms = async () => {
        try {
            setLoading(true);

            // requestParam을 URL에 추가
            let queryParams = new URLSearchParams({ date: date || "" });
            let apiUrl = "";

            if (resStatus) {
                queryParams.append("resStatus", resStatus);
                apiUrl = `?${queryParams}`;
            } else {
                apiUrl = `/roomdetails?${queryParams}`;
            }

            const response = await fetch(`http://localhost:8080/api/admin/rooms${apiUrl}`,{
                method: 'GET', // GET 요청
                credentials: 'include', // 쿠키를 함께 전송
              });
            if (!response.ok) throw new Error("Failed to fetch rooms");

            const data = await response.json();
            setRooms(data);
        } catch (error) {
            console.error("Error fetching rooms:", error);
        } finally {
            setLoading(false);
        }
    };

    // 객실 상태 변경 API
    const handleRoomStatusToggle = async (roomNumber, newState) => {
        const newStatus = newState ? "AVAILABLE" : "OCCUPIED"; // 토글 상태 변경
        try {
            const response = await fetch(
                `http://localhost:8080/api/admin/rooms/details/${roomNumber}/${newStatus}`,
                {
                    method: "PUT",
                    credentials: 'include', 
                }
            );
            if (response.ok) {
                console.log(`${roomNumber} 호실 상태 변경 완료!`);
                // 상태 변경 후 데이터를 다시 불러오기
                setRooms((prevRooms) =>
                    prevRooms.map((room) =>
                        room.roomNumber === roomNumber
                            ? { ...room, status: newStatus }
                            : room
                    )
                );
            } else {
                console.error("객실 상태 업데이트 실패!");
            }
        } catch (error) {
            console.error("객실 업데이트 중 에러 발생: ", error);
        }
    };
    const renderTableCell = (row,header)=>{
      const key = headerKeyMap[header];
      if(header === "상태변경"){
        return(
          <ToggleSwitch
          isChecked={row.status ==="AVAILABLE"}
          onToggle={(newState)=> handleRoomStatusToggle(row.roomNumber,newState)}
          labelOn="체크아웃"
          labelOff="체크인"
          />
        );
      }
      if(header === "#"){
        return rooms.indexOf(row)+1;
      }
      return row[key] || "";
    }

    // 조회 버튼 클릭시 실행되는 함수
    const handleSearch = () => {
        if (!date) {
            alert("날짜를 입력하세요.");
            return;
        }
        fetchRooms();
    };

    return (
        <div className="room-table-container">
    <h2>객실관리</h2>
    {/* 조건 입력 필드 */}
    <div>
        <label htmlFor="date">예약 날짜 : </label>
        <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
        />
        <label htmlFor="status">객실 예약 상태 : </label>
        <select
            id="status"
            value={resStatus}
            onChange={(e) => setStatus(e.target.value)}
        >
            <option value="">== 상태 선택 ==</option>
            {statusOptions.map((status) => (
                <option key={status} value={status}>
                    {status}
                </option>
            ))}
        </select>
        <button onClick={handleSearch}>조회</button>
    </div>
    {/* 로딩 중 표시 */}
    {loading && <p>로딩중 ..</p>}

    {/* 테이블 */}
   <RoomTable
   headers={headers} rows={rooms} renderCell={renderTableCell}
   
   />
</div>

    );
}
