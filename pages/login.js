import { auth } from '../utils/auth.js';

export const loginPage = {
  name: 'login',
  
  async init() {
    const form = document.getElementById('login-form');
    if (form) {
      form.addEventListener('submit', this.handleLogin.bind(this));
    }
  },

  show() {
    const loginPage = document.getElementById('login-page');
    const appContainer = document.getElementById('app-container');
    
    if (loginPage) loginPage.classList.add('active');
    if (appContainer) appContainer.classList.remove('active');

    const form = document.getElementById('login-form');
    if (form) form.reset();
  },

  hide() {
    const loginPage = document.getElementById('login-page');
    if (loginPage) loginPage.classList.remove('active');
  },

  cleanup() {
    const form = document.getElementById('login-form');
    if (form) {
      form.removeEventListener('submit', this.handleLogin.bind(this));
    }
  },

  async handleLogin(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    
    if (!emailInput || !passwordInput) {
      alert('Erro ao processar formulário');
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      alert('Preencha email e senha!');
      return;
    }

    try {
      await auth.login(email, password);
      if (window.router) {
        window.router.navigate('dashboard');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      alert('Erro: ' + (error.message || 'Email ou senha incorretos'));
    }
  }
};
