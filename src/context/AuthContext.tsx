import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService } from "../api/authService";
import axiosInstance from "../api/axiosInstance";

export interface User {
  email: string;
  selectedCourses: string[];
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  isLoginOpen: boolean;
  isRegisterOpen: boolean;
  openLoginModal: () => void;
  openRegisterModal: () => void;
  closeModals: () => void;
  returnTo: string | null;
  setReturnUrl: (url: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [returnTo, setReturnTo] = useState<string | null>(null);
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
          window.location.href = returnTo;
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка входа");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        await fetchUser();
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get<User>("/users/me");
      setUser(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка загрузки данных");
      authService.logout();
      setUser(null);
    }
  };

  const register = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.register({ email, password });
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка регистрации");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    window.location.href = "/";
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        fetchUser,
        isLoginOpen,
        isRegisterOpen,
        openLoginModal,
        openRegisterModal,
        closeModals,
        returnTo,
        setReturnUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
