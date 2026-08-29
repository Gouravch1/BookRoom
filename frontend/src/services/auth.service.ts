import { apiClient, setToken, clearToken } from "@/lib/api-client";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserResponse,
} from "@/types/auth";

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/api/auth/login", data);
    setToken(res.data.accessToken);
    return res.data;
  },

  async register(data: RegisterRequest): Promise<UserResponse> {
    const res = await apiClient.post<UserResponse>("/api/auth/register", data);
    return res.data;
  },

  async getMe(): Promise<UserResponse> {
    const res = await apiClient.get<UserResponse>("/api/users/me");
    return res.data;
  },

  logout(): void {
    clearToken();
  },
};
