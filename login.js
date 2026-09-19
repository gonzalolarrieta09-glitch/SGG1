// Base de datos simulada en localStorage
if (!localStorage.getItem("cuentasSGG")) {
  const cuentasIniciales = {
    usuario1: { password: "Clave*123", email: "usuario1@empresa.com", nombre: "Juan", apellido: "Perez" },
    admin: { password: "Admin*2026", email: "admin@corporativo.org", nombre: "Carlos", apellido: "SGG" }
  };
  localStorage.setItem("cuentasSGG", JSON.stringify(cuentasIniciales));
}

if (!localStorage.getItem("gastosSGG")) {
  localStorage.setItem("gastosSGG", JSON.stringify([]));
}

document.addEventListener("DOMContentLoaded", () => {
  // Componentes DOM Globales
  const themeToggle = document.getElementById("themeToggle");
  const mensajeDiv = document.getElementById("mensajeResultado");
  const togglePasswordButtons = document.querySelectorAll(".toggle-password-btn");

  const loginSection = document.getElementById("loginSection");
  const registerSection = document.getElementById("registerSection");
  const recoverSection = document.getElementById("recoverSection");
  const dashboardSection = document.getElementById("dashboardSection");

  const linkToRegister = document.getElementById("linkToRegister");
  const linkToRecover = document.getElementById("linkToRecover");
  const linksToLogin = document.querySelectorAll(".linkToLogin");

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const recoverForm = document.getElementById("recoverForm");

  // Componentes del Dashboard
  const gastoForm = document.getElementById("gastoForm");
  const gastoId = document.getElementById("gastoId");
  const gastoMonto = document.getElementById("gastoMonto");
  const gastoFecha = document.getElementById("gastoFecha");
  const gastoCategoria = document.getElementById("gastoCategoria");
  const gastoDescripcion = document.getElementById("gastoDescripcion");
  const btnGastoSubmit = document.getElementById("btnGastoSubmit");
  const btnCancelEdit = document.getElementById("btnCancelEdit");
  const listaGastos = document.getElementById("listaGastos");
  const totalGastadoEl = document.getElementById("totalGastado");
  const welcomeUser = document.getElementById("welcomeUser");
  const btnLogout = document.getElementById("btnLogout");

  let usuarioActivo = localStorage.getItem("usuarioActivo") || null;

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

  const temaGuardado = localStorage.getItem("tema");
  aplicarTema(temaGuardado === "oscuro");

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      aplicarTema(!document.body.classList.contains("dark-mode"));
    });
  }

  // ---- MOSTRAR/OCULTAR CONTRASEÑA ----
  togglePasswordButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const inputField = document.getElementById(btn.getAttribute("data-target"));
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

  // ---- NAVEGACIÓN ENTRE VISTAS ----
  function conmutarVista(vistaDestino) {
    loginSection.classList.add("hidden");
    registerSection.classList.add("hidden");
    recoverSection.classList.add("hidden");
    dashboardSection.classList.add("hidden");

    vistaDestino.classList.remove("hidden");

    if (mensajeDiv) {
      mensajeDiv.textContent = "";
      mensajeDiv.className = "message hidden";
    }
  }

  if (linkToRegister) linkToRegister.addEventListener("click", (e) => { e.preventDefault(); conmutarVista(registerSection); });
  if (linkToRecover) linkToRecover.addEventListener("click", (e) => { e.preventDefault(); conmutarVista(recoverSection); });
  linksToLogin.forEach((link) => link.addEventListener("click", (e) => { e.preventDefault(); conmutarVista(loginSection); }));

  // =========================================================================
  // LOGICA CRUD DE GASTOS (RF-05 AL RF-09)
  // =========================================================================

  function obtenerGastos() {
    return JSON.parse(localStorage.getItem("gastosSGG")) || [];
  }

  function guardarGastos(gastos) {
    localStorage.setItem("gastosSGG", JSON.stringify(gastos));
  }

  // RF-06: HISTORIAL DINÁMICO & RF-09: DASHBOARD
  function renderizarDashboard() {
    if (!usuarioActivo) return;

    welcomeUser.textContent = `Hola, ${usuarioActivo}`;
    const gastos = obtenerGastos();

    // Filtrar solo los registros del usuario activo que estén activos (estado === true)
    const gastosUsuario = gastos.filter(g => g.usuario === usuarioActivo && g.activo === true);

    // RF-09: Calcular Total Gastado
    const total = gastosUsuario.reduce((acc, curr) => acc + parseFloat(curr.monto), 0);
    totalGastadoEl.textContent = `$${total.toFixed(2)}`;

    // RF-06: Renderizar Lista
    listaGastos.innerHTML = "";
    if (gastosUsuario.length === 0) {
      listaGastos.innerHTML = "<p style='text-align:center; font-size:0.85rem; color: var(--text-muted);'>No hay gastos registrados.</p>";
      return;
    }

    gastosUsuario.forEach(gasto => {
      const item = document.createElement("div");
      item.className = "gasto-item";
      item.innerHTML = `
        <div class="gasto-info">
          <p><strong>${gasto.categoria}:</strong> ${gasto.descripcion}</p>
          <small>${gasto.fecha} - <strong>$${parseFloat(gasto.monto).toFixed(2)}</strong></small>
        </div>
        <div class="gasto-actions">
          <button class="btn-secondary" onclick="prepararEdicion('${gasto.id}')">✏️</button>
          <button class="btn-danger" onclick="eliminarGasto('${gasto.id}')">🗑️</button>
        </div>
      `;
      listaGastos.appendChild(item);
    });
  }

  // RF-05 & RF-07: CREAR Y EDITAR REGISTRO
  gastoForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = gastoId.value;
    const monto = gastoMonto.value;
    const fecha = gastoFecha.value;
    const categoria = gastoCategoria.value;
    const descripcion = gastoDescripcion.value.trim();

    let gastos = obtenerGastos();

    if (id) {
      // RF-07: UPDATE
      gastos = gastos.map(g => {
        if (g.id === id) {
          return { ...g, monto, fecha, categoria, descripcion };
        }
        return g;
      });
    } else {
      // RF-05: CREATE
      const nuevoGasto = {
        id: Date.now().toString(),
        usuario: usuarioActivo,
        monto,
        fecha,
        categoria,
        descripcion,
        activo: true // Estado para la baja lógica
      };
      gastos.push(nuevoGasto);
    }

    guardarGastos(gastos);
    resetearFormularioGasto();
    renderizarDashboard();
  });

  // RF-07: Cargar Datos en Formulario para Edición
  window.prepararEdicion = function(id) {
    const gastos = obtenerGastos();
    const gasto = gastos.find(g => g.id === id);

    if (gasto) {
      gastoId.value = gasto.id;
      gastoMonto.value = gasto.monto;
      gastoFecha.value = gasto.fecha;
      gastoCategoria.value = gasto.categoria;
      gastoDescripcion.value = gasto.descripcion;

      btnGastoSubmit.textContent = "Guardar Cambios";
      btnCancelEdit.classList.remove("hidden");
    }
  };

  btnCancelEdit.addEventListener("click", resetearFormularioGasto);

  function resetearFormularioGasto() {
    gastoId.value = "";
    gastoForm.reset();
    btnGastoSubmit.textContent = "Añadir Gasto";
    btnCancelEdit.classList.add("hidden");
  }

  // RF-08: ELIMINACIÓN SEGURA (BAJA LÓGICA)
  window.eliminarGasto = function(id) {
    if (confirm("¿Está seguro de que desea eliminar este registro de gasto?")) {
      let gastos = obtenerGastos();
      gastos = gastos.map(g => {
        if (g.id === id) {
          return { ...g, activo: false }; // Cambio de estado en lugar de delete
        }
        return g;
      });
      guardarGastos(gastos);
      renderizarDashboard();
    }
  };

  // ---- ACCIÓN INICIO DE SESIÓN CON REDIRECCIÓN AL DASHBOARD ----
  let intentosFallidos = 0;
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value;
    const db = JSON.parse(localStorage.getItem("cuentasSGG")) || {};

    if (!db[user] || db[user].password !== pass) {
      intentosFallidos++;
      mensajeDiv.classList.remove("hidden");
      if (intentosFallidos >= 3) {
        mensajeDiv.textContent = "🚨 Bloqueado por 30 segundos debido a 3 fallos.";
        mensajeDiv.className = "message error";
      } else {
        mensajeDiv.textContent = `❌ Credenciales incorrectas. Intentos: ${intentosFallidos}/3`;
        mensajeDiv.className = "message error";
      }
    } else {
      intentosFallidos = 0;
      usuarioActivo = user;
      localStorage.setItem("usuarioActivo", user);
      conmutarVista(dashboardSection);
      renderizarDashboard();
    }
  });

  btnLogout.addEventListener("click", () => {
    usuarioActivo = null;
    localStorage.removeItem("usuarioActivo");
    conmutarVista(loginSection);
  });

  // Si ya hay una sesión activa persistida al recargar la página
  if (usuarioActivo) {
    conmutarVista(dashboardSection);
    renderizarDashboard();
  }
});
