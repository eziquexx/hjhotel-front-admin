import { useEffect, useState } from "react";
function TestPage() {
	const [data, setData] = useState(); 	// ustState hook. data가 상태변수,
					     	// setData가 data 변수를 업데이트 해주는 함수
	
	useEffect(() => {
		fetch(`http://localhost:8080/api/test`)
		.then(response => {
			if (!response.ok) {
				throw new Error("응답 실패");
			}
			return response.text();	// 응답받은 data를 text 형식으로 return 하겠다는 의미.
		})
		.then(apiData => {  		// api 요청하고 받은 데이터를 apiData 매개변수에 담기
			console.log(apiData); 	// apiData가 잘 받아졌는지 콘솔창으로 확인하기 위한 용도.
			setData(apiData); 	// setData함수를 호출해서 인자값으로 apiData를 주기.
																			// setData함수가 apiData를
						// cosnt[data, setData] 여기서 data라는 상태변수에 
						// 값을 update시켜줌.
						// 즉 처음에 [data. setData]에서 
						// data 라는 상태변수에는 아무런 값이 없다가
						// api 요청하고 받아온 apiData를 
						// setData함수를 호출하여 update 해주면
																			// data 상태변수에 apiData가 저장된다.
		})
		.catch(error => {
			console.error("Error: ", error);
		})
	}, [data]);
	
	return (
		<>
			여기는 React. Client Server임. <br/>
			여기는 Spring Boot. Web Server임. <br/>
			Web Server와 연결 상태: { data } 
			{/* data는 const [data, setData] 부분에서 상태변수인 data */}
		</>
	);
};
export default TestPage;

