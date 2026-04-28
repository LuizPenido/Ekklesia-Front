import * as api from '../utils/api.js';
import { auth } from '../utils/auth.js';

export const dashboardPage = {
  name: 'dashboard',

  async init() {
  },

  show() {
    const content = document.getElementById('home');
    if (content) {
      content.classList.add('active');
    }
    this.loadStats();
  },

  hide() {
    const content = document.getElementById('home');
    if (content) {
      content.classList.remove('active');
    }
  },

  cleanup() {
  },

  async loadStats() {
    try {
      let totalUsuarios = 0;
      
      if (auth.canManageUsers()) {
        try {
          const usuarios = await api.getUsuarios();
          totalUsuarios = usuarios.length;
        } catch (error) {
          console.error('Erro ao carregar usuários:', error);
        }
      }

      let totalEventos = 0;
      let totalEscalas = 0;

      try {
        const eventos = await api.getEventos();
        totalEventos = eventos.length;
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      }

      try {
        const escalas = await api.getEscalas();
        totalEscalas = escalas.length;
      } catch (error) {
        console.error('Erro ao carregar escalas:', error);
      }

      const usuariosElem = document.getElementById('total-usuarios');
      const eventosElem = document.getElementById('total-eventos');
      const escalasElem = document.getElementById('total-escalas');

      if (usuariosElem) usuariosElem.textContent = totalUsuarios;
      if (eventosElem) eventosElem.textContent = totalEventos;
      if (escalasElem) escalasElem.textContent = totalEscalas;
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }
};
