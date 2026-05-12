import * as api from "../utils/api.js";
import { openModal, closeModal } from "../utils/modals.js";
import { auth } from "../utils/auth.js";

export const eventosPage = {
  name: "eventos",

  async init() {
    this.setupFormListener();
    this.setupFormValidation();
    // Esconde botão Novo Evento para usuários sem permissão
    const btnNovo = document.querySelector("#eventos .header button");
    if (btnNovo) btnNovo.style.display = auth.isAdmin() || auth.isLider() ? "" : "none";
  },

  show() {
    const content = document.getElementById("eventos");
    if (content) {
      content.classList.add("active");
    }
    this.loadEventos();
  },

  hide() {
    const content = document.getElementById("eventos");
    if (content) {
      content.classList.remove("active");
    }
  },

  cleanup() {
    const form = document.getElementById("evento-form");
    if (form) {
      form.removeEventListener("submit", this.handleSaveEvento.bind(this));
    }
  },

  setupFormListener() {
    const form = document.getElementById("evento-form");
    if (form) {
      form.addEventListener("submit", this.handleSaveEvento.bind(this));
    }
  },

  setupFormValidation() {
    const validate = () => {
      const titulo = document.getElementById("evento-titulo")?.value.trim();
      const inicio = document.getElementById("evento-inicio")?.value;
      const fim = document.getElementById("evento-fim")?.value;
      const btn = document.getElementById("evento-submit-btn");
      let valid = !!(titulo && inicio && fim);
      if (inicio && fim && new Date(fim) <= new Date(inicio)) valid = false;
      if (btn) btn.disabled = !valid;
    };
    ["evento-titulo", "evento-inicio", "evento-fim"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", validate);
        el.addEventListener("change", validate);
      }
    });
    this._validateEventoForm = validate;
  },

  async loadEventos() {
    try {
      const list = document.getElementById("eventos-list");
      if (!list) return;

      list.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Carregando...</p>';

      const eventos = await api.getEventos();

      if (eventos.length === 0) {
        list.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Nenhum evento criado</p>';
        return;
      }

      list.innerHTML = eventos
        .map((e) => {
          const inicio = new Date(e.inicio_em).toLocaleString("pt-BR");
          const fim = new Date(e.fim_em).toLocaleString("pt-BR");
          return `
          <div class="event-card">
            <h3>${e.titulo}</h3>
            <p><strong>Local:</strong> ${e.local || "Não especificado"}</p>
            <p><strong>Início:</strong> ${inicio}</p>
            <p><strong>Fim:</strong> ${fim}</p>
            ${e.descricao ? `<p>${e.descricao}</p>` : ""}
            <div class="card-actions">
              <button class="btn btn-secondary btn-small" onclick="escalasPage.viewEscalasDoEvento(${e.id})">Escalas</button>
              ${
                auth.isAdmin() || auth.isLider()
                  ? `
                <button class="btn btn-secondary btn-small" onclick="eventosPage.editEvento(${e.id})">Editar</button>
                <button class="btn btn-danger btn-small" onclick="eventosPage.deleteEvento(${e.id})">Deletar</button>
              `
                  : ""
              }
            </div>
          </div>
        `;
        })
        .join("");
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
      alert("Erro ao carregar eventos: " + error.message);
    }
  },

  openCreateModal() {
    const form = document.getElementById("evento-form");
    if (form) form.reset();
    const idField = document.getElementById("evento-id");
    if (idField) idField.value = "";
    const titleField = document.getElementById("evento-modal-title");
    if (titleField) titleField.textContent = "Novo Evento";
    const btn = document.getElementById("evento-submit-btn");
    if (btn) btn.disabled = true;
    openModal("evento-modal");
  },

  async editEvento(id) {
    try {
      const evento = await api.getEvento(id);

      const idField = document.getElementById("evento-id");
      const tituloField = document.getElementById("evento-titulo");
      const descField = document.getElementById("evento-descricao");
      const localField = document.getElementById("evento-local");
      const inicioField = document.getElementById("evento-inicio");
      const fimField = document.getElementById("evento-fim");
      const titleField = document.getElementById("evento-modal-title");

      if (idField) idField.value = id;
      if (tituloField) tituloField.value = evento.titulo;
      if (descField) descField.value = evento.descricao || "";
      if (localField) localField.value = evento.local || "";
      if (inicioField) inicioField.value = evento.inicio_em.slice(0, 16);
      if (fimField) fimField.value = evento.fim_em.slice(0, 16);
      if (titleField) titleField.textContent = "Editar Evento";
      this._validateEventoForm?.();
      openModal("evento-modal");
    } catch (error) {
      console.error("Erro ao carregar evento:", error);
      alert("Erro ao carregar evento: " + error.message);
    }
  },

  async handleSaveEvento(e) {
    e.preventDefault();

    const idField = document.getElementById("evento-id");
    const tituloField = document.getElementById("evento-titulo");
    const descField = document.getElementById("evento-descricao");
    const localField = document.getElementById("evento-local");
    const inicioField = document.getElementById("evento-inicio");
    const fimField = document.getElementById("evento-fim");

    if (!tituloField || !inicioField || !fimField) {
      alert("Erro ao processar formulário");
      return;
    }

    const id = idField ? idField.value : "";
    const data = {
      titulo: tituloField.value,
      descricao: descField ? descField.value : "",
      local: localField ? localField.value : "",
      inicio_em: inicioField.value,
      fim_em: fimField.value,
    };

    try {
      if (id) {
        await api.updateEvento(id, data);
      } else {
        await api.createEvento(data);
      }

      alert(id ? "Evento atualizado!" : "Evento criado!");
      closeModal("evento-modal");
      this.loadEventos();
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
      alert("Erro: " + (error.message || "Falha na operação"));
    }
  },

  async deleteEvento(id) {
    if (!confirm("Tem certeza que deseja deletar este evento?")) return;

    try {
      await api.deleteEvento(id);
      alert("Evento deletado!");
      this.loadEventos();
    } catch (error) {
      console.error("Erro ao deletar evento:", error);
      alert("Erro: " + error.message);
    }
  },
};

// Expor métodos globalmente para onclick
window.eventosPage = eventosPage;
