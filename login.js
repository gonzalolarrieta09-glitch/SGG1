// Inicializar Base de Datos PMV en localStorage (Soporta usuario, contraseña y correo)
if (!localStorage.getItem("cuentasSGG")) {
    const cuentasIniciales = {
        usuario1: { password: "clave123", email: "usuario1@test.com" },
        admin: { password: "admin2026", email: "admin@test.com" }
    };
    localStorage.setItem("cuentasSGG", JSON.stringify(cuentasIniciales));
}

document.addEventListener("DOMContentLoaded", () => {

    const themeToggle = document.getElementById("themeToggle");
    const mensajeDiv = document.getElementById("mensajeResultado");

    // Formularios y Secciones
    const loginSection = document.getElementById("loginSection");
    const registerSection = document.getElementById("registerSection");
    const recoverSection = document.getElementById("recoverSection");
    
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const recoverForm = document.getElementById("recoverForm");

    // Enlaces de navegación
    const linkToRegister = document.getElementById("linkToRegister");
    const linkToRecover = document.getElementById("linkToRecover");
    const linksToLogin = document.querySelectorAll(".linkToLogin");

    // --- RF-02: CAMBIO DE TEMA ---
    const temaGuardado = localStorage.getItem("tema");
    if (temaGuardado === "oscuro") {
        document.body.classList.add("dark-mode");
    }

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            if (document.body.classList.contains("dark-mode")) {
                localStorage.setItem("tema", "oscuro");
                themeToggle.textContent = "☀️ Tema claro";
            } else {
                localStorage.setItem("tema", "claro");
                themeToggle.textContent = "🌙 Tema oscuro";
            }
        });

        if (document.body.classList.contains("dark-mode")) {
            themeToggle.textContent = "☀️ Tema claro";
        } else {
            themeToggle.textContent = "🌙 Tema oscuro";
        }
    }

    // --- NAVEGACIÓN ENTRE PANTALLAS ---
    function mostrarSeccion(seccionActiva) {
        loginSection.classList.add("hidden");
        registerSection.classList.add("hidden");
        recoverSection.classList.add("hidden");
        seccionActiva.classList.remove("hidden");
        mensajeDiv.textContent = "";
        mensajeDiv.className = "message";
    }

    linkToRegister.addEventListener("click", (e) => { e.preventDefault(); mostrarSeccion(registerSection); });
    linkToRecover.addEventListener("click", (e) => { e.preventDefault(); mostrarSeccion(recoverSection); });
    linksToLogin.forEach(link => {
        link.addEventListener("click", (e) => { e.preventDefault(); mostrarSeccion(loginSection); });
    });

    // --- FUNCIÓN AUXILIAR: VALIDACIÓN ESTRICTA DE CONTRASEÑA ---
    function validarContrasena(password) {
        const mayus = /[A-Z]/.test(password);
        const minus = /[a-z]/.test(password);
        const num = /[0-9]/.test(password);
        const esp = /[^A-Za-z0-9]/.test(password);
        return mayus && minus && num && esp;
    }

    // --- RF-01: INICIO DE SESIÓN ---
    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const usuario = document.getElementById("username").value.trim();
        const contraseña = document.getElementById("password").value;
        const db = JSON.parse(localStorage.getItem("cuentasSGG"));

        mensajeDiv.className = "message";

        if (!db[usuario]) {
            mensajeDiv.textContent = "❌ Usuario no registrado.";
            mensajeDiv.classList.add("error");
        } else if (db[usuario].password === contraseña) {
            mensajeDiv.textContent = "✅ Inicio de sesión exitoso.";
            mensajeDiv.classList.add("success");
        } else {
            mensajeDiv.textContent = "❌ Contraseña incorrecta.";
            mensajeDiv.classList.add("error");
        }
    });

    // --- RF-03: REGISTRO DE USUARIO ---
    registerForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const usuario = document.getElementById("regUsername").value.trim();
        const email = document.getElementById("regEmail").value.trim();
        const contraseña = document.getElementById("regPassword").value;
        const db = JSON.parse(localStorage.getItem("cuentasSGG"));

        mensajeDiv.className = "message";

        if (db[usuario]) {
            mensajeDiv.textContent = "❌ El nombre de usuario ya existe.";
            mensajeDiv.classList.add("error");
            return;
        }

        // Verificar correo duplicado
        const correosRegistrados = Object.values(db).map(user => user.email);
        if (correosRegistrados.includes(email)) {
            mensajeDiv.textContent = "❌ El correo electrónico ya está en uso.";
            mensajeDiv.classList.add("error");
            return;
        }

        if (!validarContrasena(contraseña)) {
            mensajeDiv.textContent = "❌ La contraseña requiere: 1 Mayúscula, 1 Minúscula, 1 Número y 1 Símbolo.";
            mensajeDiv.classList.add("error");
            return;
        }

        // Guardar usuario
        db[usuario] = { password: contraseña, email: email };
        localStorage.setItem("cuentasSGG", JSON.stringify(db));

        mensajeDiv.textContent = "✅ Cuenta creada exitosamente.";
        mensajeDiv.classList.add("success");
        registerForm.reset();
        setTimeout(() => mostrarSeccion(loginSection), 2000);
    });

    // --- RF-04: RECUPERACIÓN DE CONTRASEÑA ---
    recoverForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const usuario = document.getElementById("recUsername").value.trim();
        const email = document.getElementById("recEmail").value.trim();
        const nuevaContrasena = document.getElementById("recPassword").value;
        const db = JSON.parse(localStorage.getItem("cuentasSGG"));

        mensajeDiv.className = "message";

        if (!db[usuario] || db[usuario].email !== email) {
            mensajeDiv.textContent = "❌ Los datos no coinciden con ningún registro.";
            mensajeDiv.classList.add("error");
            return;
        }

        if (!validarContrasena(nuevaContrasena)) {
            mensajeDiv.textContent = "❌ La nueva contraseña requiere: 1 Mayúscula, 1 Minúscula, 1 Número y 1 Símbolo.";
            mensajeDiv.classList.add("error");
            return;
        }

        // Actualizar credencial
        db[usuario].password = nuevaContrasena;
        localStorage.setItem("cuentasSGG", JSON.stringify(db));

        mensajeDiv.textContent = "✅ Contraseña actualizada correctamente.";
        mensajeDiv.classList.add("success");
        recoverForm.reset();
        setTimeout(() => mostrarSeccion(loginSection), 2000);
    });
});
