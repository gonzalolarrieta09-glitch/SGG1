// Base de datos simulada en localStorage
if (!localStorage.getItem("cuentasSGG")) {
    const cuentasIniciales = {
        usuario1: { password: "Clave*123", email: "usuario1@empresa.com", nombre: "Juan", apellido: "Perez" },
        admin: { password: "Admin*2026", email: "admin@corporativo.org", nombre: "Carlos", apellido: "SGG" }
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
        if (themeToggle) themeToggle.textContent = "☀️ Tema claro";
    }

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            const esOscuro = document.body.classList.contains("dark-mode");
            localStorage.setItem("tema", esOscuro ? "oscuro" : "claro");
            themeToggle.textContent = esOscuro ? "☀️ Tema claro" : "🌙 Tema oscuro";
        });
    }

    // ---- CONTROL UX: BOTÓN DE VER/OCULTAR CONTRASEÑA ----
    togglePasswordButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const inputId = btn.getAttribute("data-target");
            const inputField = document.getElementById(inputId);
            if (inputField.type === "password") {
                inputField.type = "text";
                btn.textContent = "🙈";
            } else {
                inputField.type = "password";
                btn.textContent = "👁️";
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
        document.querySelectorAll('input[type="text"]').forEach(input => {
            if(input.id.includes("pass") || input.id.includes("Password")) input.type = "password";
        });
        togglePasswordButtons.forEach(b => b.textContent = "👁️");
    }

    linkToRegister.addEventListener("click", (e) => { e.preventDefault(); conmutarVista(registerSection); });
    linkToRecover.addEventListener("click", (e) => { e.preventDefault(); conmutarVista(recoverSection); });
    linksToLogin.forEach(link => {
        link.addEventListener("click", (e) => { e.preventDefault(); conmutarVista(loginSection); });
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

        const todoAprobado = Object.values(checks).every(v => v === true);
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


    // =========================================================================
    // ACCIÓN: INICIO DE SESIÓN (RF-01)
    // =========================================================================
    let intentosFallidos = 0;
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const user = document.getElementById("username").value.trim();
        const pass = document.getElementById("password").value;
        const db = JSON.parse(localStorage.getItem("cuentasSGG"));
        const btnSubmit = document.getElementById("btnLoginSubmit");

        if (!db[user] || db[user].password !== pass) {
            intentosFallidos++;
            if (intentosFallidos >= 3) {
                btnSubmit.disabled = true;
                mensajeDiv.textContent = "🚨 Ciberseguridad Defensiva: Botón bloqueado por 30 segundos debido a 3 fallos.";
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
            mensajeDiv.textContent = "✅ Autenticación correcta. ¡Bienvenido!";
            mensajeDiv.className = "message success";
        }
    });

    // =========================================================================
    // ACCIÓN: REGISTRO (RF-03)
    // =========================================================================
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const nombre = document.getElementById("regNombre").value.trim();
        const apellido = document.getElementById("regApellido").value.trim();
        const user = document.getElementById("regUser").value.trim();
        const email = document.getElementById("regEmail").value.trim();
        const fechaNac = document.getElementById("regBirth").value;
        const pass = regPassword.value;
        const passConf = document.getElementById("regPasswordConfirm").value;

        // 1. Validar Nombre/Apellido sin números ni caracteres especiales
        if (!/^[A-Za-zÁéíóúáéíóúÑñ\s]+$/.test(nombre) || !/^[A-Za-zÁéíóúáéíóúÑñ\s]+$/.test(apellido)) {
            mensajeDiv.textContent = "❌ Nombre y Apellido solo deben contener letras.";
            mensajeDiv.className = "message error";
            return;
        }

        // 2. Control de Edad Crítica (Mínimo 14 años)
        const hoy = new Date();
        const cumple = new Date(fechaNac);
        let edad = hoy.getFullYear() - cumple.getFullYear();
        if (hoy.getMonth() < cumple.getMonth() || (hoy.getMonth() === cumple.getMonth() && hoy.getDate() < cumple.getDate())) {
            edad--;
        }
        if (edad < 14) {
            mensajeDiv.textContent = "❌ Registro rechazado: Debes ser mayor de 14 años.";
            mensajeDiv.className = "message error";
            return;
        }

        // 3. Formato de Correo Estricto (RegEx)
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            mensajeDiv.textContent = "❌ El formato del correo electrónico corporativo es inválido.";
            mensajeDiv.className = "message error";
            return;
        }

        // 4. Doble Match
        if (pass !== passConf) {
            mensajeDiv.textContent = "❌ Las contraseñas no coinciden.";
            mensajeDiv.className = "message error";
            return;
        }

        const db = JSON.parse(localStorage.getItem("cuentasSGG"));
        if (db[user]) {
            mensajeDiv.textContent = "❌ El nombre de usuario ya existe.";
            mensajeDiv.className = "message error";
            return;
        }

        // Verificar correos duplicados
        if (Object.values(db).some(u => u.email.toLowerCase() === email.toLowerCase())) {
            mensajeDiv.textContent = "❌ El correo electrónico ya está en uso.";
            mensajeDiv.className = "message error";
            return;
        }

        // Guardar Datos
        db[user] = { password: pass, email: email, nombre: nombre, apellido: apellido };
        localStorage.setItem("cuentasSGG", JSON.stringify(db));

        mensajeDiv.textContent = "✅ Registro exitoso. Redirigiendo al Login...";
        mensajeDiv.className = "message success";
        setTimeout(() => conmutarVista(loginSection), 2000);
    });

    // =========================================================================
    // ACCIÓN: RECUPERACIÓN (RF-04)
    // =========================================================================
    recoverForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const user = document.getElementById("recUser").value.trim();
        const email = document.getElementById("recEmail").value.trim();
        const pass = recPassword.value;
        const passConf = document.getElementById("recPasswordConfirm").value;
        const db = JSON.parse(localStorage.getItem("cuentasSGG"));

        if (!db[user] || db[user].email.toLowerCase() !== email.toLowerCase()) {
            mensajeDiv.textContent = "❌ Los datos no coinciden con ningún registro activo.";
            mensajeDiv.className = "message error";
            return;
        }

        // Regla: No repetir la contraseña actual
        if (db[user].password === pass) {
            mensajeDiv.textContent = "❌ La nueva contraseña no puede ser igual a la actual.";
            mensajeDiv.className = "message error";
            return;
        }

        if (pass !== passConf) {
            mensajeDiv.textContent = "❌ Las contraseñas no coinciden.";
            mensajeDiv.className = "message error";
            return;
        }

        // Actualizar base de datos local
        db[user].password = pass;
        localStorage.setItem("cuentasSGG", JSON.stringify(db));

        mensajeDiv.textContent = "✅ Contraseña actualizada con éxito.";
        mensajeDiv.className = "message success";
        setTimeout(() => conmutarVista(loginSection), 2000);
    });
});
