let cuentasValidas = {
    usuario1: "clave123",
    admin: "admin2026"
};

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const mensajeDiv = document.getElementById("mensajeResultado");
    const themeToggle = document.getElementById("themeToggle");

    // Aplicar tema guardado
    const temaGuardado = localStorage.getItem("tema");

    if (temaGuardado === "oscuro") {
        document.body.classList.add("dark-mode");
    }

    // Cambio de tema
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

        // Texto inicial del botón
        if (document.body.classList.contains("dark-mode")) {
            themeToggle.textContent = "☀️ Tema claro";
        } else {
            themeToggle.textContent = "🌙 Tema oscuro";
        }
    }

    // Inicio de sesión
    loginForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const usuario = document.getElementById("username").value.trim();
        const contraseña = document.getElementById("password").value;

        mensajeDiv.className = "message";

        if (!cuentasValidas[usuario]) {

            mensajeDiv.textContent = "❌ Usuario no registrado.";
            mensajeDiv.classList.add("error");

        } else if (cuentasValidas[usuario] === contraseña) {

            mensajeDiv.textContent = "✅ Inicio de sesión correcto.";
            mensajeDiv.classList.add("success");

        } else {

            mensajeDiv.textContent = "❌ Contraseña incorrecta.";
            mensajeDiv.classList.add("error");

        }

    });

});
