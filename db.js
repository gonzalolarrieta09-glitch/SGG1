// Declaramos una nueva variable global una unica vez para almacenar la instancia de la base de datos SQLite
let db = null;

async function initDatabase() {
  try {
    const SQL = await initSqlJs({
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });

    let savedData = null;
    try {
      const root = await navigator.storage.getDirectory();
      const handle = await root.getFileHandle("sgg_database.sqlite");
      const file = await handle.getFile();
      const buffer = await file.arrayBuffer();
      savedData = new Uint8Array(buffer);
    } catch (e) {
      console.log("No se encontró base de datos previa, se creará una nueva.");
    }

    if (savedData) {
      db = new SQL.Database(savedData);
    } else {
      db = new SQL.Database();
      crearTablas();
    }

    window.db = db;
    console.log("¡Base de datos SQLite conectada con éxito!");

    // Disparar un evento avisando que la BD ya está lista
    window.dispatchEvent(new Event("dbReady"));

  } catch (err) {
    console.error("Error al inicializar SQLite:", err);
  }
}

function crearTablas() {
  if (!db) return;

  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      fecha_registro TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS gastos (
      id_gasto INTEGER PRIMARY KEY AUTOINCREMENT,
      id_usuario INTEGER,
      monto REAL NOT NULL,
      fecha TEXT NOT NULL,
      categoria TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      estado_activo INTEGER DEFAULT 1,
      FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    );
  `);

  window.guardarBaseDatos();
}

window.guardarBaseDatos = async function() {
  if (!db) return;
  try {
    const data = db.export();
    const root = await navigator.storage.getDirectory();
    const handle = await root.getFileHandle("sgg_database.sqlite", { create: true });
    const writable = await handle.createWritable();
    await writable.write(data);
    await writable.close();
  } catch (err) {
    console.error("Error al guardar en OPFS:", err);
  }
};

document.addEventListener("DOMContentLoaded", initDatabase);