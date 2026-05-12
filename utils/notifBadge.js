import * as api from "./api.js";

export async function updateNotifBadge() {
  try {
    const { count } = await api.getNotificacoesCount();
    const badge = document.getElementById("notif-count-badge");
    if (!badge) return;
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = "inline-flex";
    } else {
      badge.style.display = "none";
    }
  } catch {}
}
