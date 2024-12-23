import { useEffect, useState } from "react";
import config from '../../../../config';

// 24.12.10 지은 : payment에서 usePaginationFetch 가져옴.
export default function usePaginationFetch(urlTest) {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0); // 총 페이지 개수
  const [page, setPage] = useState(1); // 현재 페이지
  const size = 10; // 한 페이지에 표시할 항목 개수
  const fetchUrl = `${config.API_BASE_URL}/api/admin/${urlTest}?page=${page}&size=${size}&sort_order=DESC`;
  

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${fetchUrl}`,{
            method: 'GET', // GET 요청
            credentials: 'include', // 쿠키를 함께 전송
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setData(result.content);
        setTotalElements(result.totalElements); // 총 데이터 개수 저장
        setTotalPages(result.totalPages);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [page, urlTest]);

  return { data, loading, error, totalPages, totalElements, page, setPage, size };

};