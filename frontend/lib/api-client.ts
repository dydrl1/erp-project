export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthUser {
  empId: number;
  loginId: string;
  empName: string;
  role: string;
  deptId: number;
  deptCode?: string;
}

export interface LoginResponse extends AuthUser {
  accessToken: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
console.log("[API BASE URL]", BASE_URL);

export const tokenStorage = {
  get: () => (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null),
  set: (token: string) => localStorage.setItem("accessToken", token),
  clear: () => localStorage.removeItem("accessToken"),
};

export const userStorage = {
  set: (u: AuthUser) => {
    localStorage.setItem("authUser", JSON.stringify(u));
    localStorage.setItem("empId", String(u.empId));
    localStorage.setItem("loginId", u.loginId);
    localStorage.setItem("empName", u.empName);
    localStorage.setItem("role", u.role);
    localStorage.setItem("deptId", String(u.deptId));
    if (u.deptCode) {
      localStorage.setItem("deptCode", u.deptCode);
    } else {
      localStorage.removeItem("deptCode");
    }
  },
  get: (): AuthUser | null => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("authUser");
    if (raw) return JSON.parse(raw) as AuthUser;

    const empId = localStorage.getItem("empId");
    const loginId = localStorage.getItem("loginId");
    const empName = localStorage.getItem("empName");
    const role = localStorage.getItem("role");
    const deptId = localStorage.getItem("deptId");

    if (!empId || !loginId || !empName || !role || !deptId) return null;

    return {
      empId: Number(empId),
      loginId,
      empName,
      role,
      deptId: Number(deptId),
      deptCode: localStorage.getItem("deptCode") ?? undefined,
    };
  },
  clear: () => {
    localStorage.removeItem("authUser");
    localStorage.removeItem("empId");
    localStorage.removeItem("loginId");
    localStorage.removeItem("empName");
    localStorage.removeItem("role");
    localStorage.removeItem("deptId");
    localStorage.removeItem("deptCode");
  },
};

function forceLogout(): void {
  tokenStorage.clear();
  userStorage.clear();
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

let refreshPromise: Promise<string | null> | null = null;

function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) return null;
        const body: ApiResponse<LoginResponse> = await res.json();
        if (!body.success) return null;
        tokenStorage.set(body.data.accessToken);
        userStorage.set(body.data);
        return body.data.accessToken;
      } catch {
        return null;
      }
    })();
    void refreshPromise.finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
  allowRetry = true,
): Promise<T> {
  const token = tokenStorage.get();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && allowRetry) {
    const newToken = await refreshAccessToken();
    if (newToken) return request<T>(path, options, false);
    forceLogout();
    throw new Error("Authentication expired. Please log in again.");
  }

  const text = await res.text();
  let body: ApiResponse<T> | null = null;
  if (text) {
    try {
      body = JSON.parse(text) as ApiResponse<T>;
    } catch {
      body = null;
    }
  }

  if (!res.ok) {
    throw new Error(body?.message || `Request failed. (HTTP ${res.status})`);
  }
  if (body && !body.success) {
    throw new Error(body.message || "Request failed.");
  }

  return (body ? body.data : undefined) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "POST", body: data ? JSON.stringify(data) : undefined }),
  put: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "PUT", body: data ? JSON.stringify(data) : undefined }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "PATCH", body: data ? JSON.stringify(data) : undefined }),
};
