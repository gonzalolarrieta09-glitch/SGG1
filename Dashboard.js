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
        
        total += parseFloat(monto);

        html += `
          <div class="gasto-item">
            <div class="gasto-info">
              <p><strong>${categoria}:</strong> ${descripcion} (${fecha})</p>
              <small>$${parseFloat(monto).toFixed(2)}</small>
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
    gastoForm.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!window.db) {
        alert("La base de datos aún se está conectando, aguardá un segundo.");
        return;
      }

      const monto = document.getElementById("gastoMonto").value;
      const fecha = document.getElementById("gastoFecha").value;
      const categoria = document.getElementById("gastoCategoria").value;
      const descripcion = document.getElementById("gastoDescripcion").value;

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