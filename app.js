import { router } from './router.js';
import { setupModalListeners } from './utils/modals.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    setupModalListeners();
    await router.init();
  } catch (error) {
    console.error('Erro ao inicializar aplicação:', error);
    alert('Erro ao inicializar aplicação. Verifique o console.');
  }
});
