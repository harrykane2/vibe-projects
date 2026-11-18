const form = document.querySelector("#login-form");
const statusElement = document.querySelector("#login-status");
const submitButton = form.querySelector("button");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusElement.textContent = "";
  submitButton.disabled = true;

  const formData = new FormData(form);
  const response = await fetch("/api/auth/sign-in/email", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: formData.get("email"),
      password: formData.get("password"),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    statusElement.textContent = data.message || "Не удалось войти. Проверьте электронную почту и пароль.";
  } else {
    window.location.href = "/applications.html";
  }

  submitButton.disabled = false;
});
