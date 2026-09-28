import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Workspace from "./pages/Workspace";
import WorkspacePicker from "./pages/WorkspacePicker";
import WorkspaceTxt from "./pages/workspacetest";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/workspaces" element={<WorkspacePicker />} />
        {/* <Route path="/d" element={<Work />} /> */}
        <Route path="/workspace/:slug" element={<Workspace />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;