import { useEffect, useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import AdminNoticeMoveBackModal from "./AdminNoticeMoveBackModal";
import AdminNoticeEditModal from "./AdminNoticeEditModal";
import AdminNoticeEditSuccessModal from "./AdminNoticeEditSuccessModal";
import AdminNoticeDeleteModal from "./AdminNoticeDeleteModal";
import AdminNoticeDeleteSuccessModal from "./AdminNoticeDeleteSuccessModal";
import config from '../../../../config';

export default function AdminNoticeDetailPage() {
    const navigate = useNavigate();
    const { noticeId } = useParams();
    const [ originalData, setOriginalData ] = useState(null); // 원본 데이터 저장
    const [ data, setData ] = useState(null); // 수정 데이터 저장
    const [ selectedImportant, setSelectedImportant ] = useState('');
    const [ selectedCategory, setSelectedCategory ] = useState('');
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(null);
    const [ showModal, setShowModal ] = useState(false);
    const [ showSaveModal, setShowSaveModal ] = useState(false);
    const [ isEditButtonDisabled, setIsEditButtonDisabled] = useState("disabled");
    const [ showSaveCompletedModal, setShowSaveCompletedModal ] = useState(false);
    const [ saveSuccess, setSaveSuccess ] = useState(false);
    const [ showDeleteModal, setShowDeleteModal ] = useState(false);
    const [ deleteSuccess, setDeleteSuccess ] = useState(false);
    const [ showDeleteCompletedModal, setShowDeleteCompletedModal ] = useState(false);

    // 해당 게시글 상세내용 api 호출 함수
    const fetchNotice = async () => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/api/admin/notices/${noticeId}`,{
                method: 'GET', // GET 요청
                credentials: 'include', // 쿠키를 함께 전송
              });
            const data = await response.json();
            setData(data); // fetch문으로 가져온 데이터 저장
            setOriginalData(data); // 원본으로도 저장하기
            setSelectedImportant(data.isImportant ? '1' : '0');
            setSelectedCategory(data.category);
            setLoading(false);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    // 첫 렌더링시 fetchNotice 함수 호출
    useEffect(() => {
        const fetchNotice = async () => {
            try {
                const response = await fetch(`${config.API_BASE_URL}/api/admin/notices/${noticeId}`,{
                    method: 'GET', // GET 요청
                    credentials: 'include', // 쿠키를 함께 전송
                  });
                const data = await response.json();
                setData(data); // fetch문으로 가져온 데이터 저장
                setOriginalData(data); // 원본으로도 저장하기
                setSelectedImportant(data.isImportant ? '1' : '0');
                setSelectedCategory(data.category);
                // setSelectedValue(data.importance.toString()); // 중요도 설정 (API에 따라 필드명 수정 필요)
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
            
        };
        fetchNotice();
    },[noticeId])

    // data와 originalData가 둘 다 준비되었을 때만 실행되도록 조건 처리
    useEffect(() => {
        if (data && originalData) {
            if (
                originalData.category !== data.category ||
                originalData.isImportant !== data.isImportant ||
                originalData.title !== data.title ||
                originalData.content !== data.content
            ) {
                setIsEditButtonDisabled("");
            } else {
                setIsEditButtonDisabled("disabled");
            }
        }
    }, [data, originalData]); // data나 originalData가 변경될 때마다 실행

    // 수정 내용 DB에 저장 handler
    const handleSaveChanges = async () => {
        // 수정된 내용 api 호출해서 db에 저장하기
        try {
            const response = await fetch(`${config.API_BASE_URL}/api/admin/notices/${noticeId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: data.noticeId,
                    title: data.title,
                    content: data.content,
                    category: data.category,
                    isImportant: data.isImportant,
                }),
                credentials: 'include',
            });
            console.log(response.status);
            if (response.status === 200) {
                const result = await response.text();
                console.log(result);
                setSaveSuccess(true);
                fetchNotice();
            } else {
                console.error("수정 실패", response.status);
                setSaveSuccess(false);
            }
        } catch (error) {
            console.error("에러 발생", error);
            setSaveSuccess(false);
        } finally {
            setShowSaveCompletedModal(true);
        }
    }
    
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!data) return <div>No data</div>

    // 날짜
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        const formattedDate = date.toISOString().replace('T', ' ').split('.')[0];
        return formattedDate;
    }

    // input 변경 핸들러
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setData({ ...data, [name]: value });
    };

    // 중요도 변경 handler
    const handleImportanceChange = (e) => {
        setSelectedImportant(e.target.value);
        setData({ ...data, isImportant: e.target.value === '1' }); 
    };

    // 카테고리 변경 handler
    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        setData({ ...data, category: e.target.value });
    }

    //console.log(data); // 테스트용 콘솔

    // 모달창 닫기
    const handleCloseModal = () => {
        setShowModal(false);
        setShowSaveModal(false);
        setShowSaveCompletedModal(false);
        setShowDeleteModal(false);
        setShowDeleteCompletedModal(false);
    };

    // 뒤로가기 modal
    const handleMoveBack = () => {
        // 수정 여부 확인
        if (JSON.stringify(data) !== JSON.stringify(originalData)) {
            setShowModal(true);
        } else {
            navigate(-1);
        }
    };

    // 뒤로가기 확인 모달에서 뒤로가기 클릭시 이동    
    const handleConfirmMoveBack = () => {
        setShowModal(false);
        navigate(-1);
    };

    // 수정 모달 오픈.
    const handleEditModal = () => {
        setShowSaveModal(true);
    }

    // 삭제 모달 오픈
    const handleDeleteModal = () => {
        setShowDeleteModal(true);
    }

    // 삭제 api
    const handleDeleteChanges = async () => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/api/admin/notices/${noticeId}`, {
                method: "DELETE",
                credentials: 'include',
            })
            console.log(response.status);
            if (response.status === 200) {
                const result = await response.text();
                console.log(result);
                setDeleteSuccess(true);
            } else {
                console.error("삭제 실패", response.status);
                setDeleteSuccess(false);
            }
        } catch(error) {
            console.error("에러 발생", error);
            setDeleteSuccess(false);
        } finally {
            setShowDeleteCompletedModal(true);
        }
    }

    // 삭제 성공 모달에서 닫기 버튼 클릭시 뒤로 이동
    const handleDeleteBackMove = () => {
        navigate(-1);
    }
    
    return (
        <> 
            <div>
                <h5 className="contentTitle">공지사항 상세</h5>
                <Form className="detailFormWrap">
                    <Form.Group as={Row} className="mb-3" controlId="">
                        <Form.Label column sm={1}>게시판 ID</Form.Label>
                        <Col sm={3}>
                            <Form.Control plaintext readOnly defaultValue={data.noticeId} />
                        </Col>
                        <Form.Label column sm={1}>중요도</Form.Label>
                        <Col sm={3}>
                            <Form.Select 
                                aria-label="Default select example" 
                                value={selectedImportant}
                                onChange={handleImportanceChange}
                            >
                                <option value="">-- 선택 --</option>
                                <option value="1">중요</option>
                                <option value="0">보통</option>
                            </Form.Select>
                        </Col>
                    </Form.Group>
                    
                    <Form.Group as={Row} className="mb-3" controlId="">
                        <Form.Label column sm={1}>카테고리</Form.Label>
                        <Col sm={3}>
                            <Form.Select 
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                            >
                                <option value="">-- 선택 --</option>
                                <option value="NOTICE">NOTICE</option>
                                <option value="EVENT">EVENT</option>
                                <option value="INFO">INFO</option>
                            </Form.Select>
                        </Col>
                        <Form.Label column sm={1}>조회수</Form.Label>
                        <Col sm={3}>
                            <Form.Control plaintext readOnly defaultValue={data.views} />
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3" controlId="">
                        <Form.Label column sm={1}>작성일</Form.Label>
                        <Col sm={3}>
                            <Form.Control plaintext readOnly defaultValue={formatDate(data.createdAt)} />
                        </Col>
                        <Form.Label column sm={1}>수정일</Form.Label>
                        <Col sm={3}>
                            <Form.Control plaintext readOnly defaultValue={formatDate(data.updatedAt)} />
                        </Col>
                    </Form.Group>
    
                    <Form.Group as={Row} className="mb-3" controlId="">
                        <Form.Label column sm={1}>제목</Form.Label>
                        <Col sm={11}>
                            <Form.Control 
                                type="text" 
                                name="title"
                                value={data.title} 
                                onChange={handleInputChange}
                            />
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3" controlId="">
                        <Form.Label column sm={1}>내용</Form.Label>
                        <Col sm={11}>
                            <Form.Control 
                                as="textarea" 
                                name="content"
                                value={data.content} 
                                onChange={handleInputChange}
                                style={{resize: "none"}}
                                rows= "14"
                            />
                        </Col>
                    </Form.Group>

                    <div className="btnGroup">
                        <Button 
                            variant="secondary" 
                            onClick={handleMoveBack}
                        >
                            뒤로
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={handleEditModal} 
                            disabled={isEditButtonDisabled}
                        >
                            수정
                        </Button>
                        <Button 
                            variant="danger"
                            onClick={handleDeleteModal}
                        >
                            삭제
                        </Button>
                    </div>
                </Form>
            </div>

            {/* 뒤로가기 버튼 클릭시 나오는 modal */}
            <AdminNoticeMoveBackModal 
                showModal={showModal}
                handleCloseModal={handleCloseModal}
                handleConfirmMoveBack={handleConfirmMoveBack}
            />

            {/* 수정 확인 모달 */}
            <AdminNoticeEditModal
                showSaveModal={showSaveModal}
                handleCloseModal={handleCloseModal}
                handleSaveChanges={handleSaveChanges}
            />

            {/* 수정 완료 모달 */}
            <AdminNoticeEditSuccessModal 
                showSaveCompletedModal={showSaveCompletedModal}
                handleCloseModal={handleCloseModal}
                saveSuccess={saveSuccess}
            />

            {/* 삭제 확인 모달 */}
            <AdminNoticeDeleteModal 
                showDeleteModal={showDeleteModal}
                handleCloseModal={handleCloseModal}
                handleDeleteChanges={handleDeleteChanges}
            />

            {/* 삭제 완료 모달 */}
            <AdminNoticeDeleteSuccessModal 
                showDeleteCompletedModal={showDeleteCompletedModal}
                handleCloseModal={handleCloseModal}
                deleteSuccess={deleteSuccess}
                handleDeleteBackMove={handleDeleteBackMove}
            />
            
        </>
    );
}