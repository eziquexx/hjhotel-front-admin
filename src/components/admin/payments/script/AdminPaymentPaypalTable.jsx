import { useState } from "react";
import { Button, Modal, Spinner } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import config from '../../../../config';

// 24.12.06 지은 : PayPal 주문내역 테이블 fin. 상세내역 모달창 작업 fin.
export default function AdminPaymentPaypalTable({ data, loading }) {  
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState(null);

  if (loading) return (
    <div>
        <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
        /> Loading...
    </div>
  );
  if (!data || data.length === 0) return <p>No data available.</p>;

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const formattedDate = date.toISOString().replace('T', ' ').split('.')[0];
    return formattedDate;
  }
  
  // row 클릭 시 API 호출 및 모달 열기
  const handleRowClick = async (itemId) => {
    setLoadingDetails(true);
    setError(null);

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/admin/payments/paypalOrders/${itemId}/details`, {
        method: 'GET', // GET 요청
        credentials: 'include', // 쿠키를 함께 전송
      });
      if (!response.ok) {
        throw new Error("Failed to fetch ayment details.");
      }
      const paymentDetails = await response.json();
      setSelectedItem(paymentDetails);
      setShowModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  // 모달 닫기
  const handleClose = () => {
    setShowModal(false);
    setSelectedItem(null);
  }

  return (
    <div className="table-height-fixed">
      <Table
        responsive="xl"
        border={1}
        className="table-hover table-bordered text-center"
      >
        <thead className="table-light">
          <tr>
            <th>주문ID</th>
            <th>예약ID</th>
            <th>PAYPAL주문ID</th>
            <th>주문상태</th>
            <th>총금액</th>
            <th>생성일</th>
          </tr>
        </thead>
        <tbody className="table-group-divider">
          {data.map((item) => (
            <tr 
              key={item.id}
              onClick={() => handleRowClick(item.id)}
              style={{ cursor: 'pointer' }}
            >
              <td>{item.id}</td>
              <td>{item.reservationId}</td>
              <td>{item.paypalOrderId}</td>
              <td>{item.status}</td>
              <td>{item.amount}</td>
              <td>{formatDate(item.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* 모달 구현 */}
      <Modal
        show={showModal} 
        onHide={handleClose} 
        className="adminPaymentModal"
        size="lg" 
        centered
      >
          <Modal.Header closeButton>
            <Modal.Title>
              PayPal 주문서 상세 정보
              <span style={{fontSize:"14px", marginLeft:"10px"}}>주문 내역만 확인 가능합니다.</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {loadingDetails ? (
              <p>Loading payment details...</p>
            ) : error ? (
              <p>Error: {error}</p>
            ) : (
              selectedItem && (
                <>
                  <p>
                    <strong>주문ID:</strong>
                    <span className="modal-item-text">{selectedItem.id}</span>
                  </p>
                  <p>
                    <strong>예약ID:</strong>
                    <span className="modal-item-text">{selectedItem.reservationId}</span>
                  </p>
                  <p>
                    <strong>PAYPAL주문ID:</strong>
                    <span className="modal-item-text">{selectedItem.paypalOrderId}</span>
                  </p>
                  <p style={{display:"flex", alignItems:"center"}}>
                    <strong>주문상태:</strong>
                    <span className="modal-item-text">{selectedItem.status}</span>
                  </p>            
                  <p>
                    <strong>총금액:</strong>
                    <span className="modal-item-text">{selectedItem.amount}</span>
                  </p>
                  <p>
                    <strong>생성일:</strong>
                    <span className="modal-item-text">{formatDate(selectedItem.createdAt)}</span>
                  </p>
                </>
              )
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>닫기</Button>
          </Modal.Footer>
      </Modal>
    </div>
  );
}