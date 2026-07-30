export async function apiRequest(url, options = {}) {
  const res = await fetch(url, {
    method: options.method || "GET",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // resposta sem corpo
  }

  if (!res.ok) {
    throw new Error(data?.error || `Erro ${res.status}`);
  }
  return data;
}
