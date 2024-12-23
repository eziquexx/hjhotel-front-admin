import { useEffect, useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import AdminNoticeCreateFiledCheckModal from "./AdminNoticeCreateFiledCheckModal";
import { useNavigate } from "react-router-dom";
import AdminNoticeCreateSuccessModal from "./AdminNoticeCreateSuccessModal";
import AdminNoticeCreateFailedModal from "./AdminNoticeCreateFailedModal";
import config from "../../../../config";

export default function AdminNoticeCreatePage() {
    const [ selectedImportant, setSelectedImportant ] = useState("");
    const [ selectedCategory, setSelectedCategory ] = useState("");
    const [ title, setTitle ] = useState("");
    const [ content, setContent ] = useState("");
    const [ debouncedTitle, setDebouncedTitle ] = useState("");
    const [ debouncedContent, setDebouncedContent ] = useState("");
    const [ showCreateCompletedModal, setShowCreateCompletedModal ] = useState(false);
    const [ showDataInputCheckModal, setShowDataInputCheckModal ] = useState(false);
    const [ showCreateFaileddModal, setShowCreateFaileddModal ] = useState(false);
    const navigate = useNavigate();

    // 중요도 변경 handler
    const handleImportanceChange = (e) => {
        setSelectedImportant(e.target.value);
    };

    // 카테고리 변경 handler
    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        // setData({ ...data, category: e.target.value });
    }

    // 제목 입력을 위한 debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTitle(title);
        }, 500);

        return () => clearTimeout(timer);
    }, [title]);

    // 내용 입력을 위한 debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedContent(content);
        }, 500);

        return () => clearTimeout(timer);
    }, [content]);

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
    }

    const handleContentChange  = (e) => {
        setContent(e.target.value);
    }

    const handleCreateNotice = async () => {
        if (!title || !content || !selectedCategory || !selectedImportant === undefined) {
            console.log("모든 필드를 입력해야 합니다.");
            setShowDataInputCheckModal(true);
            return; // 함수 종료
        }

        // 상태 변수를 사용하여 JSON 객체 생성
        const data = {
            title: title,
            content: content,
            category: selectedCategory,
            isImportant: selectedImportant === "1" ? true : false,
        };

        try {
            const response = await fetch(`${config.API_BASE_URL}/api/admin/notices`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
                credentials: "include",
            });

            if (response.ok) {
                // 저장 성공 모달창. 성공했습니다.모달창에 닫기 버튼 클릭하면 목록페이지로 이동
                setShowCreateCompletedModal(true);
                console.log("글이 성공적으로 저장되었습니다.");
            } else {
                console.log("글을 저장하는데 실패하였습니다.");
                setShowCreateFaileddModal(true);
            }

        } catch (error) {
            console.error("에러 발생", error);
            setShowCreateFaileddModal(true);
        }
    }
    
    // 모달창 닫기
    const handleCloseModal = () => {
        setShowDataInputCheckModal(false);
    }
    
    // 모달창 닫고 메인 페이지로 이동
    const handleConfirmMoveBack = () => {
        setShowCreateCompletedModal(false);
        navigate("/admin/boards");
    }

    // 테스트용 console.log
    console.log("중요도: " , selectedImportant);
    console.log("카테고리: " , selectedCategory);
    console.log("제목: " , title);
    console.log("내용: " , content);

    return (
        <div>
            <h5 className="contentTitle">공지사항 글쓰기</h5>
            <Form className="detailFormWrap">
                <Form.Group as={Row} className="mb-3" controlId="">
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
                </Form.Group>

                <Form.Group as={Row} className="mb-3" controlId="">
                    <Form.Label column sm={1}>제목</Form.Label>
                    <Col sm={11}>
                        <Form.Control 
                            type="text" 
                            name="title"
                            value={title} 
                            onChange={handleTitleChange}
                        />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3" controlId="">
                    <Form.Label column sm={1}>내용</Form.Label>
                    <Col sm={11}>
                        <Form.Control 
                            as="textarea" 
                            name="content"
                            value={content} 
                            onChange={handleContentChange}
                            style={{resize: "none"}}
                            rows= "14"
                        />
                    </Col>
                </Form.Group>

                <div className="btnGroup">
                    <Button 
                        variant="primary" 
                        onClick={handleCreateNotice} 
                    >
                        글 작성
                    </Button>
                </div>
            </Form>

            {/* 모든 필드 내용 입력 해주세요 */}
            <AdminNoticeCreateFiledCheckModal 
                showDataInputCheckModal={showDataInputCheckModal}
                handleCloseModal={handleCloseModal}
            />

            {/* 글 작성 성공 모달 */}
            <AdminNoticeCreateSuccessModal
                showCreateCompletedModal={showCreateCompletedModal}
                handleCloseModal={handleCloseModal}
                handleConfirmMoveBack={handleConfirmMoveBack}
            />

            {/* 글 작성 실패 모달 */}
            <AdminNoticeCreateFailedModal 
                showCreateFaileddModal={showCreateFaileddModal}
                handleCloseModal={handleCloseModal}
            />
        </div>
    );
}