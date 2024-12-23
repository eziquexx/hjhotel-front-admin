import { useCallback, useEffect, useRef, useState } from "react";
import { Spinner } from "react-bootstrap";
import config from "../../../../config";

function useFetchData(url){
    
    const serverUrl = `${config.API_BASE_URL}/api/admin/${url}`;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [method, setMethod] = useState(null); //요청 실행 트리거 - 24.12.23 한택 : 트리거는 따로 분리할 수 있도록 추가 작업 필요
    const [pathParams, setPathParams] = useState({});
    const [body, setBody] = useState({});
    const [queryParams, setQueryParams] = useState({});

    const eventHandlersRef = useRef({});

    // 이벤트 핸들러 등록 함수
    const on = useCallback((event, handler) => {
      eventHandlersRef.current[event] = handler;
    }, []);
  
    // 이벤트 핸들러 해제 함수
    const off = useCallback((event) => {
      delete eventHandlersRef.current[event];
    }, []);

    const fetchOptions = {
        method : method,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
             
        },
        credentials: 'include',
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            let fullUrl = serverUrl;
            
            // 1. pathParams 처리
            if (Object.keys(pathParams).length > 0) {
                fullUrl = Object.entries(pathParams).reduce(
                    (url, [key, value]) =>{
                        if(value)  
                           return url.replace(`{${key}}`, value);
                        else 
                           return url.replace(`/{${key}}`,value);
                    },
                    fullUrl
                );
            }
    
            // 2. queryParams 처리
            if (Object.keys(queryParams).length > 0) {
                const queryString = setQueryString(queryParams);
                fullUrl += `?${queryString}`;
            }
    
            // 3. body 처리
            if (method === "POST" || method === "PUT" || method === "PATCH") {
                fetchOptions.body = JSON.stringify(body);
            }

            //  response
            const response = await fetch(fullUrl, fetchOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setData(result);

            // fetch 이후에 실행되는 이벤트 함수
            if (eventHandlersRef.current.afterFetch) {
                eventHandlersRef.current.afterFetch(result); 
            }
        } 
        catch (error) {
          setError(error.message);
        } 
        finally {
          setLoading(false);
          setMethod(null);
        }
    }, [method, pathParams, queryParams, body]);

    useEffect(()=>{
        if(method)
            fetchData();
    },[fetchData])

    //fetch loading 컴포넌트
    function FetchLoadingComponent(){

        return (
            <>
            {loading && 
                <div className="d-flex justify-content-center  align-items-center" 
                    style={{
                        width:'100%',
                        height: "100vh",
                        flexDirection: "column"
                    }}
                >
                    <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                    /> 
                    <p>Loading...</p>
                </div>
            }
            </>
        );
    }

    function setQueryString(dicData){
        if(dicData !== null){
            const queryString = new URLSearchParams(Object.entries(dicData)).toString();
            return queryString;
        }
    }
    
    return {
        data,
        loading,
        error,
        setMethod,
        setPathParams,
        setBody,
        setQueryParams,
        FetchLoadingComponent,
        on,
        off
      };
}

export default useFetchData;