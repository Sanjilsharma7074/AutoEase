// Authentication functions
function isLoggedIn() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  return token && user;
}

function getUserData() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch (e) {
    return {};
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  updateNavigationForUser();
  window.location.href = "/";
}

function updateNavigationForUser() {
  const loginLink = document.getElementById("login-link");
  const signupLink = document.getElementById("signup-link");
  const logoutLink = document.getElementById("logout-link");
  const bookingsLink = document.getElementById("bookings-link");
  const adminLink = document.getElementById("admin-link");
  const heroSignup = document.getElementById("hero-signup");

  if (isLoggedIn()) {
    const user = getUserData();

    // Hide login/signup, show logout
    if (loginLink) loginLink.style.display = "none";
    if (signupLink) signupLink.style.display = "none";
    if (logoutLink) logoutLink.style.display = "block";
    if (bookingsLink) bookingsLink.style.display = "block";
    if (heroSignup) heroSignup.style.display = "none";

    // Show admin link if user is admin
    if (adminLink) {
      adminLink.style.display = user.role === "admin" ? "block" : "none";
    }
  } else {
    // Show login/signup, hide logout
    if (loginLink) loginLink.style.display = "block";
    if (signupLink) signupLink.style.display = "block";
    if (logoutLink) logoutLink.style.display = "none";
    if (bookingsLink) bookingsLink.style.display = "none";
    if (adminLink) adminLink.style.display = "none";
    if (heroSignup) heroSignup.style.display = "inline-block";
  }
}

// Update navigation on page load
document.addEventListener("DOMContentLoaded", updateNavigationForUser);

// Check token expiration
function checkTokenExpiration() {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;

      if (payload.exp < currentTime) {
        // Token expired
        logout();
        alert("Your session has expired. Please login again.");
      }
    } catch (e) {
      // Invalid token
      logout();
    }
  }
}

// Check token expiration every minute
setInterval(checkTokenExpiration, 60000);

// Initial check
checkTokenExpiration();
