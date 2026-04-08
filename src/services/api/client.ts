import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";

const API_BASE_URL = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_BASE_URL || "https://sep490-be-3.onrender.com");
// Log only on server or in dev mode to avoid cluttering production console too much
if (typeof window === "undefined") {
  console.log("🌐 Server Mode: API Base URL set to", API_BASE_URL);
}
const BASE_URL = API_BASE_URL.replace(/\/+$/, "");
// If baseURL already ends with `/api` and endpoint also starts with `/api`,
// we'll get double path like `/api/api/login`.
const BASE_URL_HAS_API_PREFIX = BASE_URL.toLowerCase().endsWith("/api");

function normalizeEndpoint(endpoint: string): string {
  if (!BASE_URL_HAS_API_PREFIX) return endpoint;
  if (endpoint.startsWith("/api")) return endpoint.slice("/api".length); // e.g. /api/login -> /login
  return endpoint;
}

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
  details?: unknown;
}

export class ApiClient {
  private client: AxiosInstance;

  constructor() {
    console.log("🌐 API Initialized with Base URL:", API_BASE_URL);
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 40000,
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
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
        const isNetworkError = !error.response;
        
        console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          type: isNetworkError ? "NETWORK_OR_TIMEOUT_OR_CORS" : "SERVER_RESPONSE_ERROR",
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });

        if (isNetworkError) {
          console.warn("💡 Gợi ý: Kiểm tra xem Server Render có đang 'ngủ' (Cold Start) không, hoặc kiểm tra cấu hình CORS tại Backend.");
        }
        
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
      return localStorage.getItem("accessToken");
    }
    return null;
  }

  private handleUnauthorized(): void {
    // Clear auth and redirect to login
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
  }

  private formatError(error: AxiosError): ApiErrorResponse {
    const errorData = error.response?.data;
    let message = "An error occurred";

    if (!error.response) {
      if (error.code === 'ECONNABORTED') message = "Kết nối quá hạn (Timeout). Máy chủ có thể đang bị quá tải.";
      else message = "Không thể kết nối tới Server (Network Error/CORS). Vui lòng kiểm tra lại mạng hoặc liên hệ team BE.";
    } else if (typeof errorData === "string" && errorData.length > 0) {
      message = errorData;
    } else if (errorData && typeof errorData === "object" && "message" in (errorData as any)) {
      message = (errorData as any).message;
    } else if (error.message) {
      message = error.message;
    }

    return {
      message: message,
      statusCode: error.response?.status,
      details: errorData,
    };
  }

  // GET request
  async get<T>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.get<T>(normalizeEndpoint(endpoint), config);
    return response.data;
  }

  // POST request
  async post<T>(
    endpoint: string,
    data: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(normalizeEndpoint(endpoint), data, config);
    return response.data;
  }

  // PUT request
  async put<T>(
    endpoint: string,
    data: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(normalizeEndpoint(endpoint), data, config);
    return response.data;
  }

  // PATCH request
  async patch<T>(
    endpoint: string,
    data: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<T>(normalizeEndpoint(endpoint), data, config);
    return response.data;
  }

  // DELETE request
  async delete<T>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.delete<T>(normalizeEndpoint(endpoint), config);
    return response.data;
  }

  setAuthToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", token);
    }
  }

  clearAuthToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
    }
  }
}

export const apiClient = new ApiClient();

