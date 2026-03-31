const API_URL = "http://localhost:3000/api";

function switchPage(pageName) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.add("hidden");
  });

  if (pageName === "login") {
    document.getElementById("login-page").classList.remove("hidden");
  } else if (pageName === "cadastro") {
    document.getElementById("cadastro-page").classList.remove("hidden");
  } else if (pageName === "home") {
    document.getElementById("home-page").classList.remove("hidden");
    loadUserData();
  }
}

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = e.target[0].value;
  const senha = e.target[1].value;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.nome);
      localStorage.setItem("userType", data.tipo_usuario);
      switchPage("home");
    } else {
      const error = await response.json();
      showError("login-form", error.error || "Erro no login");
    }
  } catch (error) {
    showError("login-form", "Erro ao conectar com o servidor");
  }
});

document.getElementById("cadastro-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = e.target[0].value;
  const email = e.target[1].value;
  const senha = e.target[2].value;
  const tipo_usuario = e.target[3].value;
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_URL}/auth/registro`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nome, email, senha, tipo_usuario }),
    });

    if (response.ok) {
      const data = await response.json();
      showSuccess("cadastro-form", "Usuário cadastrado com sucesso!");
      document.getElementById("cadastro-form").reset();
      setTimeout(() => {
        switchPage("home");
      }, 1500);
    } else {
      const error = await response.json();
      showError("cadastro-form", error.error || "Erro no cadastro");
    }
  } catch (error) {
    showError("cadastro-form", "Erro ao conectar com o servidor");
  }
});

function loadUserData() {
  document.getElementById("user-name").textContent = localStorage.getItem("userName") || "Usuário";

  const userType = localStorage.getItem("userType");
  const adminSection = document.getElementById("admin-section");

  if (userType === "ADMIN" || userType === "LIDER") {
    adminSection.classList.remove("hidden");
  } else {
    adminSection.classList.add("hidden");
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userName");
  localStorage.removeItem("userType");
  document.getElementById("login-form").reset();
  document.getElementById("cadastro-form").reset();
  switchPage("login");
}

function showError(formId, message) {
  let errorDiv = document.querySelector(`#${formId} .error`);
  if (!errorDiv) {
    errorDiv = document.createElement("div");
    errorDiv.className = "error";
    document.getElementById(formId).appendChild(errorDiv);
  }
  errorDiv.textContent = message;
}

function showSuccess(formId, message) {
  let successDiv = document.querySelector(`#${formId} .success`);
  if (!successDiv) {
    successDiv = document.createElement("div");
    successDiv.className = "success";
    document.getElementById(formId).appendChild(successDiv);
  }
  successDiv.textContent = message;
}

// Inicializar na página de login
window.addEventListener("load", () => {
  const token = localStorage.getItem("token");
  if (token) {
    switchPage("home");
  } else {
    switchPage("login");
  }
});
