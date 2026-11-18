const title = document.querySelector("#applications-title");
const statusElement = document.querySelector("#applications-status");
const list = document.querySelector("#applications-list");

async function loadApplications() {
  try {
    const response = await fetch("/api/applications", { credentials: "same-origin" });
    const data = await response.json();

    if (!response.ok) {
      statusElement.textContent = data.message || "Нет доступа к заявкам.";
      if (response.status === 401) {
        window.location.href = "/login.html";
      }
      return;
    }

    title.textContent = data.role === "staff" ? "Входящие заявки" : "Мои заявки";

    if (!data.applications.length) {
      statusElement.textContent = "Заявок пока нет.";
      return;
    }

    list.innerHTML = data.applications.map((application) => `
      <article class="application-row">
        <div><strong>Заявка № ${application.id}</strong></div>
        <div>Возраст ребёнка: ${application.child_age}</div>
        <div>Район или школа: ${escapeHtml(application.location)}</div>
        <div>Удобное время: ${escapeHtml(application.preferred_time)}</div>
        <div>Способ связи: ${escapeHtml(application.contact_method)}</div>
        <div>Создана: ${escapeHtml(application.created_at)}</div>
      </article>
    `).join("");
  } catch {
    statusElement.textContent = "Не удалось загрузить заявки.";
  }
}

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value ?? "";
  return element.innerHTML;
}

document.querySelector("#applications-sign-out").addEventListener("click", async () => {
  await fetch("/api/auth/sign-out", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  window.location.href = "/login.html";
});

loadApplications();
