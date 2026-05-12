import * as api from "../utils/api.js";
import { showSnackbar } from "../utils/modals.js";
import { updateNotifBadge } from "../utils/notifBadge.js";

export const notificacoesPage = {
  name: "notificacoes",

  async init() {},

  async show() {
    const content = document.getElementById("notificacoes");
    if (content) content.classList.add("active");
    await this.render();
  },

  hide() {
    const content = document.getElementById("notificacoes");
    if (content) content.classList.remove("active");
  },

  async render() {
    const container = document.getElementById("notificacoes-list");
    if (!container) return;
    container.innerHTML = '<p class="empty-msg">Carregando...</p>';

    try {
      const notifs = await api.getNotificacoes();
      if (notifs.length === 0) {
        container.innerHTML = '<p class="empty-msg">Nenhuma notificação.</p>';
        return;
      }

      container.innerHTML = notifs
        .map((n) => {
          const lida = n.lida === 1;
          const data = new Date(n.criado_em).toLocaleString("pt-BR");
          return `
          <div class="notif-card ${lida ? "notif-lida" : ""}">
            <div class="notif-card-header">
              <span class="notif-titulo">${n.titulo}</span>
              <span class="notif-data">${data}</span>
            </div>
            <p class="notif-descricao">${n.descricao || ""}</p>
            ${
              !lida && n.participante_id
                ? `
              <div class="notif-actions">
                <button class="btn btn-success btn-small" onclick="notificacoesPage.responder(${n.id}, ${n.participante_id}, 'CONFIRMADO')">Confirmar</button>
                <button class="btn btn-danger btn-small" onclick="notificacoesPage.responder(${n.id}, ${n.participante_id}, 'RECUSADO')">Rejeitar</button>
              </div>
            `
                : ""
            }
            ${
              !lida && !n.participante_id
                ? `
              <div class="notif-actions">
                <button class="btn btn-secondary btn-small" onclick="notificacoesPage.marcarLida(${n.id})">Marcar como lida</button>
              </div>
            `
                : ""
            }
          </div>
        `;
        })
        .join("");
    } catch (err) {
      container.innerHTML = '<p class="empty-msg">Erro ao carregar notificações.</p>';
    }
  },

  async responder(notifId, participanteId, status) {
    try {
      await api.updateParticipanteStatus(participanteId, { status_convite: status });
      await api.marcarNotificacaoLida(notifId);
      showSnackbar(status === "CONFIRMADO" ? "Participação confirmada!" : "Participação recusada.", status === "CONFIRMADO" ? "success" : "warning");
      await this.render();
      await updateNotifBadge();
    } catch (err) {
      showSnackbar("Erro: " + err.message, "error");
    }
  },

  async marcarLida(notifId) {
    try {
      await api.marcarNotificacaoLida(notifId);
      await this.render();
      await updateNotifBadge();
    } catch (err) {
      showSnackbar("Erro: " + err.message, "error");
    }
  },
};

window.notificacoesPage = notificacoesPage;
