import { login as apiLogin } from './api.js';

class AuthManager {
  constructor() {
    this.user = null;
    this.token = null;
    this.loadFromStorage();
  }

  loadFromStorage() {
    this.token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    const userType = localStorage.getItem('userType');
    const userId = localStorage.getItem('userId');

    if (this.token && userName && userType) {
      this.user = {
        id: userId,
        name: userName,
        type: userType
      };
    }
  }

  isAuthenticated() {
    return !!(this.token && this.user);
  }

  async login(email, password) {
    const data = await apiLogin(email, password);
    
    this.token = data.token;
    this.user = {
      id: data.id,
      name: data.nome,
      type: data.tipo_usuario
    };

    localStorage.setItem('token', this.token);
    localStorage.setItem('userName', this.user.name);
    localStorage.setItem('userType', this.user.type);
    localStorage.setItem('userId', this.user.id);

    return this.user;
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.clear();
  }

  getUser() {
    return this.user;
  }

  getToken() {
    return this.token;
  }

  isAdmin() {
    return this.user?.type === 'ADMIN';
  }

  isLider() {
    return this.user?.type === 'LIDER';
  }

  canManageUsers() {
    return this.isAdmin();
  }
}

export const auth = new AuthManager();
