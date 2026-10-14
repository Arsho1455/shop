const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export async function api(path, { method = 'GET', body, ...options } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      ...options,
    });
  } catch {
    throw new Error('Կապը սերվերի հետ չստացվեց։ Համոզվիր, որ backend-ը աշխատում է։');
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.message || 'Սխալ տեղի ունեցավ։');
    error.code = result.code;
    error.status = response.status;
    throw error;
  }
  return result;
}
