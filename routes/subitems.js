// routes/subitems.js
const express = require('express');
const router = express.Router();
const { getPool } = require('../db');

router.post('/', async (req, res) => {
  try {
    const pool = getPool();
    const { seccion_id, nombre } = req.body;
    if (!seccion_id || !nombre)
      return res.status(400).json({ error: 'Faltan datos' });

    const [result] = await pool.query(
      'INSERT INTO subitems (seccion_id, nombre, contenido) VALUES (?, ?, ?)',
      [seccion_id, nombre, '']
    );
    res.json({ id: result.insertId, seccion_id, nombre, contenido: '' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear subitem' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const id = parseInt(req.params.id);
    const [rows] = await pool.query('SELECT * FROM subitems WHERE id = ?', [id]);
    if (rows.length === 0)
      return res.status(404).json({ error: 'No encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener subitem' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const id = parseInt(req.params.id);
    const { contenido, nombre } = req.body;

    if (typeof contenido === 'undefined' && typeof nombre === 'undefined')
      return res.status(400).json({ error: 'Nada para actualizar' });

    if (typeof contenido !== 'undefined' && typeof nombre !== 'undefined') {
      await pool.query('UPDATE subitems SET contenido = ?, nombre = ? WHERE id = ?', [contenido, nombre, id]);
    } else if (typeof contenido !== 'undefined') {
      await pool.query('UPDATE subitems SET contenido = ? WHERE id = ?', [contenido, id]);
    } else {
      await pool.query('UPDATE subitems SET nombre = ? WHERE id = ?', [nombre, id]);
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar subitem' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const id = parseInt(req.params.id);
    await pool.query('DELETE FROM subitems WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar subitem' });
  }
});

module.exports = router;

