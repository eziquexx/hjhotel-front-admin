import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import TestPage from "./pages/TestPage";

function App() {
  return (
    <BrowserRouter basename="/" future={{ v7_startTransition: true }}>
      <Routes>
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="/admin/test" element={<TestPage />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
