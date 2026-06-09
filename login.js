let cuentasValidas =
JSON.parse(localStorage.getItem("usuarios")) || {
    usuario1: "clave123",
    admin: "admin2026"
};

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const registroForm = document.getElementById("registroForm");
    const mensajeDiv = document.getElementById("mensajeResultado");
    const themeToggle = document.getElementById("themeToggle");

    const botonRegistro =
        document.getElementById("mostrarRegistro");

    const registroContainer =
        document.getElementById("registroContainer");

    botonRegistro.addEventListener("click", () => {

        if (registroContainer.style.display === "block") {

            registroContainer.style.display = "none";
            botonRegistro.textContent = "Crear cuenta";

        } else {

            registroContainer.style.display = "block";
            botonRegistro.textContent = "Ocultar registro";

        }

    });

    loginForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const usuario =
            document.getElementById("username").value.trim();

        const contraseña =
            document.getElementById("password").value;

        mensajeDiv.className = "message";

        if (!cuentasValidas[usuario]) {

            mensajeDiv.textContent =
                "❌ Usuario no registrado.";

            mensajeDiv.classList.add("error");

        } else if (
            cuentasValidas[usuario] === contraseña
        ) {

            mensajeDiv.textContent =
                "✅ Inicio de sesión correcto.";

            mensajeDiv.classList.add("success");

        } else {

            mensajeDiv.textContent =
                "❌ Contraseña incorrecta.";

            mensajeDiv.classList.add("error");

        }

    });

    registroForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const usuario =
            document.getElementById("nuevoUsuario").value.trim();

        const correo =
            document.getElementById("correo").value.trim();

        const contraseña =
            document.getElementById("nuevaPassword").value;

        mensajeDiv.className = "message";

        if (
            !correo.endsWith("@gmail.com") &&
            !correo.endsWith("@yahoo.com")
        ) {

            mensajeDiv.textContent =
                "❌ El correo debe terminar en @gmail.com o @yahoo.com";

            mensajeDiv.classList.add("error");
            return;
        }

        if (cuentasValidas[usuario]) {

            mensajeDiv.textContent =
                "❌ Ese usuario ya existe.";

            mensajeDiv.classList.add("error");
            return;
        }

        cuentasValidas[usuario] = contraseña;

        localStorage.setItem(
            "usuarios",
            JSON.stringify(cuentasValidas)
        );

        mensajeDiv.textContent =
            "✅ Usuario registrado correctamente.";

        mensajeDiv.classList.add("success");

        registroForm.reset();

    });

    if (localStorage.getItem("tema") === "oscuro") {
        document.body.classList.add("dark-mode");
    }

    themeToggle.addEventListener("click", () => {

        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("tema", "oscuro");
        } else {
            localStorage.setItem("tema", "claro");
        }

    });

});