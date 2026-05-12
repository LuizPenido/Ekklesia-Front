const API_URL = "http://localhost:3000/api";

async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Erro na requisição para ${endpoint}:`, error);
    throw error;
  }
}

export async function getUsuarios() {
  return apiCall("/admin/usuarios");
}

export async function getUsuario(id) {
  return apiCall(`/admin/usuarios/${id}`);
}

export async function createUsuario(data) {
  return apiCall("/auth/registro", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateUsuario(id, data) {
  return apiCall(`/admin/usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteUsuario(id) {
  return apiCall(`/admin/usuarios/${id}`, {
    method: "DELETE",
  });
}

export async function getEventos() {
  return apiCall("/eventos");
}

export async function getEvento(id) {
  return apiCall(`/eventos/${id}`);
}

export async function createEvento(data) {
  return apiCall("/eventos", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEvento(id, data) {
  return apiCall(`/eventos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteEvento(id) {
  return apiCall(`/eventos/${id}`, {
    method: "DELETE",
  });
}

export async function getEscalas() {
  return apiCall("/escalas");
}

export async function getEscala(id) {
  return apiCall(`/escalas/${id}`);
}

export async function createEscala(data) {
  return apiCall("/escalas", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEscala(id, data) {
  return apiCall(`/escalas/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteEscala(id) {
  return apiCall(`/escalas/${id}`, {
    method: "DELETE",
  });
}

export async function getEscalaParticipantes(id) {
  return apiCall(`/escalas/${id}/participantes`);
}

export async function addEscalaParticipante(escalaId, data) {
  return apiCall(`/escalas/${escalaId}/participantes`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateParticipanteStatus(participanteId, data) {
  return apiCall(`/escalas/participantes/${participanteId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function removeEscalaParticipante(id) {
  return apiCall(`/escalas/participantes/${id}`, {
    method: "DELETE",
  });
}

export async function getNotificacoes() {
  return apiCall("/notificacoes");
}

export async function getNotificacoesCount() {
  return apiCall("/notificacoes/count");
}

export async function marcarNotificacaoLida(id) {
  return apiCall(`/notificacoes/${id}/lida`, { method: "PUT" });
}

export async function login(email, senha) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Falha no login");
  }

  return await response.json();
}
