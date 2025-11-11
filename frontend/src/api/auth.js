import { API_BASE_URL } from './config';

export const authAPI = {
  login: (redirectTo) => {
    const target =
      redirectTo || `${window.location.origin}/dashboard`;
    window.location.href = `${API_BASE_URL}/auth/login?redirect=${encodeURIComponent(
      target
    )}`;
  },

  logout: async () => {
    await fetch(`${API_BASE_URL}/auth/logout`, { method: "POST", credentials: "include" });
  },

  me: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/me`, { credentials: "include" });
      if (!res.ok) return { ok: false, status: res.status};
      return res.json();
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  },

};