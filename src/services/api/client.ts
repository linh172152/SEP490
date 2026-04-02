import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://sep490-be-3.onrender.com";
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
    const errorData = error.response?.data;
    let message = "An error occurred";

    if (typeof errorData === "string" && errorData.length > 0) {
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

