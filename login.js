// Base de datos simulada en localStorage
if (!localStorage.getItem("cuentasSGG")) {
  const cuentasIniciales = {
    usuario1: {
      password: "Clave*123",
      email: "usuario1@empresa.com",
      nombre: "Juan",
      apellido: "Perez"
    },
    admin: {
      password: "Admin*2026",
      email: "admin@corporativo.org",
      nombre: "Carlos",
      apellido: "SGG"
    }
  };
  localStorage.setItem("cuentasSGG", JSON.stringify(cuentasIniciales));
}

document.addEventListener("DOMContentLoaded", () => {
  // Componentes del DOM Globales
  const themeToggle = document.getElementById("themeToggle");
  const mensajeDiv = document.getElementById("mensajeResultado");
  const togglePasswordButtons = document.querySelectorAll(".toggle-password-btn");

  // Componentes de Secciones Unificadas
  const loginSection = document.getElementById("loginSection");
  const registerSection = document.getElementById("registerSection");
  const recoverSection = document.getElementById("recoverSection");

  // Enlaces de Navegación Interna
  const linkToRegister = document.getElementById("linkToRegister");
  const linkToRecover = document.getElementById("linkToRecover");
  const linksToLogin = document.querySelectorAll(".linkToLogin");

  // Formularios independientes
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const recoverForm = document.getElementById("recoverForm");

  // ---- RF-02: CONTROL DE TEMA PERSISTENTE ----
  if (localStorage.getItem("tema") === "oscuro") {
    document.body.classList.add("dark-mode");
    if (themeToggle) themeToggle.textContent = "🌼 Tema claro";
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      const esOscuro = document.body.classList.contains("dark-mode");
      localStorage.setItem("tema", esOscuro ? "oscuro" : "claro");
      themeToggle.textContent = esOscuro ? "🌼 Tema claro" : "🌙 Tema oscuro";
    });
  }

  // ---- CONTROL UX: BOTÓN DE VER/OCULTAR CONTRASEÑA ----
  togglePasswordButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const inputId = btn.getAttribute("data-target");
      const inputField = document.getElementById(inputId);
      if (inputField.type === "password") {
        inputField.type = "text";
        btn.textContent = "🙈";
        btn.setAttribute("aria-label", "Ocultar contraseña");
      } else {
        inputField.type = "password";
        btn.textContent = "👁️";
        btn.setAttribute("aria-label", "Mostrar contraseña");
      }
    });
  });

  // ---- MOTOR DE NAVEGACIÓN INTERNA (SPA) ----
  function conmutarVista(vistaDestino) {
    loginSection.classList.add("hidden");
    registerSection.classList.add("hidden");
    recoverSection.classList.add("hidden");
    vistaDestino.classList.remove("hidden");

    // Resetear mensajes y formularios al cambiar de pantalla
    mensajeDiv.textContent = "";
    mensajeDiv.className = "message";
    loginForm.reset();
    registerForm.reset();
    recoverForm.reset();

    // Ocultar listas de requerimientos de nuevo al cambiar de vista
    document.getElementById("regReqList").classList.add("hidden");
    document.getElementById("recReqList").classList.add("hidden");

    // Resetear botones de contraseñas visibles a su estado base
    document.querySelectorAll('input[type="text"]').forEach((input) => {
      if (input.id.includes("pass") || input.id.includes("Password")) {
        input.type = "password";
      }
    });

    togglePasswordButtons.forEach((b) => {
      b.textContent = "👁️";
      b.setAttribute("aria-label", "Mostrar contraseña");
    });
  }

  linkToRegister.addEventListener("click", (e) => {
    e.preventDefault();
    conmutarVista(registerSection);
  });

  linkToRecover.addEventListener("click", (e) => {
    e.preventDefault();
    conmutarVista(recoverSection);
  });

  linksToLogin.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      conmutarVista(loginSection);
    });
  });

  // ---- VALIDACIÓN DE LAS REGLAS DE CONTRASEÑA ----
  function analizarContrasena(pass) {
    return {
      longitud: pass.length >= 8,
      mayuscula: /[A-Z]/.test(pass),
      minuscula: /[a-z]/.test(pass),
      numero: /[0-9]/.test(pass),
      especial: /[^A-Za-z0-9]/.test(pass)
    };
  }

  function refrescarChecklistUX(pass, prefijo, btnSubmit) {
    const checks = analizarContrasena(pass);
    const listaContenedora = document.getElementById(`${prefijo}ReqList`);

    // Mostrar u ocultar la lista completa dependiendo de si hay texto ingresado
    if (pass.length > 0) {
      listaContenedora.classList.remove("hidden");
    } else {
      listaContenedora.classList.add("hidden");
    }

    const procesarItem = (subId, valido, texto) => {
      const el = document.getElementById(`${prefijo}${subId}`);
      if (el) {
        el.className = valido ? "req-valid" : "req-invalid";
        el.textContent = (valido ? "✅ " : "❌ ") + texto;
      }
    };

    procesarItem("ReqLen", checks.longitud, "Mínimo 8 caracteres");
    procesarItem("ReqMay", checks.mayuscula, "Al menos 1 Mayúscula");
    procesarItem("ReqMin", checks.minuscula, "Al menos 1 Minúscula");
    procesarItem("ReqNum", checks.numero, "Al menos 1 Número");
    procesarItem("ReqEsp", checks.especial, "Al menos 1 Carácter especial (!@#$%)");

    const todoAprobado = Object.values(checks).every((v) => v === true);
    if (btnSubmit) btnSubmit.disabled = !todoAprobado;
  }

  // Escuchadores en tiempo real (Feedback UX dinámico)
  const regPassword = document.getElementById("regPassword");
  const btnRegisterSubmit = document.getElementById("btnRegisterSubmit");
  regPassword.addEventListener("input", () => {
    refrescarChecklistUX(regPassword.value, "reg", btnRegisterSubmit);
  });

  const recPassword = document.getElementById("recPassword");
  const btnRecoverSubmit = document.getElementById("btnRecoverSubmit");
  recPassword.addEventListener("input", () => {
    refrescarChecklistUX(recPassword.value, "rec", btnRecoverSubmit);
  });

  // ---- ACCIÓN: INICIO DE SESIÓN (RF-01) ----
  let intentosFallidos = 0;
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value;
    const db = JSON.parse(localStorage.getItem("cuentasSGG"));

    // Aquí continúa la lógica del evento submit...
  });
});
