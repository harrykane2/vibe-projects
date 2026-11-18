const form = document.querySelector("#application-form");
const statusElement = document.querySelector("#form-status");
const submitButton = form.querySelector("button[type='submit']");

function clearFieldErrors() {
  form.querySelectorAll(".field-error").forEach((errorElement) => {
    errorElement.textContent = "";
  });
  form.querySelectorAll("input").forEach((input) => {
    input.classList.remove("invalid");
  });
}

function showFieldErrors(fieldErrors) {
  for (const [fieldName, message] of Object.entries(fieldErrors)) {
    const input = form.elements[fieldName];
    const errorElement = document.querySelector(`#${fieldName}-error`);

    if (input) {
      input.classList.add("invalid");
    }
    if (errorElement) {
      errorElement.textContent = message;
    }
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusElement.className = "form-status";
  statusElement.textContent = "";
  clearFieldErrors();
  submitButton.disabled = true;

  const formData = new FormData(form);
  const payload = {
    childAge: formData.get("childAge"),
    location: formData.get("location"),
    preferredTime: formData.get("preferredTime"),
    contactMethod: formData.get("contactMethod"),
  };

  try {
    const response = await fetch("/api/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.fieldErrors) {
        showFieldErrors(data.fieldErrors);
      } else {
        statusElement.textContent = data.message || "Проверьте данные заявки.";
      }
      return;
    }

    statusElement.className = "form-status success";
    statusElement.textContent = data.message;
    form.reset();
  } catch {
    statusElement.textContent = "Не удалось отправить заявку. Проверьте подключение и попробуйте ещё раз.";
  } finally {
    submitButton.disabled = false;
  }
});
