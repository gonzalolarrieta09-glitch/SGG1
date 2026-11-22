// app.js - Sistema completo de gestión de gastos y gráficos 📊

let miGrafico = null;

async function registrarGasto(event) {
  event.preventDefault();

  if (!window.db) {
    console.error("La base de datos 🗄️ no está inicializada.");
    return;
  }

  const monto = parseFloat(document.getElementById('gastoMonto').value);
  const fecha = document.getElementById('gastoFecha').value;
  const categoria = document.getElementById('gastoCategoria').value;
  const descripcion = document.getElementById('gastoDescripcion').value;
  const tipo_movimiento = "Gasto"; 
  const id_usuario = 1; 

  // 1. Subida del comprobante a una API externa (ImgBB)
  let url_comprobante = null;
  const fileInput = document.getElementById('comprobante');

  if (fileInput && fileInput.files.length > 0) {
    const formData = new FormData();
    formData.append("image", fileInput.files[0]);

    try {
      const response = await fetch("https://api.imgbb.com/1/upload?key=TU_API_KEY_AQUI", {
        method: "POST",
        body: formData
      });
      const resultado = await response.json();
      if (resultado && resultado.success) {
        url_comprobante = resultado.data.url;
      }
    } catch (err) {
      console.warn("Fallo en la API externa. Se registrará con comprobante NULL ⚠️:", err);
    }
  }

  try {
    // 2. Inserción en la base de datos SQLite
    window.db.run(`
      INSERT INTO gastos (id_usuario, monto, fecha, categoria, descripcion, tipo_movimiento, url_comprobante, estado_activo)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `, [id_usuario, monto, fecha, categoria, descripcion, tipo_movimiento, url_comprobante]);

    // 3. Guardar cambios en OPFS
    if (typeof window.guardarBaseDatos === "function") {
      window.guardarBaseDatos();
    }

    event.target.reset(); 
    cargarGastos();
  } catch (err) {
    console.error("Error al registrar el movimiento:", err);
  }
}

// 4. Cargar y actualizar registros y gráficos 📈
function cargarGastos() {
  if (!window.db) return;

  // Lógica para mostrar la lista de gastos en tu HTML...

  // Actualizamos el gráfico llamando a la consulta de agregación
  obtenerDatosGrafico();
}

// 5. Consulta SQL con GROUP BY y SUM para el gráfico 🗄️
function obtenerDatosGrafico() {
  if (!window.db) return;
  const stmt = window.db.prepare("SELECT categoria, SUM(monto) as total FROM gastos GROUP BY categoria");
  const datos = [];
  while (stmt.step()) {
    datos.push(stmt.getAsObject());
  }
  stmt.free();
  renderizarGrafico(datos);
}

// 6. Renderizar gráfico usando Chart.js 📉
function renderizarGrafico(datos) {
  const canvas = document.getElementById('graficoGastos');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  const categorias = datos.map(d => d.categoria);
  const montos = datos.map(d => d.total);

  if (miGrafico) miGrafico.destroy();

  miGrafico = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: categorias,
      datasets: [{
        label: 'Total Gastado ($) 💰',
        data: montos,
        backgroundColor: '#36A2EB'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
