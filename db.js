let db = null;

// 1. Cargar el archivo .sqlite desde el OPFS si ya existe
async function loadDbFromOPFS() {
    try {
        const root = await navigator.storage.getDirectory();
        const Handle = await root.getFileHandle("Gastos.sqlite");
        const file = await Handle.getFile();
        const buffer = await file.arrayBuffer();
       return new Uint8Array(buffer);
    } catch (e) {
    // si el archivo no existe todavia, retornamos null
    console.log("No se encontró el archivo en OPFS, se creará uno nuevo.");
    return null;       
    }
}
// 2. Guardar el archivo .sqlite en el OPFS
async function saveDbToOPFS(db) {
    if (!db) return;
    const data = db.export(); // Exportar la base de datos a un array binario
    const root = await navigator.storage.getDirectory();
    const Handle = await root.getFileHandle("Gastos.sqlite", { create: true });
    const writable = await Handle.createWritable();
    await writable.write(data);
    await writable.close();
    console.log("Base de datos guardada en OPFS.");
}
//  3. Inicializar SQLite y la estructura de tablas
async function initDatabase() {
    try {
        // inicializar sql.js indicado donde esta el archivo .wasm
        const SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}` });

        // intentar recuperar base de datos existente
        const savedData = await loadDbFromOPFS();
        if (savedData) {
            db = new SQL.Database(savedData);
            console.log("Base de datos cargada desde OPFS.");
        } else {
            db = new SQL.Database();
            // Crear la estructura inicial obligatoria
            db.run(`
                CREATE TABLE IF NOT EXISTS movimientos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    descripcion TEXT NOT NULL,
                    monto REAL NOT NULL,
                    tipo_movimiento TEXT CHECK(tipo_movimiento IN ('ingreso', 'egreso')) NOT NULL,
                    url_comprobante TEXT,
                    activo INTEGER DEFAULT 1
                );
            `);
            await saveDbToOPFS(db);
        }
    } catch (error) {
        console.error("Error al inicializar la base de datos:", error);
    }
}

// Llamar a la inicialización al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    initDatabase();
});