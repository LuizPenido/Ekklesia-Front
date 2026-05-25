import { auth } from "../utils/auth.js";
import { showError } from "../utils/modals.js";
import { updateNotifBadge } from "../utils/notifBadge.js";

const API = "http://localhost:3000";

export const loginPage = {
  name: "login",
  _emailRecuperacao: "",

  async init() {
    const form = document.getElementById("login-form");
    if (form) form.addEventListener("submit", this.handleLogin.bind(this));

    const recuperarForm = document.getElementById("recuperar-form");
    if (recuperarForm) recuperarForm.addEventListener("submit", this.handleSolicitarCodigo.bind(this));

    const redefinirForm = document.getElementById("redefinir-form");
    if (redefinirForm) redefinirForm.addEventListener("submit", this.handleRedefinirSenha.bind(this));
  },

  show() {
    const loginPage = document.getElementById("login-page");
    const appContainer = document.getElementById("app-container");
    if (loginPage) loginPage.classList.add("active");
    if (appContainer) appContainer.classList.remove("active");
    this.showStep("login");
  },

  hide() {
    const loginPage = document.getElementById("login-page");
    if (loginPage) loginPage.classList.remove("active");
  },

  // Controla qual "passo" está visível dentro do login-box
  showStep(step) {
    const steps = {
      login: ["login-form", "btn-esqueci-senha", "demo-info-el"],
      solicitar: ["step-solicitar"],
      redefinir: ["step-redefinir"],
      sucesso: ["step-sucesso"],
    };

    // Esconde tudo
    ["login-form", "btn-esqueci-senha", "step-solicitar", "step-redefinir", "step-sucesso"].forEach((id) => {
      const el = document.getElementById(id) || document.querySelector(`.${id}`);
      if (el) el.style.display = "none";
    });

    // Esconde demo-info via classe
    const demoInfo = document.querySelector(".demo-info");
    if (demoInfo) demoInfo.style.display = "none";

    // Mostra os elementos do passo atual
    if (step === "login") {
      const loginForm = document.getElementById("login-form");
      const btnEsqueci = document.getElementById("btn-esqueci-senha");
      const demo = document.querySelector(".demo-info");
      if (loginForm) loginForm.style.display = "flex";
      if (btnEsqueci) btnEsqueci.style.display = "block";
      if (demo) demo.style.display = "block";
      this._limparErros();
    } else {
      const el = document.getElementById(`step-${step}`);
      if (el) el.style.display = "block";
    }
  },

  _limparErros() {
    ["login-error", "recuperar-error", "redefinir-error"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });
  },

  _mostrarErro(id, msg) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = msg;
      el.style.display = "block";
    }
  },

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("login-email")?.value.trim();
    const password = document.getElementById("login-password")?.value;

    if (!email || !password) {
      this._mostrarErro("login-error", "Preencha email e senha!");
      return;
    }

    try {
      await auth.login(email, password);
      if (window.router) {
        window.router.navigate("dashboard");
        updateNotifBadge();
      }
    } catch (error) {
      this._mostrarErro("login-error", error.message || "Email ou senha incorretos");
    }
  },

  async handleSolicitarCodigo(e) {
    e.preventDefault();
    const email = document.getElementById("recuperar-email")?.value.trim();

    if (!email) {
      this._mostrarErro("recuperar-error", "Informe o email.");
      return;
    }

    const btn = e.target.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Enviando...";

    try {
      const res = await fetch(`${API}/api/auth/recuperar-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Resposta é sempre genérica no back (segurança)
      // Avançamos direto para o passo de inserir o código
      this._emailRecuperacao = email;
      this.showStep("redefinir");
    } catch (err) {
      this._mostrarErro("recuperar-error", "Erro ao conectar ao servidor. Verifique se o back está rodando.");
    } finally {
      btn.disabled = false;
      btn.textContent = "Enviar Código";
    }
  },

  async handleRedefinirSenha(e) {
    e.preventDefault();
    const codigo = document.getElementById("redefinir-codigo")?.value.trim();
    const novaSenha = document.getElementById("redefinir-senha")?.value;
    const confirmSenha = document.getElementById("redefinir-senha-conf")?.value;

    if (!codigo || !novaSenha || !confirmSenha) {
      this._mostrarErro("redefinir-error", "Preencha todos os campos.");
      return;
    }

    if (novaSenha.length < 6) {
      this._mostrarErro("redefinir-error", "A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (novaSenha !== confirmSenha) {
      this._mostrarErro("redefinir-error", "As senhas não coincidem.");
      return;
    }

    const btn = e.target.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Redefinindo...";

    try {
      const res = await fetch(`${API}/api/auth/redefinir-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: this._emailRecuperacao,
          codigo,
          nova_senha: novaSenha,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        this._mostrarErro("redefinir-error", data.error || "Erro ao redefinir senha.");
        return;
      }

      // Sucesso!
      this._emailRecuperacao = "";
      document.getElementById("redefinir-form")?.reset();
      this.showStep("sucesso");
    } catch (err) {
      this._mostrarErro("redefinir-error", "Erro ao conectar ao servidor.");
    } finally {
      btn.disabled = false;
      btn.textContent = "Redefinir Senha";
    }
  },
};

window.loginPage = loginPage;