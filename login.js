// Las 2 cuentas pregeneradas para el proyecto
const cuentasValidas = {
    "usuario1": "clave123",
    "admin": "admin2026"
};

// Esperar a que el HTML cargue para activar los controles
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const mensajeDiv = document.getElementById('mensajeResultado');

    // Escucha obligatoria del botón de inicio de sesión
    loginForm.addEventListener('submit', (event) => {
        // CONSERVA la información en los inputs evitando que la página se reinicie
        event.preventDefault(); 

        const usuarioIngresado = document.getElementById('username').value.trim();
        const contrasenaIngresada = document.getElementById('password').value;

        // Limpiar estilos anteriores del mensaje
        mensajeDiv.className = "message";

        // Validación de credenciales
        if (cuentasValidas[usuarioIngresado] && cuentasValidas[usuarioIngresado] === contrasenaIngresada) {
            mensajeDiv.textContent = "Felicidades su cuenta se conectó perfectamente";
            mensajeDiv.classList.add('success');
        } else {
            mensajeDiv.textContent = "Usuario o contraseña incorrectos.";
            mensajeDiv.classList.add('error');
        }
    });
});
