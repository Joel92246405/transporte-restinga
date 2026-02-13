import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminAnalytics from "./pages/AdminAnalytics";

import AdminTransportes from "./pages/AdminTransportes";
import AdminMeses from "./pages/AdminMeses";
import AdminMesEdit from "./pages/AdminMesEdit";

import PrivateRoute from "./components/PrivateRoute";
import { useEffect, useRef } from "react";
import { registerAccess } from "./services/analytics";




function App() {
  const analyticsRan = useRef(false);

  useEffect(() => {
    if (!analyticsRan.current) {
      registerAccess();
      analyticsRan.current = true;
    }
  }, []);

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
          path="/admin/analytics"
          element={
            <PrivateRoute>
              <AdminAnalytics />
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
