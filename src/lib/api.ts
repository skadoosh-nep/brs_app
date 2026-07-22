import {
  AxiosError,
  create,
  isAxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/store/auth";
import { useToastStore } from "@/store/toast";
import { ApiError, type FieldErrors } from "@/types/domain";
import { sessionAdapter } from "./adapters";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";
const API_V1_URL = `${API_BASE_URL}/api/v1`;
const BLUE = "\u001b[34m";
const YELLOW = "\u001b[33m";
const RESET = "\u001b[0m";
const SENSITIVE_KEYS = new Set([
  "access_token",
  "accesstoken",
  "authorization",
  "confirm_password",
  "confirmpassword",
  "cookie",
  "password",
  "refresh_token",
  "refreshtoken",
]);

type BrsRequestConfig = InternalAxiosRequestConfig & {
  skipAuth?: boolean;
  _retry?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;

export const hasApiConfiguration = Boolean(API_BASE_URL);

/** The single Axios instance used by every BRS feature service. */
export const apiClient = create({
  baseURL: API_V1_URL,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

// Refresh uses an isolated instance so a failed refresh cannot trigger its own interceptor.
const refreshClient = create({
  baseURL: API_V1_URL,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

function redact(value: unknown, seen = new WeakSet<object>()): unknown {
  if (!value || typeof value !== "object") return value;
  if (seen.has(value)) return "[Circular]";
  seen.add(value);
  if (Array.isArray(value)) return value.map((item) => redact(item, seen));
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      SENSITIVE_KEYS.has(key.toLowerCase()) ? "[REDACTED]" : redact(item, seen),
    ]),
  );
}

function endpoint(config: AxiosRequestConfig): string {
  return `${config.baseURL ?? ""}${config.url ?? ""}`;
}

function coloredLog(color: string, label: string, details: unknown): void {
  const serialized = JSON.stringify(redact(details), null, 2);
  console.log(`${color}${label}\n${serialized}${RESET}`);
}

function attachTerminalLogging(client: AxiosInstance): void {
  client.interceptors.request.use((config) => {
    coloredLog(BLUE, `[API REQUEST] ${config.method?.toUpperCase() ?? "GET"} ${endpoint(config)}`, {
      params: config.params,
      data: config.data,
    });
    return config;
  });

  client.interceptors.response.use(
    (response) => {
      coloredLog(YELLOW, `[API RESPONSE] ${response.status} ${endpoint(response.config)}`, response.data);
      return response;
    },
    (error: AxiosError) => {
      coloredLog(
        YELLOW,
        `[API RESPONSE] ${error.response?.status ?? "NETWORK ERROR"} ${endpoint(error.config ?? {})}`,
        error.response?.data ?? { message: error.message },
      );
      return Promise.reject(error);
    },
  );
}

attachTerminalLogging(apiClient);
attachTerminalLogging(refreshClient);

function validationErrors(detail: unknown): FieldErrors {
  if (!Array.isArray(detail)) return {};
  return Object.fromEntries(
    detail.flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const item = entry as { loc?: unknown[]; msg?: unknown };
      const field = item.loc?.at(-1);
      return typeof field === "string" && typeof item.msg === "string"
        ? [[field, item.msg]]
        : [];
    }),
  );
}

function normalizeAxiosError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (!isAxiosError(error)) {
    return new ApiError(0, error instanceof Error ? error.message : "Unexpected API error", {}, error);
  }

  const response = error.response;
  if (!response) return new ApiError(0, "Unable to reach the BRS server.", {}, error);

  const root = response.data && typeof response.data === "object"
    ? response.data as Record<string, unknown>
    : {};
  const detail = root.detail;
  const details = root.details;
  const message = typeof detail === "string"
    ? detail
    : typeof details === "string"
      ? details
    : typeof root.message === "string"
      ? root.message
      : `Request failed (${response.status})`;

  return new ApiError(
    response.status,
    message,
    validationErrors(detail ?? details),
    detail ?? details,
  );
}

function rejectWithToast(error: unknown): Promise<never> {
  const normalized = normalizeAxiosError(error);
  useToastStore.getState().showError(normalized.message);
  return Promise.reject(normalized);
}

async function refreshSession(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await refreshClient.post("/auth/refresh");
      useAuthStore.getState().setSession(sessionAdapter(response.data));
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

apiClient.interceptors.request.use((config) => {
  const request = config as BrsRequestConfig;
  if (!API_BASE_URL) {
    return Promise.reject(new ApiError(0, "EXPO_PUBLIC_API_BASE_URL is not configured."));
  }

  if (!request.skipAuth) {
    const token = useAuthStore.getState().accessToken;
    if (token) request.headers.set("Authorization", `Bearer ${token}`);
  }
  return request;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as BrsRequestConfig | undefined;
    if (error.response?.status === 401 && request && !request.skipAuth && !request._retry) {
      request._retry = true;
      if (await refreshSession()) return apiClient.request(request);
      useAuthStore.getState().clearSession();
    }
    return rejectWithToast(error);
  },
);

export async function apiRequest<T>(
  path: string,
  config: AxiosRequestConfig = {},
  options: { protected?: boolean } = {},
): Promise<T> {
  const request = {
    ...config,
    url: path,
    skipAuth: options.protected === false,
  } as AxiosRequestConfig & { skipAuth: boolean };
  const response = await apiClient.request<T>(request);
  return response.data;
}
