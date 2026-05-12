import * as api from "../utils/api.js";
import { openModal, closeModal, showSnackbar } from "../utils/modals.js";
import { auth } from "../utils/auth.js";

export const escalasPage = {
  name: "escalas",
  currentEventoId: null,

  async init() {
    this.setupFormValidation();
    this.setupFormListener();
    this.setupParticipanteFormListener();
  },

  _validateEscalaForm() {
    const nome = document.getElementById("escala-nome")?.value.trim();
    const inicio = document.getElementById("escala-inicio")?.value;
    const fim = document.getElementById("escala-fim")?.value;
    const submitBtn = document.getElementById("escala-submit-btn");
    const warningMsg = document.getElementById("escala-form-warning");

    let valid = !!(nome && inicio && fim);
    let warning = "";

    if (inicio && fim && new Date(fim) <= new Date(inicio)) {
      valid = false;
      warning = "A data de fim deve ser posterior à data de início.";
    } else if (!valid && (nome || inicio || fim)) {
      warning = "Preencha todos os campos obrigatórios.";
    }

    if (submitBtn) submitBtn.disabled = !valid;
    if (warningMsg) {
      warningMsg.textContent = warning;
      warningMsg.style.display = warning ? "block" : "none";
    }
  },

  _validateParticipanteForm() {
    const usuario = document.getElementById("participante-usuario")?.value;
    const hInicio = document.getElementById("participante-horario-inicio")?.value;
    const hFim = document.getElementById("participante-horario-fim")?.value;
    const btn = document.getElementById("participante-submit-btn");
    const valid = !!(usuario && hInicio && hFim && new Date(hFim) > new Date(hInicio));
    if (btn) btn.disabled = !valid;
  },

  setupFormValidation() {
    ["escala-nome", "escala-inicio", "escala-fim"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", () => this._validateEscalaForm());
        el.addEventListener("change", () => this._validateEscalaForm());
      }
    });
    const usuarioSelect = document.getElementById("participante-usuario");
    if (usuarioSelect) usuarioSelect.addEventListener("change", () => this._validateParticipanteForm());
    ["participante-horario-inicio", "participante-horario-fim"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", () => this._validateParticipanteForm());
        el.addEventListener("change", () => this._validateParticipanteForm());
      }
    });
  },

  setupFormListener() {
    const form = document.getElementById("escala-form");
    if (form) form.addEventListener("submit", this.handleSaveEscala.bind(this));
  },

  setupParticipanteFormListener() {
    const form = document.getElementById("participante-form");
    if (form) form.addEventListener("submit", this.handleAddParticipante.bind(this));
  },

  // Abre modal listando escalas de um evento
  async viewEscalasDoEvento(eventoId) {
    this.currentEventoId = eventoId;
    try {
      const evento = await api.getEvento(eventoId);
      document.getElementById("evento-escalas-title").textContent = "Escalas: " + evento.titulo;
    } catch {}
    const btn = document.getElementById("nova-escala-evento-btn");
    if (btn) btn.style.display = auth.isAdmin() || auth.isLider() ? "" : "none";
    await this._renderEventoEscalasList();
    openModal("evento-escalas-modal");
  },

  async _renderEventoEscalasList() {
    const list = document.getElementById("evento-escalas-list");
    if (!list) return;
    list.innerHTML = '<p class="empty-msg">Carregando...</p>';
    try {
      const escalas = await api.getEscalas();
      const filtered = escalas.filter((e) => e.evento_id == this.currentEventoId);
      const isLiderOuAdmin = auth.isAdmin() || auth.isLider();

      if (filtered.length === 0) {
        list.innerHTML = '<p class="empty-msg">Nenhuma escala cadastrada para este evento.</p>';
        return;
      }

      list.innerHTML = filtered
        .map((e) => {
          const inicio = new Date(e.inicio_em).toLocaleString("pt-BR");
          return `
          <div class="escala-item">
            <div class="escala-item-info">
              <span class="escala-item-nome">${e.nome}</span>
              <span class="escala-item-data">${inicio}</span>
            </div>
            <div class="escala-item-actions">
              <button class="btn btn-secondary btn-small" onclick="escalasPage.viewEscala(${e.id})">Ver</button>
              ${
                isLiderOuAdmin
                  ? `
                <button class="btn btn-secondary btn-small" onclick="escalasPage.editEscala(${e.id})">Editar</button>
                <button class="btn btn-primary btn-small" onclick="escalasPage.openAddParticipanteModal(${e.id})">+ Participante</button>
                <button class="btn btn-danger btn-small" onclick="escalasPage.deleteEscala(${e.id})">Deletar</button>
              `
                  : ""
              }
            </div>
          </div>
        `;
        })
        .join("");
    } catch {
      list.innerHTML = '<p class="empty-msg">Erro ao carregar escalas.</p>';
    }
  },

  async openCreateModalForCurrentEvento() {
    const form = document.getElementById("escala-form");
    if (form) form.reset();
    document.getElementById("escala-id").value = "";
    document.getElementById("escala-modal-title").textContent = "Nova Escala";
    document.getElementById("escala-submit-btn").disabled = true;
    const w = document.getElementById("escala-form-warning");
    if (w) w.style.display = "none";
    openModal("escala-modal");
  },

  async loadUsuariosForSelect() {
    try {
      const usuarios = await api.getUsuarios();
      const select = document.getElementById("participante-usuario");
      if (!select) return;
      select.innerHTML = '<option value="">Selecione o Usuário *</option>' + usuarios.map((u) => `<option value="${u.id}">${u.nome} (${u.email})</option>`).join("");
    } catch {
      showSnackbar("Erro ao carregar usuários.", "error");
    }
  },

  async editEscala(id) {
    try {
      const escala = await api.getEscala(id);
      document.getElementById("escala-id").value = id;
      document.getElementById("escala-nome").value = escala.nome;
      document.getElementById("escala-inicio").value = escala.inicio_em.slice(0, 16);
      document.getElementById("escala-fim").value = escala.fim_em.slice(0, 16);
      document.getElementById("escala-observacoes").value = escala.observacoes || "";
      document.getElementById("escala-modal-title").textContent = "Editar Escala";
      const w = document.getElementById("escala-form-warning");
      if (w) w.style.display = "none";
      this._validateEscalaForm();
      openModal("escala-modal");
    } catch (error) {
      showSnackbar("Erro ao carregar escala: " + error.message, "error");
    }
  },

  async handleSaveEscala(e) {
    e.preventDefault();
    const id = document.getElementById("escala-id")?.value;
    const nome = document.getElementById("escala-nome")?.value.trim();
    const inicio = document.getElementById("escala-inicio")?.value;
    const fim = document.getElementById("escala-fim")?.value;
    const obs = document.getElementById("escala-observacoes")?.value;
    const eventoId = this.currentEventoId;

    if (!eventoId) {
      showSnackbar("Evento não identificado.", "error");
      return;
    }

    const data = { evento_id: eventoId, ministerio_id: 1, nome, inicio_em: inicio, fim_em: fim, observacoes: obs || "" };

    try {
      if (id) {
        await api.updateEscala(id, data);
        showSnackbar("Escala atualizada com sucesso!", "success");
      } else {
        await api.createEscala(data);
        showSnackbar("Escala cadastrada com sucesso!", "success");
      }
      closeModal("escala-modal");
      if (this.currentEventoId) await this._renderEventoEscalasList();
    } catch (error) {
      showSnackbar("Erro: " + (error.message || "Falha na operação"), "error");
    }
  },

  async deleteEscala(id) {
    if (!confirm("Tem certeza que deseja deletar esta escala?")) return;
    try {
      await api.deleteEscala(id);
      showSnackbar("Escala deletada!", "success");
      if (this.currentEventoId) await this._renderEventoEscalasList();
    } catch (error) {
      showSnackbar("Erro: " + error.message, "error");
    }
  },

  async viewEscala(id) {
    try {
      const [escala, participantes] = await Promise.all([api.getEscala(id), api.getEscalaParticipantes(id)]);

      document.getElementById("view-escala-title").textContent = escala.nome;
      const inicio = new Date(escala.inicio_em).toLocaleString("pt-BR");
      const fim = escala.fim_em ? new Date(escala.fim_em).toLocaleString("pt-BR") : "—";
      const currentUserId = parseInt(auth.user?.id);
      const isLiderOuAdmin = auth.isAdmin() || auth.isLider();

      let participantesHTML = "";
      if (participantes.length === 0) {
        participantesHTML = '<p class="empty-msg" style="margin:0;">Nenhum participante adicionado.</p>';
      } else {
        participantesHTML = participantes
          .map((p) => {
            const statusClass = { CONFIRMADO: "badge-success", RECUSADO: "badge-danger", PENDENTE: "badge-warning" }[p.status_convite] || "badge-warning";
            const isOwn = p.usuario_id === currentUserId;
            const hInicio = p.horario_inicio ? new Date(p.horario_inicio).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : null;
            const hFim = p.horario_fim ? new Date(p.horario_fim).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : null;
            const horarioStr = hInicio && hFim ? `${hInicio} – ${hFim}` : hInicio ? `a partir de ${hInicio}` : "";
            return `
            <div class="participante-row">
              <div class="participante-info">
                <span class="participante-nome">${p.nome}</span>
                ${p.funcao_id ? `<span class="participante-funcao">${p.funcao_id}</span>` : ""}
                ${horarioStr ? `<span class="participante-funcao">${horarioStr}</span>` : ""}
              </div>
              <div class="participante-actions">
                <span class="badge ${statusClass}">${p.status_convite}</span>
                ${
                  isLiderOuAdmin && !isOwn
                    ? `
                  <button class="btn btn-danger btn-small" onclick="escalasPage.removeParticipante(${p.id}, ${id})">Remover</button>
                `
                    : ""
                }
              </div>
            </div>
          `;
          })
          .join("");
      }

      document.getElementById("view-escala-body").innerHTML = `
        <div class="escala-detail-info">
          <p><strong>Início:</strong> ${inicio}</p>
          <p><strong>Fim:</strong> ${fim}</p>
          ${escala.observacoes ? `<p><strong>Obs:</strong> ${escala.observacoes}</p>` : ""}
        </div>
        <h4 class="section-label">Participantes</h4>
        <div class="participantes-list">${participantesHTML}</div>
      `;

      document.getElementById("view-escala-modal").dataset.escalaId = id;
      openModal("view-escala-modal");
    } catch (error) {
      showSnackbar("Erro ao carregar escala: " + error.message, "error");
    }
  },

  async updatePresenca(participanteId, status) {
    try {
      await api.updateParticipanteStatus(participanteId, { status_convite: status });
      showSnackbar(status === "CONFIRMADO" ? "Presença confirmada!" : "Presença recusada.", status === "CONFIRMADO" ? "success" : "warning");
      const modal = document.getElementById("view-escala-modal");
      if (modal?.dataset.escalaId) await this.viewEscala(parseInt(modal.dataset.escalaId));
    } catch (error) {
      showSnackbar("Erro ao atualizar presença: " + error.message, "error");
    }
  },

  async removeParticipante(participanteId, escalaId) {
    if (!confirm("Remover este participante da escala?")) return;
    try {
      await api.removeEscalaParticipante(participanteId);
      showSnackbar("Participante removido.", "success");
      await this.viewEscala(escalaId);
    } catch (error) {
      showSnackbar("Erro: " + error.message, "error");
    }
  },

  async openAddParticipanteModal(escalaId) {
    const form = document.getElementById("participante-form");
    if (form) form.reset();
    document.getElementById("participante-escala-id").value = escalaId;
    const btn = document.getElementById("participante-submit-btn");
    if (btn) btn.disabled = true;
    await this.loadUsuariosForSelect();
    openModal("participante-modal");
  },

  async handleAddParticipante(e) {
    e.preventDefault();
    const escalaId = document.getElementById("participante-escala-id")?.value;
    const usuarioId = document.getElementById("participante-usuario")?.value;
    const funcao = document.getElementById("participante-funcao")?.value;
    const horarioInicio = document.getElementById("participante-horario-inicio")?.value;
    const horarioFim = document.getElementById("participante-horario-fim")?.value;

    if (!usuarioId) {
      showSnackbar("Selecione um usuário.", "error");
      return;
    }

    try {
      await api.addEscalaParticipante(escalaId, {
        usuario_id: parseInt(usuarioId),
        funcao_id: funcao || null,
        horario_inicio: horarioInicio || null,
        horario_fim: horarioFim || null,
      });
      showSnackbar("Participante adicionado!", "success");
      closeModal("participante-modal");
    } catch (error) {
      showSnackbar("Erro: " + error.message, "error");
    }
  },
};

window.escalasPage = escalasPage;
