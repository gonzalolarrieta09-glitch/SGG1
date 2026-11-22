// app.js
window.addEventListener("dbReady", () => {
  console.log("La base de datos está lista en app.js 🚀");
  
  const formGasto = document.getElementById("formGasto");
  if (formGasto) {
    formGasto.addEventListener("submit", registrarGasto);
  }
});

function registrarGasto(event) {
  event.preventDefault(); // Evita que la página se recargue

  if (!window.db) {
    console.error("La base de datos no está inicializada.");
    return;
  }

  // 1. Capturar los valores del formulario
  const monto = parseFloat(document.getElementById('monto').value);
  const fecha = document.getElementById('fecha').value;
  const categoria = document.getElementById('categoria').value;
  const descripcion = document.getElementById('descripcion').value;
  const tipo_movimiento = document.getElementById('tipo_movimiento').value;
  const url_comprobante = document.getElementById('url_comprobante').value || null;
  const id_usuario = 1; 

  try {
    // 2. Ejecutar la inserción en la tabla de gastos
    window.db.run(`
      INSERT INTO gastos (id_usuario, monto, fecha, categoria, descripcion, tipo_movimiento, url_comprobante, estado_activo)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)

