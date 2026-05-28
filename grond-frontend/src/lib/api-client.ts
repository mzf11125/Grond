export function getAnalystId(): string {
  const key = "grond-analyst-id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function generateSessionId(): string {
  return crypto.randomUUID();
}

export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    let detail = body;
    try {
      const json = JSON.parse(body);
      if (typeof json.detail === "string") detail = json.detail;
      else if (json.detail?.message) detail = json.detail.message;
    } catch { /* use raw */ }
    if (res.status === 0 || res.status === 502 || res.status === 503) {
      throw new Error(`Grond API unreachable. Make sure the server is running.`);
    }
    throw new Error(detail || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function apiFetchMultipart<T>(url: string, form: FormData): Promise<T> {
  const res = await fetch(url, { method: "POST", body: form });
  if (!res.ok) {
    const body = await res.text();
    let detail = body;
    try {
      const json = JSON.parse(body);
      if (typeof json.detail === "string") detail = json.detail;
      else if (json.detail?.message) detail = json.detail.message;
    } catch { /* use raw */ }
    throw new Error(detail || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}
