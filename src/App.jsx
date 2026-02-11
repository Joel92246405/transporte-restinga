import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";

import AdminTransportes from "./pages/AdminTransportes";
import AdminMeses from "./pages/AdminMeses";
import AdminMesEdit from "./pages/AdminMesEdit";

import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminTransportes />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/:transporteId"
          element={
            <PrivateRoute>
              <AdminMeses />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/:transporteId/:mesId"
          element={
            <PrivateRoute>
              <AdminMesEdit />
            </PrivateRoute>
          }
        />

        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
