import axiosInstance from "./axiosInstance";

export interface RegisterData {
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message?: string;
  token?: string;
}

export const authService = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem("jwt_token");
  },

  getToken: (): string | null => {
    return localStorage.getItem("jwt_token");
  },

  setToken: (token: string): void => {
    localStorage.setItem("jwt_token", token);
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("jwt_token");
  },
};
