import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Base URL of the MEC Eatz backend. Override per-environment via the
 * EXPO_PUBLIC_API_URL env var (falls back to the hosted Render instance).
 */
export const API_BASE =
  process.env.EXPO_PUBLIC_API_URL || "https://mec-eatz.onrender.com";

export const TOKEN_KEY = "token";

/**
 * Fetch wrapper that attaches the stored Supabase access token as a Bearer
 * header and returns the parsed JSON body. Every authenticated call in the app
 * goes through here so auth stays consistent in one place.
 */
export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  // Backend always replies with JSON; surface a useful error otherwise.
  try {
    return (await res.json()) as T;
  } catch {
    throw new Error(`Unexpected response (${res.status})`);
  }
}
