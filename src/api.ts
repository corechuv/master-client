
const API_BASE = import.meta.env.VITE_MASTER_API_URL ?? "http://localhost:8001";
const TOKEN_KEY = "master_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
 
export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = data?.detail || data?.error || "Request failed";
    throw new Error(message);
  }
  return (await response.json()) as T;
}

export async function login(email: string, password: string) {
  return apiRequest<{ token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(masterId: string, email: string, password: string) {
  return apiRequest<{ token: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ master_id: masterId, email, password }),
  });
}

export type RegisterPayload = {
  name: string;
  role: string;
  experience_years: number;
  photo?: string;
  email: string;
  password: string;
  phone?: string;
};

export async function registerMaster(payload: RegisterPayload) {
  return apiRequest<{ token: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type Profile = {
  id: string;
  master_id: string;
  email: string;
  name?: string;
  role?: string;
  experience_years?: number;
  photo?: string;
  phone?: string;
};

export async function getProfile() {
  return apiRequest<Profile>("/me");
}

export async function updateProfile(payload: Partial<Profile>) {
  return apiRequest<{ ok: boolean }>("/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export type BookingCreate = {
  date: string;
  time: string;
  service_id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  status?: string;
};

export async function createBooking(payload: BookingCreate) {
  return apiRequest<{ id: string }>("/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
