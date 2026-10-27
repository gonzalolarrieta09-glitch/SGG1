// dashboard.js - Lógica para gestionar los gastos con SQLite y OPFS

document.addEventListener("DOMContentLoaded", () => {
  const gastoForm = document.getElementById("gastoForm");
  const listaGastos = document.getElementById("listaGastos");
  const totalGastado = document.getElementById("totalGastado");

  // Función para cargar y mostrar los movimientos desde SQLite
  window.cargarGastos = function() {
    if (!window.db) return;

    try {
      const stmt = window.db.prepare(
        "SELECT id_gasto, monto, fecha, categoria, descripcion FROM gastos WHERE estado_activo = 1 ORDER BY fecha DESC"
      );

      let html = "";
      let total = 0;

      while (stmt.step()) {
        const row = stmt.get();
        const [id_gasto, monto, fecha, categoria, descripcion] = row;

        if (!monto || !categoria) continue;

        const montoNum = parseFloat(monto) || 0;
        total += montoNum;

        html += `
          <div class="gasto-item">
            <div class="gasto-info">
              <p><strong>${categoria}:</strong> ${descripcion || ""} (${fecha || ""})</p>
              <small>$${montoNum.toFixed(2)}</small>
            </div>
            <div class="gasto-actions">
              <button class="btn-danger" type="button" onclick="eliminarGasto(${id_gasto})">Eliminar</button>
            </div>
          </div>
        `;
      }

      stmt.free();

      listaGastos.innerHTML = html || "<p style='font-size: 0.85rem; color: var(--text-muted); text-align: center;'>No hay gastos registrados.</p>";
      totalGastado.textContent = `$${total.toFixed(2)}`;
    } catch (error) {
      console.error("Error al cargar los gastos:", error);
    }
  };

  // Escuchar cuando la base de datos esté lista
  window.addEventListener("dbReady", () => {
    window.cargarGastos();
  });

  // Si ya estuviera lista de antes, cargar de una vez
  if (window.db) {
    window.cargarGastos();
  }

  // Guardar un nuevo gasto al enviar el formulario
  if (gastoForm) {
      // Guardar un nuevo gasto al enviar el formulario
  if (gastoForm) {
    gastoForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!window.db) {
        alert("La base de datos aún se está conectando, aguardá un segundo.");
        return;
      }

      const monto = document.getElementById("gastoMonto").value;
      const fecha = document.getElementById("gastoFecha").value;
      const categoria = document.getElementById("gastoCategoria").value;
      const descripcion = document.getElementById("gastoDescripcion").value;
      const archivoComprobante = document.getElementById("comprobante").files[0];
      
      let comprobanteUrl = "";

      // Si el usuario seleccionó un comprobante, lo subimos a la API externa
      if (archivoComprobante) {
        const formData = new FormData();
        formData.append("image", archivoComprobante);

        try {
          const respuesta = await fetch("URL_DE_TU_API_DE_IMAGENES", {
            method: "POST",
            body: formData
          });
          const datosRespuesta = await respuesta.json();
          comprobanteUrl = datosRespuesta.url || datosRespuesta.data.url;
        } catch (error) {
          console.error("Error al subir la imagen:", error);
          alert("Hubo un error al subir el comprobante.");
          return;
        }
      }

      try {
        const stmt = window.db.prepare(
          "INSERT INTO gastos (monto, fecha, categoria, descripcion, comprobante, estado_activo) VALUES (?, ?, ?, ?, ?, 1)"
        );
        stmt.run([monto, fecha, categoria, descripcion, comprobanteUrl]);
        stmt.free();

        if (typeof window.guardarBaseDatos === "function") {
          window.guardarBaseDatos();
        }

        gastoForm.reset();
        window.cargarGastos();
      } catch (error) {
        console.error("Error al guardar el gasto:", error);
      }
    });
  }

      try {
        const stmt = window.db.prepare(
          "INSERT INTO gastos (monto, fecha, categoria, descripcion, estado_activo) VALUES (?, ?, ?, ?, 1)"
        );
        stmt.run([monto, fecha, categoria, descripcion]);
        stmt.free();

        if (typeof window.guardarBaseDatos === "function") {
          window.guardarBaseDatos();
        }

        gastoForm.reset();
        window.cargarGastos();
      } catch (error) {
        console.error("Error al guardar el gasto:", error);
      }
    });
  }

  // Función para baja lógica (estado_activo = 0)
  window.eliminarGasto = function(id_gasto) {
    if (!confirm("¿Estás seguro de eliminar este gasto?")) return;

    try {
      const stmt = window.db.prepare("UPDATE gastos SET estado_activo = 0 WHERE id_gasto = ?");
      stmt.run([id_gasto]);
      stmt.free();

      if (typeof window.guardarBaseDatos === "function") {
        window.guardarBaseDatos();
      }

      window.cargarGastos();
    } catch (error) {
      console.error("Error al eliminar el gasto:", error);
    }
  };
});