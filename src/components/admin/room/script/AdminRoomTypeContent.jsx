import React, { useState, useEffect } from 'react';
import RoomTable from './comn/RoomTable';
import Popup from './comn/Popup';
import ToggleSwitch from './comn/ToggleSwitch';
import "../css/AddAmenityForm.css";


export default function AdminRoomTypeContent() {
    const [roomTypes, setRoomTypes] = useState([]); // DB에서 가져온 객실 데이터
    const [loading, setLoading] = useState(false); // 로딩 상태
    const [selectedRoom, setSelectedRoom] = useState(null); // 선택된 행 데이터
    const [amenities, setAmenities] = useState([]); // 선택된 객실의 어메니티 상태
    const [isAddAmenityPopupOpen, setIsAddAmenityPopupOpen] = useState(false); //어메니티 추가 팝업
    const Ameheader = ["객실이름","어메니티","어메니티설명","활성화"];//팝업 어메니티 테이블
    const headers = ["#", "객실타입 ID", "객실이름", "객실설명", "최소인원", "최대인원", "기본가격"]; // 테이블 헤더
    const headerKeyMap = {
        "객실타입 ID": "roomTypeId",
        "객실이름": "name",
        "객실설명": "description",
        "최소인원": "baseOccupancy",
        "최대인원": "maxOccupancy",
        "기본가격": "basePrice"
    };
    const AmeheaderKeyMap = {
       "객실이름":"roomTypeName",
        "어메니티":"amenityName",
        "어메니티설명":"description",
        "활성화":"amenityActive"}

    // 데이터 로드
    const fetchRoomTypes = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:8080/api/admin/rooms/types`);
            if (!response.ok) throw new Error("Failed to fetch room types");
            const data = await response.json();
            setRoomTypes(data); // 데이터 저장
        } catch (error) {
            console.error("Error fetching room types:", error);
        } finally {
            setLoading(false);
        }
    };

    // 어메니티 데이터 로드
    const fetchAmenities = async (TypeName) => {
        try {
            const response = await fetch(`http://localhost:8080/api/admin/rooms/types/${TypeName}`);
            if (!response.ok) {
                throw new Error("Failed to fetch amenities");
            }
            const data = await response.json();
            console.log("Fetched amenities:", data); // 데이터 확인

        // 어메니티 데이터 업데이트
        setAmenities(data.map(amenity => ({
            ...amenity,
            amenityActive: amenity.amenityActive // DB의 isActive 여부 반영
        })));

        } catch (error) {
            console.error("Error fetching amenities:", error);
        }
    };

     // 어메니티 테이블 셀 렌더링 함수
     const renderAmenityTableCell = (row, header) => {
        const key = AmeheaderKeyMap[header];
        if (key === "amenityActive") {
            return (
                <ToggleSwitch
                isChecked={row[key]}
                onToggle={(newState)=>toggleAmenity(row.amenityName,newState)}
                labelOn='ON'
                labelOff='OFF'
                />
            );
        }
        return row[key] || "";
    };

    // 컴포넌트 마운트 시 API 호출
    useEffect(() => {
        fetchRoomTypes();
    }, []);

    useEffect(() => {
        if(selectedRoom){}
    }, [amenities,selectedRoom]);

    // 행 클릭 시 선택된 객실의 어메니티 로드
    const handleRowClick = (row) => {
        console.log("Selected row:", row);
        setSelectedRoom(row);
        fetchAmenities(row.name); // roomTypeName을 사용해야 함 (row.name)

    
    };

    useEffect(() => {
        console.log("selectedRoom 변경됨:", selectedRoom);
    
        
    }, [selectedRoom]
);


   
    // 어메니티 상태 변경
    // 어메니티 상태 변경
