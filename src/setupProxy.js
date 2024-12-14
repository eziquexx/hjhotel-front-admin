// const { createProxyMiddleware } = require("http-proxy-middleware");
// module.exports = function (app) {
//   app.use(
//     "/api", // api로 시작하는 모든 요청을 proxy하도록 설정. 혹시 몰라서 추가. /api 경로 사용안한다면 없어도 됨.
//     createProxyMiddleware({
//       target: "http://localhost:8080", // 서버 ip or localhost:설정한포트번호
//       changeOrigin: true,
//     })
//   );
// };

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // '/api' 경로를 제거하고 백엔드로 요청을 전달
      },
    })
  );
};