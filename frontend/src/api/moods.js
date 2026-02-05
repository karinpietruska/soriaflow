const DEFAULT_API_BASE_URL = "http://localhost:8000";

function getApiBaseUrl() {
  return import.meta.env?.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
}

export async function fetchMoods() {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/moods`);
  if (!response.ok) {
    throw new Error(`Failed to load moods (${response.status})`);
  }
  return response.json();
}

export async function createMood(payload) {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/moods`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Failed to save mood (${response.status})`);
  }
  return response.json();
}
