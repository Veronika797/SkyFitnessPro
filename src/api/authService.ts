import axiosInstance from "./axiosInstance";

export interface RegisterResponse {
  message: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    const response = await axiosInstance.post<RegisterResponse>(
      "/auth/register",
      JSON.stringify(data),
    );
    return response.data;
  },

  login: async (data: LoginData): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>("/auth/login", JSON.stringify(data));
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
