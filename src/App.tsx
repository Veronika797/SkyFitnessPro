import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Header } from "./components/Header/Header";
import { Home } from "./pages/Home/Home";
import "./global.css";
import { LoginModal } from "./components/modals/LoginModal";
import { RegisterModal } from "./components/modals/RegisterModal";

const App: React.FC = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Header
            onLoginClick={() => {
              setIsLoginOpen(true);
              setIsRegisterOpen(false);
            }}
            onRegisterClick={() => {
              setIsRegisterOpen(true);
              setIsLoginOpen(false);
            }}
          />
          <Routes>
            <Route path="/" element={<Home />} />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <div>Профиль пользователя</div>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {isLoginOpen && (
            <LoginModal
              onClose={() => setIsLoginOpen(false)}
              onSwitchToRegister={() => {
                setIsLoginOpen(false);
                setIsRegisterOpen(true);
              }}
            />
          )}

          {isRegisterOpen && (
            <RegisterModal
              onClose={() => setIsRegisterOpen(false)}
              onSwitchToLogin={() => {
                setIsRegisterOpen(false);
                setIsLoginOpen(true);
              }}
            />
          )}
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
