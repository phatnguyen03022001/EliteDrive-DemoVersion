const TOKEN_KEY = "app_token";
const TOKEN_EXPIRY_DAYS = 7;

export function setToken(token: string) {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + TOKEN_EXPIRY_DAYS);
  localStorage.setItem(TOKEN_KEY, JSON.stringify({ token, expiry: expiry.getTime() }));
}

export function getToken(): string | null {
  const data = localStorage.getItem(TOKEN_KEY);
  if (!data) return null;

  const { token, expiry } = JSON.parse(data);
  if (Date.now() > expiry) {
    removeToken();
    return null;
  }
  return token;
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isTokenValid() {
  return !!getToken();
}
