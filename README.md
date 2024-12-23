# 설명
- react와 spring boot 통신 시켜 놓았습니다.
- 공통 UI부분 (Header, Aside) 스타일 작업. (bootstrap 사용)
- create-borwser-router 적용 (React Router v6에서 도입된 API/더 세밀한 라우팅 제어가 가능, 특히 서버 사이드 렌더링(SSR)과 관련된 기능을 사용할 때 유리.)

# react <-----> spring boot 통신
- localhost:3000/admin/test 로 접속하여 통신 테스트 하기.

# react 준비
- react router dom 설치 되었다는 가정하에

### package.json에 proxy 추가
- "proxy": "http://localhost:8080",

### axios 설치
- npm install axios

### proxy-middleware 설치
- npm i http-proxy-middleware

### src 하위로 setupProxy.js 생성
```
const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function(app) {
   app.use(
      '/api', // api로 시작하는 모든 요청을 proxy하도록 설정. 혹시 몰라서 추가. /api 경로 사용안한다면 없어도 됨.
      createProxyMiddleware({
         target: `${config.API_BASE_URL}`,	// 서버 ip or localhost:설정한포트번호
         changeOrigin: true,
      })
   );
};
```
### App.js, TestPage.jsx 파일 참고
- 그외 테스트 코드는 App.js와 TestPage.jsx 파일 참고하면 된다.

# spring boot 준비

### build.gradle에 소스코드 추가
- 나중에 spring boot와 react 같이 빌드할 때 react 프로젝트 먼저 빌드하고 spring boot 프로젝트에 포함시키겠다는 코드.
- 이건 추가해도 추가 안해도 괜찮을 듯.
```
def frontendDir = "$projectDir/src/main/frontend"

sourceSets {
	main {
		resources { srcDirs = ["$projectDir/src/main/resources"]
		}
	}
}

processResources { dependsOn "copyReactBuildFiles" }

task installReact(type: Exec) {
	workingDir "$frontendDir"
	inputs.dir "$frontendDir"
	group = BasePlugin.BUILD_GROUP
	if (System.getProperty('os.name').toLowerCase(Locale.ROOT).contains('windows')) {
		commandLine "npm.cmd", "audit", "fix"
		commandLine 'npm.cmd', 'install' }
	else {
		commandLine "npm", "audit", "fix" commandLine 'npm', 'install'
	}
}

task buildReact(type: Exec) {
	dependsOn "installReact"
	workingDir "$frontendDir"
	inputs.dir "$frontendDir"
	group = BasePlugin.BUILD_GROUP
	if (System.getProperty('os.name').toLowerCase(Locale.ROOT).contains('windows')) {
		commandLine "npm.cmd", "run-script", "build"
	} else {
		commandLine "npm", "run-script", "build"
	}
}

task copyReactBuildFiles(type: Copy) {
	dependsOn "buildReact"
	from "$frontendDir/build"
	into "$projectDir/src/main/resources/static"
}
```

### WebConfig.java 생성
- 해당 프로젝트 하위에 WebConfig.java 파일 생성
- Application.java와 동일한 위치에.
```
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
@Configuration
public class WebConfig implements WebMvcConfigurer {
   @Override
   public void addCorsMappings(CorsRegistry registry) {
       registry.addMapping("/**") // 모든 경로에 대해 CORS 허용
               .allowedOrigins("http://localhost:3000") // React 앱의 주소
               .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // 허용할 HTTP 메서드
               .allowedHeaders("*") // 모든 헤더 허용
               .allowCredentials(false); // 인증 정보 허용
   }
}
```
