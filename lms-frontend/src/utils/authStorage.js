const USER_KEY = "user";
const TOKEN_KEY = "token";

export const authStorage = {
  getUser() {
    const user = localStorage.getItem(USER_KEY);

    return user ? JSON.parse(user) : null;
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  setAuth(user, token) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    localStorage.setItem(TOKEN_KEY, token);
  },

  clearAuth() {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },
};
