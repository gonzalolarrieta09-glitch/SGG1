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
  // Componentes DOM
  const themeToggle = document.getElementById("themeToggle");
  const mensajeDiv = document.getElementById("mensajeResultado");
  const togglePasswordButtons = document.querySelectorAll(".toggle-password-btn");

  const loginSection = document.getElementById("loginSection");
  const registerSection = document.getElementById("registerSection");
  const recoverSection = document.getElementById("recoverSection");

  const linkToRegister = document.getElementById("linkToRegister");
  const linkToRecover = document.getElementById("linkToRecover");
  const linksToLogin = document.querySelectorAll(".linkToLogin");

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const recoverForm = document.getElementById("recoverForm");

  // ---- CONTROL DE TEMA ----
  function aplicarTema(esOscuro) {
    if (esOscuro) {
      document.body.classList.add("dark-mode");
      if (themeToggle) themeToggle.textContent = "☀️ Modo Claro";
      localStorage.setItem("tema", "oscuro");
    } else {
      document.body.classList.remove("dark-mode");
      if (themeToggle) themeToggle.textContent = "🌙 Modo Oscuro";
      localStorage.setItem("tema", "claro");
    }
  }

  // Cargar tema guardado previamente
  const temaGuardado = localStorage.getItem("tema");
  aplicarTema(temaGuardado === "oscuro");

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const esOscuro = !document.body.classList.contains("dark-mode");
      aplicarTema(esOscuro);
    });
  }

  // ---- BOTÓN DE MOSTRAR/OCULTAR CONTRASEÑA ----
  togglePasswordButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const inputId = btn.getAttribute("data-target");
      const inputField = document.getElementById(inputId);
      if (inputField) {
        if (inputField.type === "password") {
          inputField.type = "text";
          btn.textContent = "🙈";
        } else {
          inputField.type = "password";
          btn.textContent = "👁️";
        }
      }
    });
  });

  // ---- NAVEGACIÓN SPA ----
  function conmutarVista(vistaDestino) {
    loginSection.classList.add("hidden");
    registerSection.classList.add("hidden");
    recoverSection.classList.add("hidden");

    vistaDestino.classList.remove("hidden");

    if (mensajeDiv) {
      mensajeDiv.textContent = "";
      mensajeDiv.className = "message hidden";
    }

    loginForm.reset();
    registerForm.reset();
    recoverForm.reset();

    const regReqList = document.getElementById("regReqList");
    const recReqList = document.getElementById("recReqList");
    if (regReqList) regReqList.classList.add("hidden");
    if (recReqList) recReqList.classList.add("hidden");
  }

  if (linkToRegister) {
    linkToRegister.addEventListener("click", (e) => {
      e.preventDefault();
      conmutarVista(registerSection);
    });
  }

  if (linkToRecover) {
    linkToRecover.addEventListener("click", (e) => {
      e.preventDefault();
      conmutarVista(recoverSection);
    });
  }

  linksToLogin.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      conmutarVista(loginSection);
    });
  });

  // ---- REGLAS DE VALIDACIÓN DE CONTRASEÑA ----
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

    if (listaContenedora) {
      if (pass.length > 0) {
        listaContenedora.classList.remove("hidden");
      } else {
        listaContenedora.classList.add("hidden");
      }
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

  const regPassword = document.getElementById("regPassword");
  const btnRegisterSubmit = document.getElementById("btnRegisterSubmit");
  if (regPassword) {
    regPassword.addEventListener("input", () => {
      refrescarChecklistUX(regPassword.value, "reg", btnRegisterSubmit);
    });
  }

  const recPassword = document.getElementById("recPassword");
  const btnRecoverSubmit = document.getElementById("btnRecoverSubmit");
  if (recPassword) {
    recPassword.addEventListener("input", () => {
      refrescarChecklistUX(recPassword.value, "rec", btnRecoverSubmit);
    });
  }

  // ---- ACCIÓN INICIO DE SESIÓN ----
  let intentosFallidos = 0;
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const user = document.getElementById("username").value.trim();
      const pass = document.getElementById("password").value;
      const db = JSON.parse(localStorage.getItem("cuentasSGG")) || {};
      const btnSubmit = document.getElementById("btnLoginSubmit");

      if (!db[user] || db[user].password !== pass) {
        intentosFallidos++;
        mensajeDiv.classList.remove("hidden");
        if (intentosFallidos >= 3) {
          btnSubmit.disabled = true;
          mensajeDiv.textContent = "🚨 Bloqueado por 30 segundos debido a 3 fallos.";
          mensajeDiv.className = "message error";
          setTimeout(() => {
            intentosFallidos = 0;
            btnSubmit.disabled = false;
            mensajeDiv.textContent = "🔓 Acceso desbloqueado. Intente nuevamente.";
            mensajeDiv.className = "message success";
          }, 30000);
        } else {
          mensajeDiv.textContent = `❌ Credenciales incorrectas. Intentos: ${intentosFallidos}/3`;
          mensajeDiv.className = "message error";
        }
      } else {
        intentosFallidos = 0;
        mensajeDiv.classList.remove("hidden");
        mensajeDiv.textContent = "✅ Autenticación correcta. ¡Bienvenido!";
        mensajeDiv.className = "message success";
      }
    });
  }
});
