const DEFAULT_API_BASE_URL = "http://localhost:8000";

function getApiBaseUrl() {
  return import.meta.env?.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
}

export async function fetchExercises({ source } = {}) {
  const baseUrl = getApiBaseUrl();
  const url = new URL(`${baseUrl}/exercises`);
  if (source) {
    url.searchParams.set("source", source);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load exercises (${response.status})`);
  }
  return response.json();
}
