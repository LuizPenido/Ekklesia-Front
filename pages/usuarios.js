import * as api from '../utils/api.js';
import { openModal, closeModal } from '../utils/modals.js';

export const usuariosPage = {
  name: 'usuarios',

  async init() {
    this.setupFormListener();
  },

  show() {
    const content = document.getElementById('usuarios');
    if (content) {
      content.classList.add('active');
    }
    this.loadUsuarios();
  },

  hide() {
    const content = document.getElementById('usuarios');
    if (content) {
      content.classList.remove('active');
    }
  },

  cleanup() {
    const form = document.getElementById('user-form');
    if (form) {
      form.removeEventListener('submit', this.handleSaveUser.bind(this));
    }
  },

  setupFormListener() {
    const form = document.getElementById('user-form');
    if (form) {
      form.addEventListener('submit', this.handleSaveUser.bind(this));
    }
  },

  async loadUsuarios() {
    try {
      const tbody = document.getElementById('usuarios-table-body');
      if (!tbody) return;

      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">Carregando...</td></tr>';

      const usuarios = await api.getUsuarios();

      if (usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">Nenhum usuário encontrado</td></tr>';
        return;
      }

      tbody.innerHTML = usuarios.map(u => `
        <tr>
          <td>${u.nome}</td>
          <td>${u.email}</td>
          <td><span class="badge">${u.tipo_usuario}</span></td>
          <td>
            <button class="btn btn-secondary btn-small" onclick="usuariosPage.editUsuario(${u.id})">Editar</button>
            <button class="btn btn-danger btn-small" onclick="usuariosPage.deleteUsuario(${u.id})">Deletar</button>
          </td>
        </tr>
      `).join('');
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      alert('Erro ao carregar usuários: ' + error.message);
    }
  },

  openCreateModal() {
    const form = document.getElementById('user-form');
    if (form) form.reset();
    
    const userIdField = document.getElementById('user-id');
    if (userIdField) userIdField.value = '';
    
    const senhaField = document.getElementById('user-senha');
    if (senhaField) senhaField.required = true;
    
    const titleField = document.getElementById('user-modal-title');
    if (titleField) titleField.textContent = 'Novo Usuário';
    
    openModal('user-modal');
  },

  async editUsuario(id) {
    try {
      const usuario = await api.getUsuario(id);
      
      const idField = document.getElementById('user-id');
      const nomeField = document.getElementById('user-nome');
      const emailField = document.getElementById('user-email');
      const tipoField = document.getElementById('user-tipo');
      const senhaField = document.getElementById('user-senha');
      const titleField = document.getElementById('user-modal-title');

      if (idField) idField.value = id;
      if (nomeField) nomeField.value = usuario.nome;
      if (emailField) emailField.value = usuario.email;
      if (tipoField) tipoField.value = usuario.tipo_usuario;
      if (senhaField) senhaField.required = false;
      if (titleField) titleField.textContent = 'Editar Usuário';
      
      openModal('user-modal');
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      alert('Erro ao carregar usuário: ' + error.message);
    }
  },

  async handleSaveUser(e) {
    e.preventDefault();
    
    const idField = document.getElementById('user-id');
    const nomeField = document.getElementById('user-nome');
    const emailField = document.getElementById('user-email');
    const senhaField = document.getElementById('user-senha');
    const tipoField = document.getElementById('user-tipo');

    if (!nomeField || !emailField || !tipoField) {
      alert('Erro ao processar formulário');
      return;
    }

    const id = idField ? idField.value : '';
    const data = {
      nome: nomeField.value,
      email: emailField.value,
      tipo_usuario: tipoField.value
    };

    if (!id && senhaField && senhaField.value) {
      data.senha = senhaField.value;
    }

    try {
      if (id) {
        await api.updateUsuario(id, data);
      } else {
        await api.createUsuario(data);
      }
      
      alert(id ? 'Usuário atualizado!' : 'Usuário criado!');
      closeModal('user-modal');
      this.loadUsuarios();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      alert('Erro: ' + (error.message || 'Falha na operação'));
    }
  },

  async deleteUsuario(id) {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return;

    try {
      await api.deleteUsuario(id);
      alert('Usuário deletado!');
      this.loadUsuarios();
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      alert('Erro: ' + error.message);
    }
  }
};

// Expor métodos globalmente para onclick
window.usuariosPage = usuariosPage;
