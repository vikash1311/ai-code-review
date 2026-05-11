const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

async function handleResponse(res) {
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

export async function reviewCode(code, language) {
  const res = await fetch(`${BASE}/api/review/code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, language }),
  });
  return handleResponse(res);
}

export async function reviewGitHub(url) {
  const res = await fetch(`${BASE}/api/review/github`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  return handleResponse(res);
}