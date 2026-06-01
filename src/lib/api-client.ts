/**
 * Typed API client for all Makeja Rentals frontend → API routes.
 * Centralises fetch calls, error handling, and response typing.
 * Used by client components ("use client") only.
 */

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText }));
    throw new ApiError(response.status, body?.error ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

// ─── Listings ─────────────────────────────────────────────────────────────────
export const listingsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params)}` : "";
    return request<{ data: unknown[]; total: number }>(`/api/listings${qs}`);
  },
  get: (id: string) =>
    request<{ data: unknown }>(`/api/listings/${id}`),
};

// ─── Favorites ────────────────────────────────────────────────────────────────
export const favoritesApi = {
  list: () => request<{ data: unknown[] }>("/api/favorites"),
  add: (propertyId: string) =>
    request<{ data: unknown }>(`/api/favorites/${propertyId}`, { method: "POST" }),
  remove: (propertyId: string) =>
    request<{ success: boolean }>(`/api/favorites/${propertyId}`, { method: "DELETE" }),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardApi = {
  stats: () => request<{ data: unknown }>("/api/dashboard/stats"),
  inquiries: (status?: string) => {
    const qs = status ? `?status=${status}` : "";
    return request<{ data: unknown[] }>(`/api/dashboard/inquiries${qs}`);
  },
  updateInquiry: (id: string, status: string) =>
    request<{ success: boolean }>("/api/dashboard/inquiries", {
      method: "PATCH",
      body: JSON.stringify({ id, status }),
    }),
  bookings: (status?: string) => {
    const qs = status ? `?status=${status}` : "";
    return request<{ data: unknown[] }>(`/api/dashboard/bookings${qs}`);
  },
  updateBooking: (id: string, payload: Record<string, unknown>) =>
    request<{ success: boolean }>("/api/dashboard/bookings", {
      method: "PATCH",
      body: JSON.stringify({ id, ...payload }),
    }),
  messages: (inquiryId: string) =>
    request<{ data: unknown[] }>(`/api/dashboard/messages?inquiry_id=${inquiryId}`),
  sendMessage: (inquiryId: string, content: string) =>
    request<{ data: unknown }>("/api/dashboard/messages", {
      method: "POST",
      body: JSON.stringify({ inquiry_id: inquiryId, content }),
    }),
  notifications: () => request<{ data: unknown[] }>("/api/dashboard/notifications"),
  markNotificationRead: (id: string | "all") =>
    request<{ success: boolean }>("/api/dashboard/notifications", {
      method: "PATCH",
      body: JSON.stringify({ id }),
    }),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminApi = {
  stats: () => request<{ data: unknown }>("/api/admin/stats"),
  users: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params)}` : "";
    return request<{ data: unknown[]; total: number }>(`/api/admin/users${qs}`);
  },
  updateUser: (id: string, status: string) =>
    request<{ success: boolean }>("/api/admin/users", {
      method: "PATCH",
      body: JSON.stringify({ id, status }),
    }),
  properties: (status?: string) => {
    const qs = status ? `?status=${status}` : "";
    return request<{ data: unknown[] }>(`/api/admin/properties${qs}`);
  },
  updateProperty: (id: string, status: string, note?: string) =>
    request<{ success: boolean }>("/api/admin/properties", {
      method: "PATCH",
      body: JSON.stringify({ id, status, reviewer_note: note }),
    }),
  verifications: (status?: string) => {
    const qs = status ? `?status=${status}` : "";
    return request<{ data: unknown[] }>(`/api/admin/verifications${qs}`);
  },
  reports: (status?: string) => {
    const qs = status ? `?status=${status}` : "";
    return request<{ data: unknown[] }>(`/api/admin/reports${qs}`);
  },
  fraud: (resolved?: boolean) => {
    const qs = resolved !== undefined ? `?resolved=${resolved}` : "";
    return request<{ data: unknown[] }>(`/api/admin/fraud${qs}`);
  },
  revenue: () => request<{ data: unknown[] }>("/api/admin/revenue"),
  content: (status?: string) => {
    const qs = status ? `?status=${status}` : "";
    return request<{ data: unknown[] }>(`/api/admin/content${qs}`);
  },
};

export { ApiError };
