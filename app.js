const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');

const seccionesRoutes = require('./routes/secciones');
const subitemsRoutes = require('./routes/subitems');

const app = express();

app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 🚀 Inicializar base de datos ANTES de levantar el servidor
initDb()
  .then(() => {
    console.log("✅ Base de datos conectada");

    // Rutas
    app.use('/api/secciones', seccionesRoutes);
    app.use('/api/subitems', subitemsRoutes);

    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}/api`);
    });
  })
  .catch(err => {
    console.error("❌ Error inicializando DB:", err);
    process.exit(1);
  });


