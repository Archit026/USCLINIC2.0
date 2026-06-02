// frontend/src/utils/auth.js

export const setUser = (user, token) => {
  localStorage.setItem("user", JSON.stringify(user));
  // Save token if provided
  if (token) {
    localStorage.setItem("token", token);
  }
  // Dispatch custom event to notify other components in same tab
  window.dispatchEvent(new CustomEvent('userUpdated', { detail: user }));
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const logoutUser = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  // Dispatch custom event for logout
  window.dispatchEvent(new CustomEvent('userUpdated', { detail: null }));
};
