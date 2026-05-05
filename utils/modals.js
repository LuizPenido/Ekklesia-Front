export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");
  }
}

export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
  }
}

export function closeAllModals() {
  document.querySelectorAll(".modal.active").forEach((modal) => {
    modal.classList.remove("active");
  });
}

export function showError(message, elementId = "login-error", duration = 5000) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.style.display = "block";
    element.classList.remove("success");
    element.classList.add("error");

    if (duration > 0) {
      setTimeout(() => {
        element.style.display = "none";
      }, duration);
    }
  }
}

export function showSuccess(message, elementId = "login-error", duration = 3000) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.style.display = "block";
    element.classList.remove("error");
    element.classList.add("success");

    if (duration > 0) {
      setTimeout(() => {
        element.style.display = "none";
      }, duration);
    }
  }
}

export function setupModalListeners() {
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      e.target.classList.remove("active");
    }
  });

  document.querySelectorAll(".close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", function () {
      const modal = this.closest(".modal");
      if (modal) {
        modal.classList.remove("active");
      }
    });
  });
}
