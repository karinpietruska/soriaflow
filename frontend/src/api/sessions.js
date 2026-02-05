const DEFAULT_API_BASE_URL = "http://localhost:8000";

function getApiBaseUrl() {
  return import.meta.env?.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
}

export async function fetchSessions() {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/sessions`);
  if (!response.ok) {
    throw new Error(`Failed to load sessions (${response.status})`);
  }
  return response.json();
}

export async function startSession(payload) {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/sessions/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Failed to start session (${response.status})`);
  }
  return response.json();
}

export async function finishSession(sessionID, payload) {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/sessions/${sessionID}/finish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Failed to finish session (${response.status})`);
  }
  return response.json();
}
