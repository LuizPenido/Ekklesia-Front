import * as api from '../utils/api.js';
import { openModal, closeModal } from '../utils/modals.js';

export const escalasPage = {
  name: 'escalas',

  async init() {
    this.setupFormListener();
  },

  show() {
    const content = document.getElementById('escalas');
    if (content) {
      content.classList.add('active');
    }
    this.loadEscalas();
  },

  hide() {
    const content = document.getElementById('escalas');
    if (content) {
      content.classList.remove('active');
    }
  },

  cleanup() {
    const form = document.getElementById('escala-form');
    if (form) {
      form.removeEventListener('submit', this.handleSaveEscala.bind(this));
    }
  },

  setupFormListener() {
    const form = document.getElementById('escala-form');
    if (form) {
      form.addEventListener('submit', this.handleSaveEscala.bind(this));
    }
  },

  async loadEscalas() {
    try {
      const list = document.getElementById('escalas-list');
      if (!list) return;

      list.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Carregando...</p>';

      const escalas = await api.getEscalas();

      if (escalas.length === 0) {
        list.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Nenhuma escala criada</p>';
        return;
      }

      list.innerHTML = escalas.map(e => {
        const inicio = new Date(e.inicio_em).toLocaleString('pt-BR');
        return `
          <div class="escala-card">
            <h3>${e.nome}</h3>
            <p><strong>Evento ID:</strong> ${e.evento_id}</p>
            <p><strong>Ministério ID:</strong> ${e.ministerio_id}</p>
            <p><strong>Início:</strong> ${inicio}</p>
            ${e.observacoes ? `<p>${e.observacoes}</p>` : ''}
            <div style="margin-top: 10px; gap: 5px; display: flex;">
              <button class="btn btn-secondary btn-small" onclick="escalasPage.editEscala(${e.id})">Editar</button>
              <button class="btn btn-danger btn-small" onclick="escalasPage.deleteEscala(${e.id})">Deletar</button>
            </div>
          </div>
        `;
      }).join('');
    } catch (error) {
      console.error('Erro ao carregar escalas:', error);
      alert('Erro ao carregar escalas: ' + error.message);
    }
  },

  async loadEventosForSelect() {
    try {
      const eventos = await api.getEventos();
      const select = document.getElementById('escala-evento');
      
      if (!select) return;
      
      select.innerHTML = '<option value="">Selecione o Evento</option>' +
        eventos.map(e => `<option value="${e.id}">${e.titulo}</option>`).join('');
    } catch (error) {
      console.error('Erro ao carregar eventos para select:', error);
    }
  },

  openCreateModal() {
    const form = document.getElementById('escala-form');
    if (form) form.reset();
    
    const idField = document.getElementById('escala-id');
    if (idField) idField.value = '';
    
    const titleField = document.getElementById('escala-modal-title');
    if (titleField) titleField.textContent = 'Nova Escala';
    
    this.loadEventosForSelect();
    openModal('escala-modal');
  },

  async editEscala(id) {
    try {
      const escala = await api.getEscala(id);
      await this.loadEventosForSelect();
      
      const idField = document.getElementById('escala-id');
      const nomeField = document.getElementById('escala-nome');
      const eventoField = document.getElementById('escala-evento');
      const ministField = document.getElementById('escala-ministerio');
      const inicioField = document.getElementById('escala-inicio');
      const fimField = document.getElementById('escala-fim');
      const obsField = document.getElementById('escala-observacoes');
      const titleField = document.getElementById('escala-modal-title');

      if (idField) idField.value = id;
      if (nomeField) nomeField.value = escala.nome;
      if (eventoField) eventoField.value = escala.evento_id;
      if (ministField) ministField.value = escala.ministerio_id || '';
      if (inicioField) inicioField.value = escala.inicio_em.slice(0, 16);
      if (fimField) fimField.value = escala.fim_em.slice(0, 16);
      if (obsField) obsField.value = escala.observacoes || '';
      if (titleField) titleField.textContent = 'Editar Escala';
      
      openModal('escala-modal');
    } catch (error) {
      console.error('Erro ao carregar escala:', error);
      alert('Erro ao carregar escala: ' + error.message);
    }
  },

  async handleSaveEscala(e) {
    e.preventDefault();
    
    const idField = document.getElementById('escala-id');
    const nomeField = document.getElementById('escala-nome');
    const eventoField = document.getElementById('escala-evento');
    const ministField = document.getElementById('escala-ministerio');
    const inicioField = document.getElementById('escala-inicio');
    const fimField = document.getElementById('escala-fim');
    const obsField = document.getElementById('escala-observacoes');

    if (!nomeField || !eventoField || !ministField || !inicioField || !fimField) {
      alert('Erro ao processar formulário');
      return;
    }

    const id = idField ? idField.value : '';
    const eventoId = parseInt(eventoField.value);
    const ministId = parseInt(ministField.value) || 1;

    if (isNaN(eventoId) || eventoId <= 0) {
      alert('Selecione um evento válido');
      return;
    }

    const data = {
      evento_id: eventoId,
      ministerio_id: ministId,
      nome: nomeField.value,
      inicio_em: inicioField.value,
      fim_em: fimField.value,
      observacoes: obsField ? obsField.value : ''
    };

    try {
      if (id) {
        await api.updateEscala(id, data);
      } else {
        await api.createEscala(data);
      }
      
      alert(id ? 'Escala atualizada!' : 'Escala criada!');
      closeModal('escala-modal');
      this.loadEscalas();
    } catch (error) {
      console.error('Erro ao salvar escala:', error);
      alert('Erro: ' + (error.message || 'Falha na operação'));
    }
  },

  async deleteEscala(id) {
    if (!confirm('Tem certeza que deseja deletar esta escala?')) return;

    try {
      await api.deleteEscala(id);
      alert('Escala deletada!');
      this.loadEscalas();
    } catch (error) {
      console.error('Erro ao deletar escala:', error);
      alert('Erro: ' + error.message);
    }
  }
};

// Expor métodos globalmente para onclick
window.escalasPage = escalasPage;
