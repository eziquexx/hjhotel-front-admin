import React from "react";
import Pagination from "react-bootstrap/Pagination";

export default function IndependentPagination({ totalElements, size, page, onPageChange }) {
    // 전체 페이지 수 계산
    const totalPages = Math.ceil(totalElements / size);

    // 페이지 번호 생성
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    // 페이지 변경 함수
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            onPageChange(newPage); // 부모 컴포넌트로 변경 알림
        }
    };

    return (
        <Pagination className="justify-content-center">
            {/* 이전 페이지 */}
            <Pagination.Prev
                disabled={page === 1} // 첫 페이지에서는 비활성화
                onClick={() => handlePageChange(page = 1)}
            />
            {/* 페이지 번호 */}
            {pageNumbers.map((number) => (
                <Pagination.Item
                    key={number}
                    active={number === page}
                    onClick={() => handlePageChange(number)}
                >
                    {number}
                </Pagination.Item>
            ))}
            {/* 다음 페이지 */}
            <Pagination.Next
                disabled={page === totalPages} // 마지막 페이지에서는 비활성화
                onClick={() => handlePageChange(page + 1)}
            />
        </Pagination>
    );
}