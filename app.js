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

function cargarGastos() {
  if (!window.db) return;

  const id_usuario = 1; 
  const stmt = window.db.prepare(`
    SELECT * FROM gastos 
    WHERE id_usuario = ? AND estado_activo = 1 
    ORDER BY fecha DESC
  `);
  stmt.bind([id_usuario]);

  const listaGastos = document.getElementById("listaGastos");
  if (!listaGastos) return;
  
  listaGastos.innerHTML = "";
  let total = 0;

  while (stmt.step()) {
    const row = stmt.getAsObject();
    total += row.monto;

    const itemHTML = document.createElement("div");
    itemHTML.className = "gasto-item";
    itemHTML.innerHTML = `
      <div class="gasto-info">
        <p><strong>${row.categoria}</strong> - $${row.monto.toFixed(2)} (${row.tipo_movimiento})</p>
        <small>${row.fecha}: ${row.descripcion}</small>
      </div>
      <button class="btn-danger" onclick="eliminarGasto(${row.id_gasto})">Eliminar</button>
    `;
    listaGastos.appendChild(itemHTML);
  }
  stmt.free();

  // Actualizar el total gastado en el dashboard
  const totalGastadoEl = document.getElementById("totalGastado");
  if (totalGastadoEl) {
    totalGastadoEl.textContent = `$${total.toFixed(2)}`;
  }
}

function eliminarGasto(id_gasto) {
  if (!window.db) return;

  try {
    // Borrado lógico: actualiza el estado_activo a 0 en lugar de hacer DELETE físico
    window.db.run(`
      UPDATE gastos 
      SET estado_activo = 0 
      WHERE id_gasto = ?
    `, [id_gasto]);

    if (typeof window.guardarBaseDatos === "function") {
      window.guardarBaseDatos();
    }

    cargarGastos();
    console.log(`Gasto ${id_gasto} marcado como inactivo (borrado lógico) 🗑️`);
  } catch (err) {
    console.error("Error al eliminar el gasto:", err);
  }
}
