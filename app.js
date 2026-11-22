// app.js (Actualización con consumo de API REST para comprobantes)
async function registrarGasto(event) {
  event.preventDefault();

  if (!window.db) {
    console.error("La base de datos no está inicializada.");
    return;
  }

  const monto = parseFloat(document.getElementById('gastoMonto').value);
  const fecha = document.getElementById('gastoFecha').value;
  const categoria = document.getElementById('gastoCategoria').value;
  const descripcion = document.getElementById('gastoDescripcion').value;
  const tipo_movimiento = "Gasto"; 
  const id_usuario = 1; 

  // 1. Subida del comprobante a una API REST externa (Ej: ImgBB) con resiliencia
  let url_comprobante = null;
  const fileInput = document.getElementById('comprobante');

  if (fileInput && fileInput.files.length > 0) {
    const formData = new FormData();
    formData.append("image", fileInput.files[0]);

    try {
      // Reemplaza "TU_API_KEY_AQUI" con tu clave de ImgBB o déjalo simulado
      const response = await fetch("https://api.imgbb.com/1/upload?key=TU_API_KEY_AQUI", {
        method: "POST",
        body: formData
      });
      const resultado = await response.json();
      if (resultado && resultado.success) {
        url_comprobante = resultado.data.url;
        console.log("Comprobante subido exitosamente 🖼️:", url_comprobante);
      }
    } catch (err) {
      console.warn("Fallo de red o error en la API externa. Se registrará el gasto con comprobante NULL ⚠️:", err);
    }
  }

  try {
    // 2. Ejecutar la inserción en la base de datos SQLite
    window.db.run(`
      INSERT INTO gastos (id_usuario, monto, fecha, categoria, descripcion, tipo_movimiento, url_comprobante, estado_activo)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `, [id_usuario, monto, fecha, categoria, descripcion, tipo_movimiento, url_comprobante]);

    // 3. Guardar cambios en OPFS
    if (typeof window.guardarBaseDatos === "function") {
      window.guardarBaseDatos();
    }

    console.log("¡Movimiento registrado con éxito 📊!");
    event.target.reset(); 
    cargarGastos();
  } catch (err) {
    console.error("Error al registrar el movimiento en la base de datos:", err);
  }
}
