// app.js
window.addEventListener("dbReady", () => {
  console.log("La base de datos está lista en app.js 🚀");

  const formGasto = document.getElementById("gastoForm");
  if (formGasto) {
    formGasto.addEventListener("submit", registrarGasto);
  }

  // Cargar los gastos iniciales al arrancar la app
  cargarGastos();
});

function registrarGasto(event) {
  event.preventDefault();

  if (!window.db) {
    console.error("La base de datos no está inicializada.");
    return;
  }

  // 1. Capturar los valores usando los IDs exactos del HTML
  const monto = parseFloat(document.getElementById('gastoMonto').value);
  const fecha = document.getElementById('gastoFecha').value;
  const categoria = document.getElementById('gastoCategoria').value;
  const descripcion = document.getElementById('gastoDescripcion').value;
  const tipo_movimiento = "Gasto"; 
  const url_comprobante = document.getElementById('comprobante').value || null;
  const id_usuario = 1; 

  try {
    // 2. Ejecutar la inserción en la base de datos
    window.db.run(`
      INSERT INTO gastos (id_usuario, monto, fecha, categoria, descripcion, tipo_movimiento, url_comprobante, estado_activo)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `, [id_usuario, monto, fecha, categoria, descripcion, tipo_movimiento, url_comprobante]);

    // 3. Guardar cambios en OPFS
    if (typeof window.guardarBaseDatos === "function") {
      window.guardarBaseDatos();
    }

    console.log("¡Movimiento registrado con éxito 📊!");
    event.target.reset(); // Limpia el formulario tras registrar

    // 4. Actualizar la interfaz visualmente
    cargarGastos();
  } catch (err) {
    console.error("Error al registrar el movimiento:", err);
  }
}

