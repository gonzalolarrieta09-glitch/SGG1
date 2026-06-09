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
    }<h3>¿No tienes cuenta? Regístrate</h3>

<form id="registroForm">
    <div class="input-group">
        <label for="nuevoUsuario">Usuario</label>
        <input type="text" id="nuevoUsuario" required>
    </div>

```
<div class="input-group">
    <label for="correo">Correo electrónico</label>
    <input type="email" id="correo" required>
</div>

<div class="input-group">
    <label for="nuevaPassword">Contraseña</label>
    <input type="password" id="nuevaPassword" required>
</div>

<button type="submit">Registrarse</button>
```

</form>

});
```

});
