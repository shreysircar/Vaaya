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
 console.log("🟡 Fetching:", `${API_URL}${endpoint}`, "with token:", token ? "✅ yes" : "❌ no");

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
 console.log("🟣 Response status:", res.status, res.statusText, "for", endpoint);
  const data = await res.json();
console.log("🟢 Raw response:", typeof data === "string" ? data.substring(0, 200) : JSON.stringify(data).substring(0, 200));


  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}
