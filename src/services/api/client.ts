import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://sep490-be-3.onrender.com/api";

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
  details?: unknown;
}

export class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        // Debug logging
        if (config.data) {
          console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        return response;
      },
      (error: AxiosError) => {
        // Log error details
        console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
        
        // Handle specific error cases
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }
        return Promise.reject(this.formatError(error));
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken");
    }
    return null;
  }

  private handleUnauthorized(): void {
    // Clear auth and redirect to login
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
  }

  private formatError(error: AxiosError): ApiErrorResponse {
    const errorResponse = error.response?.data as ApiErrorResponse;

    return {
      message: errorResponse?.message || error.message || "An error occurred",
      statusCode: error.response?.status,
      details: error.response?.data,
    };
  }

  // GET request
  async get<T>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.get<T>(endpoint, config);
    return response.data;
  }

  // POST request
  async post<T>(
    endpoint: string,
    data: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(endpoint, data, config);
    return response.data;
  }

  // PUT request
  async put<T>(
    endpoint: string,
    data: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(endpoint, data, config);
    return response.data;
  }

  // PATCH request
  async patch<T>(
    endpoint: string,
    data: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<T>(endpoint, data, config);
    return response.data;
  }

  // DELETE request
  async delete<T>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.delete<T>(endpoint, config);
    return response.data;
  }

  setAuthToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
    }
  }

  clearAuthToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
    }
  }
}

export const apiClient = new ApiClient();
