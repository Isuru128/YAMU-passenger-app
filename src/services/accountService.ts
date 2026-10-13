import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  AccountResponse,
  UpdateProfileRequest,
} from '../types/account';

/**
 * AccountService connects to the Spring Boot Account Service endpoints (/accounts/**).
 */
export class AccountService {
  /**
   * Register a new account
   * POST /accounts/register
   * Access: Public (permitAll)
   */
  async register(request: RegisterRequest): Promise<AuthResponse> {
    const payload = {
      firstName: request.firstName.trim(),
      lastName: request.lastName.trim(),
      email: request.email.trim().toLowerCase(),
      password: request.password,
      phoneNumber: request.phoneNumber.trim(),
      role: request.role || 'PASSENGER',
    };

    const response = await apiClient.post<AuthResponse>(ENDPOINTS.ACCOUNTS.REGISTER, payload);
    if (response?.token) {
      apiClient.setToken(response.token);
    }
    return response;
  }

  /**
   * Authenticate user and issue JWT token
   * POST /accounts/login
   * Access: Public (permitAll)
   */
  async login(request: LoginRequest): Promise<AuthResponse> {
    const payload = {
      email: request.email.trim().toLowerCase(),
      password: request.password,
    };

    const response = await apiClient.post<AuthResponse>(ENDPOINTS.ACCOUNTS.LOGIN, payload);
    if (response?.token) {
      apiClient.setToken(response.token);
    }
    return response;
  }

  /**
   * Fetch account details by account ID
   * GET /accounts/{id}
   * Access: Authenticated (Account owner)
   */
  async getAccountById(id: string, token?: string): Promise<AccountResponse> {
    return apiClient.get<AccountResponse>(ENDPOINTS.ACCOUNTS.GET_BY_ID(id), {
      token,
    });
  }

  /**
   * Update user profile details
   * PUT /accounts/{id}
   * Access: Authenticated (Account owner)
   */
  async updateProfile(
    id: string,
    request: UpdateProfileRequest,
    token?: string
  ): Promise<AccountResponse> {
    return apiClient.put<AccountResponse>(ENDPOINTS.ACCOUNTS.UPDATE_PROFILE(id), request, {
      token,
    });
  }
}

export const accountService = new AccountService();

