import { loginPage } from './pages/login.js';
import { dashboardPage } from './pages/dashboard.js';
import { usuariosPage } from './pages/usuarios.js';
import { eventosPage } from './pages/eventos.js';
import { auth } from './utils/auth.js';
import { closeModal } from './utils/modals.js';

class Router {
  constructor() {
    this.pages = {
      login: loginPage,
      dashboard: dashboardPage,
      usuarios: usuariosPage,
      eventos: eventosPage
    };
    
    this.currentPage = null;
    this.initialized = false;
  }

  async init() {
    for (const page of Object.values(this.pages)) {
      if (page.init) {
        await page.init();
      }
    }

    this.setupMenuListeners();
    this.initialized = true;

    if (auth.isAuthenticated()) {
      this.navigate('dashboard');
    } else {
      this.navigate('login');
    }
  }

  navigate(pageName) {
    if (!this.canAccess(pageName)) {
      this.navigate('dashboard');
      return;
    }

    const page = this.pages[pageName];
    if (!page) {
      console.error(`Página não encontrada: ${pageName}`);
      return;
    }

    if (pageName === 'login') {
      this.showLogin();
    } else {
      this.showApp();
    }

    if (this.currentPage && this.currentPage.hide) {
      this.currentPage.hide();
    }

    if (page.show) {
      page.show();
    }

    this.updateMenuActive(pageName);
    
    this.currentPage = page;
  }

  canAccess(pageName) {
    const isAuthenticated = auth.isAuthenticated();
    const isLoginPage = pageName === 'login';

    if (isLoginPage) {
      return !isAuthenticated;
    }

    // Se não está autenticado, só pode acessar login
    if (!isAuthenticated) {
      return false;
    }

    // Usuários (admin only)
    if (pageName === 'usuarios' && !auth.canManageUsers()) {
      return false;
    }

    return true;
  }

  setupMenuListeners() {
    document.querySelectorAll('[data-page]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const pageName = item.dataset.page;
        this.navigate(pageName);
      });
    });

    // Logout
    const logoutBtn = document.querySelector('[onclick="logout()"]');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    }
  }

  updateMenuActive(pageName) {
    document.querySelectorAll('[data-page]').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.page === pageName) {
        item.classList.add('active');
      }
    });
  }

  logout() {
    auth.logout();
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.reset();

    this.navigate('login');
  }

  showApp() {
    const appContainer = document.getElementById('app-container');
    const loginPage = document.getElementById('login-page');
    
    if (loginPage) loginPage.classList.remove('active');
    if (appContainer) appContainer.classList.add('active');

    const userDisplay = document.getElementById('user-display');
    if (userDisplay && auth.user) {
      userDisplay.textContent = auth.user.name;
    }

    const usuariosMenu = document.getElementById('usuarios-menu');
    if (usuariosMenu) {
      usuariosMenu.style.display = auth.canManageUsers() ? 'block' : 'none';
    }
  }

  showLogin() {
    const appContainer = document.getElementById('app-container');
    const loginPage = document.getElementById('login-page');
    
    if (appContainer) appContainer.classList.remove('active');
    if (loginPage) loginPage.classList.add('active');
  }
}

export const router = new Router();

window.router = router;
window.logout = () => router.logout();
window.closeModal = closeModal;
