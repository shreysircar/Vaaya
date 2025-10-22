export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface RequestOptions {
  method?: string;
  body?: any;
  token?: string | null;
}

export async function apiRequest<T>(endpoint: string, { method = "GET", body, token }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}
