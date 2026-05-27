import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Header } from "./components/Header/Header";
import { Home } from "./pages/Home/Home";
import { CourseDescription } from "./pages/CourseDescription/CourseDescription";
import { LoginModal } from "./components/modals/LoginModal";
import { RegisterModal } from "./components/modals/RegisterModal";
import "./global.css";
import { Profile } from "./pages/Profile/Profile";
import { WorkoutPage } from "./pages/WorkoutPage/WorkoutPage";

const AppContent: React.FC = () => {
  const {
    isLoginOpen,
    isRegisterOpen,
    openLoginModal,
    openRegisterModal,
    closeModals,
  } = useAuth();

  return (
    <div className="app">
      <Header
        onLoginClick={openLoginModal}
        onRegisterClick={openRegisterModal}
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/courses/:id"
          element={
            <ProtectedRoute requireAuth={false}>
              <CourseDescription />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute requireAuth={true}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:courseId/workout/:workoutId"
          element={
            <ProtectedRoute requireAuth={true}>
              <WorkoutPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {isLoginOpen && <LoginModal onClose={closeModals} />}
      {isRegisterOpen && <RegisterModal onClose={closeModals} />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
