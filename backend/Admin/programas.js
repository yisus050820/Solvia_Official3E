const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener programas
router.get('/', (req, res) => {
  let query = `
    SELECT p.*, u.name as coordinator_name 
    FROM programs p
    JOIN users u ON p.coordinator_charge = u.id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching programs:', err);
      return res.status(500).json({ message: 'Error en el servidor. Inténtelo más tarde.' });
    }
    res.json(results);
  });
});

// Crear programa
router.post('/', (req, res) => {
  const { name, description, start_date, end_date, objectives, coordinator_charge, program_image, status = 'active' } = req.body;  // Incluye 'status'

  db.query(
    'INSERT INTO programs (name, description, start_date, end_date, objectives, coordinator_charge, program_image, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',  // Asegúrate de incluir 'status'
    [name, description, start_date, end_date, objectives, coordinator_charge, program_image, status],
    (err, result) => {
      if (err) {
        console.error('Error inserting program:', err);
        return res.status(500).json({ message: 'Error al crear programa.' });
      }
      const newProgram = { id: result.insertId, name, description, start_date, end_date, objectives, coordinator_charge, program_image, status };
      res.status(201).json(newProgram);
    }
  );
});

// Editar programa
router.put('/:id', (req, res) => {
  const { name, description, start_date, end_date, objectives, coordinator_charge, status } = req.body;  // Incluye 'status'
  const programId = req.params.id;

  const query = 'UPDATE programs SET name = ?, description = ?, start_date = ?, end_date = ?, objectives = ?, coordinator_charge = ?, status = ? WHERE id = ?';  // Incluye 'status'
  const params = [name, description, start_date, end_date, objectives, coordinator_charge, status, programId];

  db.query(query, params, (err) => {
    if (err) {
      console.error('Error updating program:', err);
      return res.status(500).json({ message: 'Error al actualizar programa.' });
    }
    res.status(200).json({ message: 'Programa actualizado exitosamente' });
  });
});

// Eliminar programa
router.delete('/:id', (req, res) => {
  const programId = req.params.id;

  db.query('DELETE FROM programs WHERE id = ?', [programId], (err, result) => {
    if (err) {
      console.error('Error deleting program:', err);
      return res.status(500).json({ message: 'Error al eliminar programa.' });
    }
    res.status(200).json({ message: 'Programa eliminado exitosamente' });
  });
});


// Obtener cantidad de participantes para un programa específico
router.get('/beneficiaries/count/:program_id', (req, res) => {
  const programId = req.params.program_id;
  const query = 'SELECT COUNT(*) as count FROM beneficiaries WHERE program_id = ?';

  db.query(query, [programId], (err, results) => {
    if (err) {
      console.error('Error fetching participants:', err);
      return res.status(500).json({ message: 'Error en el servidor.' });
    }
    res.json({ count: results[0].count });
  });
});

// Obtener el total de donaciones para un programa específico
router.get('/expenses/total/:program_id', (req, res) => {
  const programId = req.params.program_id;
  const query = 'SELECT SUM(amount) as total FROM expenses WHERE program_id = ?';

  db.query(query, [programId], (err, results) => {
    if (err) {
      console.error('Error fetching donations:', err);
      return res.status(500).json({ message: 'Error en el servidor.' });
    }
    res.json({ total: results[0].total || 0 }); // Si no hay donaciones, devolver 0
  });
});




module.exports = router;
