import React, { useState, useEffect } from 'react';
import RoomTable from './comn/RoomTable';
import Modal from './comn/Modal';
import ToggleSwitch from './comn/ToggleSwitch';
import "../css/AddAmenityForm.css";
import config from '../../../../config';

export default function AdminRoomTypeContent() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [amenities, setAmenities] = useState([]);
    const [isAddAmenityPopupOpen, setIsAddAmenityPopupOpen] = useState(false);

    const Ameheader = ["객실이름", "어메니티", "어메니티설명", "활성화"];
    const headers = ["#", "객실타입 ID", "객실이름", "객실설명", "최소인원", "최대인원", "기본가격"];
    const headerKeyMap = {
        "객실타입 ID": "roomTypeId",
        "객실이름": "name",
        "객실설명": "description",
        "최소인원": "baseOccupancy",
        "최대인원": "maxOccupancy",
        "기본가격": "basePrice"
    };
    const AmeheaderKeyMap = {
        "객실이름": "roomTypeName",
        "어메니티": "amenityName",
        "어메니티설명": "description",
        "활성화": "amenityActive"
    };

    const fetchRoomTypes = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${config.API_BASE_URL}/api/admin/rooms/types`,{
                method: 'GET', // GET 요청
                credentials: 'include', // 쿠키를 함께 전송
              });
            if (!response.ok) throw new Error("Failed to fetch room types");
            const data = await response.json();
            setRoomTypes(data);
        } catch (error) {
            console.error("Error fetching room types:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAmenities = async (TypeName) => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/api/admin/rooms/types/${TypeName}`,{
                method: 'GET', // GET 요청
                credentials: 'include', // 쿠키를 함께 전송
              });
            if (!response.ok) {
                throw new Error("Failed to fetch amenities");
            }
            const data = await response.json();
            console.log("Fetched amenities:", data);

            setAmenities(data.map(amenity => ({
                ...amenity,
                amenityActive: amenity.amenityActive
            })));
        } catch (error) {
            console.error("Error fetching amenities:", error);
        }
    };

    const renderAmenityTableCell = (row, header) => {
        const key = AmeheaderKeyMap[header];
        if (key === "amenityActive") {
            return (
                <ToggleSwitch
                    isChecked={row[key]}
                    onToggle={() => toggleAmenity(row.amenityName)}
                    labelOn='ON'
                    labelOff='OFF'
                />
            );
        }
        return row[key] || "";
    };

    useEffect(() => {
        fetchRoomTypes();
    }, []);

    useEffect(() => {
        if (selectedRoom) {
            fetchAmenities(selectedRoom.name);
        }
    }, [selectedRoom]);

    const handleRowClick = (row) => {
        console.log("Selected row:", row);
        setSelectedRoom(row);
        setIsModalOpen(true);
    };

    const toggleAmenity = async (amenityName) => {
        try {
            // 현재 상태를 가져와서 반전시킵니다.
            const currentAmenity = amenities.find(
                (amenity) => amenity.amenityName === amenityName
            );
            const newState = !currentAmenity.amenityActive;

            const response = await fetch(
                `${config.API_BASE_URL}/api/admin/rooms/toggle?TypeName=${selectedRoom.name}&amenity=${amenityName}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'include', // 쿠키를 함께 전송
                }
            );
            if (!response.ok) throw new Error("Failed to update amenity");

            // 상태 반영 (불변성을 유지하며 업데이트)
            setAmenities((prevAmenities) =>
                prevAmenities.map((amenity) =>
                    amenity.amenityName === amenityName
                        ? { ...amenity, amenityActive: newState }
                        : amenity
                )
            );
        } catch (error) {
            console.error("Error updating amenity:", error);
        }
    };

    const renderTableCell = (row, header) => {
        if (header === "#") {
            return roomTypes.indexOf(row) + 1;
        }
        const key = headerKeyMap[header];
        if (key === "basePrice") {
            return row[key] ? row[key].toLocaleString() + "원" : "";
        }
        return row[key] || "";
    };

    const openAddAmenityPopup = () => {
        setIsAddAmenityPopupOpen(true);
    };

    const closeAddAmenityPopup = () => {
        setIsAddAmenityPopupOpen(false);
    };

    const handleAddAmenitySubmit = async (e, amenityData) => {
        e.preventDefault();
        try {
            const response = await fetch(`${config.API_BASE_URL}/api/admin/rooms/addamenity`, {
                method: 'POST', // HTTP 메서드를 POST로 수정

                headers: {
                    'Content-Type': 'application/json', // 요청 본문 형식 지정
                },
                credentials: 'include', // 쿠키를 함께 전송
                body: JSON.stringify({ ...amenityData, roomTypeId: selectedRoom.roomTypeId }), // 데이터 전송
            });

            if (!response.ok) {
                const errorText = await response.text(); // 서버에서 반환한 에러 메시지 확인
                throw new Error(`Failed to add amenity: ${errorText}`);
            }

            console.log('어메니티 추가 완료', response);
            fetchAmenities(selectedRoom.name); // 어메니티 목록 새로고침
            closeAddAmenityPopup(); // 팝업 닫기
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
                        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
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
                            <button onClick={openAddAmenityPopup} className="add-btn">어메니티 추가</button>
                        </Modal>
                    )}
                    {isAddAmenityPopupOpen && (
                        <Modal isOpen={isAddAmenityPopupOpen} onClose={() => setIsAddAmenityPopupOpen(false)}>
                            <div className='addAmenityBtn'><h3>어메니티 추가</h3></div>
                            <AddAmenityForm
                                onSubmit={(e, amenityData) => handleAddAmenitySubmit(e, amenityData)}
                                onClose={closeAddAmenityPopup}
                            />
                        </Modal>
                    )}
                </>
            )}
        </div>
    );
}

const AddAmenityForm = ({ onSubmit, onClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);

    const handleSubmit = (e) => {
        onSubmit(e, { name, description, isActive });
        onClose();
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