const username = document.getElementById("username");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const toggle = document.getElementById("toggle");
const eyeIcon = document.getElementById("eyeIcon");
const form = document.getElementById("loginForm");

const eyeOff = eyeIcon.innerHTML;
const eyeOn =
  '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';

// Enable the Log in button only when both fields are filled
function validate() {
  loginBtn.disabled = !(username.value.trim() && password.value.length >= 6);
}
username.addEventListener("input", validate);
password.addEventListener("input", validate);

// Show / hide password
toggle.addEventListener("click", () => {
  const show = password.type === "password";
  password.type = show ? "text" : "password";
  eyeIcon.innerHTML = show ? eyeOn : eyeOff;
  toggle.setAttribute("aria-label", show ? "Hide password" : "Show password");
});

// Demo submit handler (no real authentication)
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (loginBtn.disabled) return;
  loginBtn.textContent = "Logging in...";
  setTimeout(() => {
    loginBtn.textContent = "Log in";
    alert("This is a demo UI – no real login is performed.");
  }, 800);
});
