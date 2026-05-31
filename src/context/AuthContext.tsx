import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "@/api/authService";
import axiosInstance from "@/api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { getErrorMessage, isUnauthorizedError } from "@/utils/errorUtils";

export interface User {
  email: string;
  selectedCourses: string[];
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  addCourseLocally: (courseId: string) => void;
  removeCourseLocally: (courseId: string) => void;
  isLoginOpen: boolean;
  isRegisterOpen: boolean;
  openLoginModal: () => void;
  openRegisterModal: () => void;
  closeModals: () => void;
  returnTo: string | null;
  setReturnUrl: (url: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [returnTo, setReturnTo] = useState<string | null>(null);
  const navigate = useNavigate();

  const setReturnUrl = (url: string) => {
    setReturnTo(url);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.login({ email, password });
      if (data.token) {
        authService.setToken(data.token);
        await fetchUser();
        closeModals();

        if (returnTo) {
          navigate(returnTo, { replace: true });
          setReturnTo(null);
        } else {
          navigate("/profile", { replace: true });
        }
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.register({ email, password });
      await login(email, password);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    navigate("/");
  };

  const clearError = () => setError(null);

  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get<User>("/users/me");
      setUser(response.data);
      setError(null);
    } catch (err) {
      if (isUnauthorizedError(err)) {
        authService.logout();
        setUser(null);
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openLoginModal = () => {
    setIsLoginOpen(true);
    setIsRegisterOpen(false);
  };

  const openRegisterModal = () => {
    setIsRegisterOpen(true);
    setIsLoginOpen(false);
  };

  const closeModals = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
  };

  const addCourseLocally = (courseId: string) => {
    if (user && !user.selectedCourses.includes(courseId)) {
      setUser({
        ...user,
        selectedCourses: [...user.selectedCourses, courseId],
      });
    }
  };

  const removeCourseLocally = (courseId: string) => {
    if (user) {
      setUser({
        ...user,
        selectedCourses: user.selectedCourses.filter((id) => id !== courseId),
      });
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        await fetchUser();
      } else {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    fetchUser,
    addCourseLocally,
    removeCourseLocally,
    isLoginOpen,
    isRegisterOpen,
    openLoginModal,
    openRegisterModal,
    closeModals,
    returnTo,
    setReturnUrl,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
