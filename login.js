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
        mensajeDiv.textContent = "Felicidades, su cuenta se conectó perfectamente.";
        mensajeDiv.classList.add("success");
    } else {
        mensajeDiv.textContent = "Usuario o contraseña incorrectos.";
        mensajeDiv.classList.add("error");
    }
});
```

});
