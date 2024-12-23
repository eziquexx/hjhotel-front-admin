import { useState } from "react";
import { Button, Modal, Spinner } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import config from '../../../../config';

// 24.12.06 지은 : 결제내역 테이블 fin. 상세내역 모달창 작업 fin.
export default function AdminPaymentTable({ data, loading }) {
  const [items, setItems] = useState(data);
  const [showModal, setShowModal] = useState(false);
  const [smDeleteAlert, setSmDeleteAlert] = useState(false);
  const [smStatusChangeAlert, setSmStatusChangeAlert] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemStatus, setItemStatus] = useState('');
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState(null);
  const [delError, setDelError] = useState(null);
  const [delSuccess, setDelSuccess] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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
      const response = await fetch(`${config.API_BASE_URL}/api/admin/payments/${itemId}/details`, {
        method: 'GET', // GET 요청
        credentials: 'include', // 쿠키를 함께 전송
      });
      if (!response.ok) {
        throw new Error("Failed to fetch ayment details.");
      }
      const paymentDetails = await response.json();
      setSelectedItem(paymentDetails);
      setItemStatus(paymentDetails.paymentStatus);
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

  const handleClose2 = () => {
    setSmDeleteAlert(false);
    setSmStatusChangeAlert(false);
    setShowModal(false);
    setSelectedItem(null);
  }

  // 상태값 변경되는대로 저장
  const handleSelectChange = (event) => {
    const newStatus = event.target.value;
    setItemStatus(newStatus);
  }

  // 상태값 change modal
  const statusSaveAlert = () => {
    setSmStatusChangeAlert(true); // 삭제알림창오픈
  }

  // 상태값 db에 update
  const updateStatus = async(paymentId, newStatus) => {
    // 상태값 update api 호출
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/admin/payments/${paymentId}/status?newStatus=${newStatus}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include', // 쿠키를 함께 전송
      });

      if (response.ok) {
        const result = await response.text();
        console.log('Payment status updated successfully:', result);

        setItems((prevItems) =>
          prevItems.map((item) =>
            item.paymentId === paymentId ?
            { ...item, paymentStatus: newStatus }
            : item
          )
        );

        setSaveSuccess(result.message || "상태가 성공적으로 변경되었습니다.");
        setIsSaved(true);
      } else {
        console.error('Failed to update payment status:', data);
        return null;
      }
    } catch (err) {
      console.error('Error updating payment status:', error);
      setSaveError(err.message || "예기치 않은 오류가 발생했습니다.");
    }
  }


  // row delete modal
  const rowDeleteAlert = () => {
    setSmDeleteAlert(true); // 삭제알림창오픈
  }

  // row Real Delete function api
  const rowRealDelete = async () => {
    // 삭제 api 호출
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/admin/payments/${selectedItem.paymentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type" : "application/json",
        },
        credentials: 'include', // 쿠키를 함께 전송
      });

      if (!response.ok) {
        throw new Error("삭제 요청에 실패했습니다.");
      }
      const result = await response.text();
      setDelSuccess(result.message || "삭제가 성공적으로 완료되었습니다.");

      setItems(items.filter(item => item.paymentId !== selectedItem.paymentId));
      setIsDeleted(true); // 삭제 성공시 상태 설정
    } catch (err) {
      console.log(err);
      setDelError(err.message || "예기치 않은 오류가 발생했습니다.");
    } finally {
      //완료후 처리할 내용. 없음.
    }
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
            <th>결제ID</th>
            <th>주문ID</th>
            <th>예약ID</th>
            <th>회원ID</th>
            <th>회원이름</th>
            <th>결제방식</th>
            <th>결제상태</th>
            <th>총금액</th>
            <th>생성일</th>
            <th>수정일</th>
          </tr>
        </thead>
        <tbody className="table-group-divider">
          {items.map((item) => (
            <tr
              key={item.paymentId}
              onClick={() => handleRowClick(item.paymentId)}
              style={{ cursor: 'pointer' }}
            >
              <td>{item.paymentId}</td>
              <td>{item.orderId}</td>
              <td>{item.reservationId}</td>
              <td>{item.userId}</td>
              <td>{item.memberName}</td>
              <td>{item.paymentMethod}</td>
              <td>{item.paymentStatus}</td>
              <td>{item.amount}</td>
              <td>{formatDate(item.createdAt)}</td>
              <td>{formatDate(item.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* row 모달 구현 */}
      <Modal
        show={showModal}
        onHide={handleClose}
        className="adminPaymentModal"
        size="lg"
        centered
        style={{zIndex:"1050"}}
      >
          <Modal.Header closeButton>
            <Modal.Title>
              결제 상세 정보
              <span style={{fontSize:"14px", marginLeft:"10px"}}>상태 변경(취소)/삭제 가능합니다.</span>
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
                    <strong>결제ID:</strong>
                    <span className="modal-item-text">{selectedItem.paymentId}</span>
                  </p>
                  <p>
                    <strong>예약ID:</strong>
                    <span className="modal-item-text">{selectedItem.reservationId}</span>
                  </p>
                  <p>
                    <strong>회원이름:</strong>
                    <span className="modal-item-text">{selectedItem.memberName}</span>
                  </p>
                  <p>
                    <strong>결제방식:</strong>
                    <span className="modal-item-text">{selectedItem.paymentMethod}</span>
                  </p>
                  <p style={{display:"flex", alignItems:"center"}}>
                    <strong>결제상태:</strong>
                    <span
                      className="modal-item-text"
                      style={{width:"90px"}}
                    >
                        {itemStatus}</span>
                    <select
                      className="form-select form-select-sm"
                      aria-label="Default select example"
                      style={{width:"130px", marginLeft:"10px"}}
                      value={itemStatus}
                      onChange={handleSelectChange}
                    >
                      <option value="" selected>--- 선택 ---</option>
                      <option value="PENDING">PENDING</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </p>
                  <p>
                    <strong>총금액:</strong>
                    <span className="modal-item-text">{selectedItem.amount}</span>
                  </p>
                  <p>
                    <strong>트랜잭션ID:</strong>
                    <span className="modal-item-text">{selectedItem.transactionId}</span>
                  </p>
                  <p>
                    <strong>생성일:</strong>
                    <span className="modal-item-text">{formatDate(selectedItem.paymentDate)}</span>
                  </p>
                  <p>
                    <strong>수정일:</strong>
                    <span className="modal-item-text">{formatDate(selectedItem.paymentUpdate)}</span>
                  </p>
                </>
              )
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>취소</Button>
            <Button
              variant="primary"
              style={{display:"flex", alignItems:"center"}}
              onClick={statusSaveAlert}
            >
              <span
                className="material-symbols-outlined"
                style={{fontSize:"16px", marginRight:"2px"}}
              >
                check
              </span>
              저장
            </Button>
            <Button
              variant="danger"
              style={{display:"flex", alignItems:"center"}}
              onClick={rowDeleteAlert}
              className="me-2"
            >
              <span className="material-symbols-outlined" style={{fontSize:"16px", marginRight:"2px"}}>
                delete
              </span>
              삭제
            </Button>
          </Modal.Footer>
      </Modal>

      {/* save modal 구현 */}
      <Modal
        size="sm"
        show={smStatusChangeAlert}
        onHide={() => setSmStatusChangeAlert(false)}
        aria-labelledby="example-modal-sizes-title-sm"
        centered
        style={{zIndex:"1055"}}
      >
        <Modal.Body
          className="text-center"
          style={{margin:"20px 0"}}
        >
          {isSaved ? (
            <p style={{ color: "green "}}>
              상태가 성공적으로 변경되었습니다!
            </p>
          ) : (
            <>
              정말로 상태를 하시겠습니까?
              {saveError && <p style={{ color: "red"}}>{saveError}</p>}
              {saveSuccess && <p style={{ color: "green"}}>{saveSuccess}</p>}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {isSaved ? (
            <Button variant="secondary" onClick={handleClose2}>
              닫기
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={handleClose2}>
                취소
              </Button>
              <Button
                variant="primary"
                style={{display:"flex", alignItems:"center"}}
                onClick={() => updateStatus(selectedItem.paymentId, itemStatus)}
                className="me-2"
              >저장
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* delete modal 구현 */}
      <Modal
        size="sm"
        show={smDeleteAlert}
        onHide={() => setSmDeleteAlert(false)}
        aria-labelledby="example-modal-sizes-title-sm"
        centered
        style={{zIndex:"1055"}}
      >
        <Modal.Body
          className="text-center"
          style={{margin:"20px 0"}}
        >
          {isDeleted ? (
            <p style={{ color: "green "}}>
              삭제가 성공적으로 완료되었습니다!
            </p>
          ) : (
            <>
              정말로 삭제를 하시겠습니까?
              {delError && <p style={{ color: "red"}}>{delError}</p>}
              {delSuccess && <p style={{ color: "green"}}>{delSuccess}</p>}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {isDeleted ? (
            <Button variant="secondary" onClick={handleClose2}>
              닫기
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={handleClose2}>
                취소
              </Button>
              <Button
                variant="danger"
                style={{display:"flex", alignItems:"center"}}
                onClick={rowRealDelete}
                className="me-2"
              >삭제
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}