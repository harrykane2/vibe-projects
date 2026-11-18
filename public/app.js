const form = document.querySelector("#application-form");
const statusElement = document.querySelector("#form-status");
const submitButton = form.querySelector("button[type='submit']");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusElement.className = "form-status";
  statusElement.textContent = "";
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
      statusElement.textContent = data.errors?.join("\n") || data.message || "Проверьте данные заявки.";
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
