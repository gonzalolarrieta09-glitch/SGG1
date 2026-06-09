// Cuentas predefinidas
const cuentasValidas = {
usuario1: "clave123",
admin: "admin2026"
};

document.addEventListener("DOMContentLoaded", () => {

```
const loginForm = document.getElementById("loginForm");
const mensajeDiv = document.getElementById("mensajeResultado");

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const usuario = document.getElementById("username").value.trim();
    const contraseña = document.getElementById("password").value;

    mensajeDiv.className = "message";

    if (
        cuentasValidas[usuario] &&
        cuentasValidas[usuario] === contraseña
    ) {
        mensajeDiv.textContent =
            "✅ Felicidades, su cuenta se conectó correctamente.";
        mensajeDiv.classList.add("success");

        // Redirección opcional después de 2 segundos
        setTimeout(() => {
            window.location.href = "inicio.html";
        }, 2000);

    } else {
        mensajeDiv.textContent =
            "❌ Usuario o contraseña incorrectos.";
        mensajeDiv.classList.add("error");
    }
});
```

});
