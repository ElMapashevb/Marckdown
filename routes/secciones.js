// routes/secciones.js
const express = require('express');
const router = express.Router();
const { getPool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    console.log("📦 Obteniendo secciones y subitems...");
    const [secciones] = await pool.query('SELECT * FROM secciones ORDER BY id');
    const [subitems] = await pool.query('SELECT * FROM subitems ORDER BY id');

    const result = secciones.map(s => ({
      id: s.id,
      nombre: s.nombre,
      created_at: s.created_at,
      subitems: subitems
        .filter(si => si.seccion_id === s.id)
        .map(si => ({
          id: si.id,
          nombre: si.nombre,
          contenido: si.contenido,
          created_at: si.created_at
        }))
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener secciones' });
  }
});

router.post('/', async (req, res) => {
  try {
    const pool = getPool();
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Se necesita nombre' });

    const [result] = await pool.query(
      'INSERT INTO secciones (nombre, created_at) VALUES (?, NOW())',
      [nombre]
    );

    res.json({ id: result.insertId, nombre });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear sección' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const id = parseInt(req.params.id);
    await pool.query('DELETE FROM secciones WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar sección' });
  }
});

module.exports = router;
