export function isLoggedIn() {
  return !!localStorage.getItem("user");
}

export function login(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
}