const toggleAmenity = async (amenityName, currentState) => {
    const newState = currentState ? "OFF" : "ON"; // 토글 상태 변경
    try {
        const response = await fetch(
            `http://localhost:8080/api/admin/rooms/toggle?TypeName=${selectedRoom.name}&amenity=${amenityName}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
            }
        );
        if (!response.ok) throw new Error("Failed to update amenity");

        // 상태 반영 (불변성을 유지하며 업데이트)
        setAmenities((prevAmenities) => 
            prevAmenities.map((amenity) => 
                amenity.amenityName === amenityName 
                    ? { ...amenity, amenityActive: newState === "ON" } // 여기서 `newState` 반영
                    : amenity
            )
        );
    } catch (error) {
        console.error("Error updating amenity:", error);
    }
};
    

    // 테이블 셀 렌더링 함수
    const renderTableCell = (row, header) => {
        if (header === "#") {
            return roomTypes.indexOf(row) + 1; // 인덱스 번호
        }
        const key = headerKeyMap[header];
        if(key === "basePrice"){
            return row[key] ? row[key].toLocaleString()+"원":"";
        }
        return row[key] || ""; // 매핑된 키로 데이터 반환
    };

    //어메니티 추가 팝업 열기
    const openAddAmenityPopup = () =>{
        setIsAddAmenityPopupOpen(true);
    };

    const closeAddAmenityPopup = () =>{
        setIsAddAmenityPopupOpen(false);
    };

    //어메니티 추가폼
    const handleAddAmenitySubmit = async (e, amenityData) => {
        e.preventDefault();
         try {
             const response = await fetch('http://localhost:8080/api/admin/rooms/addamenity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                 },
                body: JSON.stringify({ ...amenityData, roomTypeId: selectedRoom.roomTypeId}),
             });

        if (!response.ok) {
              throw new Error('Failed to add amenity');
        }
        console.log('어메니티 추가 완료',response);
        fetchAmenities(selectedRoom.name); // 어메니티 목록 갱신
        closeAddAmenityPopup();
        } catch (error) {
            console.error('어메니티 추가 실패:', error);
        }
    };

    return (
        <div className="room-content-container">
            <h2>객실 타입 관리</h2>
            {loading ? (
                <p>로딩 중...</p>
            ) : (
                <>
                    <RoomTable
                        headers={headers}
                        rows={roomTypes}
                        renderCell={renderTableCell}
                        onRowClick={handleRowClick}
                    />
                    {selectedRoom && (
                        <Popup onClose={() => setSelectedRoom(null)}>
                            <h3>{selectedRoom.name} 어메니티</h3>
                            {amenities.length === 0 ? (
                                <p>어메니티가 없습니다.</p>
                            ) : (
                                <RoomTable
                                headers={Ameheader}
                                rows={amenities}
                                renderCell={renderAmenityTableCell}
                            />
                            )}
                            <button onClick={openAddAmenityPopup} className="add-btn">어메니티 추가</button> {/* 수정됨: 어메니티 추가 버튼 추가 */}
                        </Popup>
                    )}
                    {isAddAmenityPopupOpen && (
                    <Popup onClose={closeAddAmenityPopup}>
                        <div className='addAmenityBtn'><h3>어메니티 추가</h3></div>
                       <AddAmenityForm onSubmit={handleAddAmenitySubmit} onClose={closeAddAmenityPopup}/>
                   </Popup>)}
                </>
            )}
        </div>
    );
}
const AddAmenityForm = ({ onSubmit,onClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
  
    const handleSubmit = (e) => {
      onSubmit(e, {name, description, isActive});
      onClose()
    };
  
    return (
      <form onSubmit={handleSubmit} className='addAmenity-form'>
        <div className='addAmenity-form-group'>
         <label>어메니티 이름:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
         <div className='addAmenity-form-group'>
        <label>설명:</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div className='addAmenity-form-group'>
         <label>활성화:</label>
        <select value={isActive} onChange={(e) => setIsActive(e.target.value === 'true')}>
          <option value={true}>활성화</option>
            <option value={false}>비활성화</option>
        </select>
      </div>
        <button type="submit" className='add-btn'>추가</button>
      </form>
    );
  };