const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todas las asignaciones de presupuesto
router.get('/asignaciones', (req, res) => {
  const query = `
    SELECT v.id, p.name AS programa, v.amount AS presupuesto
    FROM expenses v
    JOIN programs p ON v.program_id = p.id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching assignments:', err);
      return res.status(500).json({ message: 'Error al obtener asignaciones.' });
    }
    res.json(results);
  });
});

// Obtener presupuesto disponible
router.get('/disponible', (req, res) => {
  console.log('Llego al back.');
  const query = `
    SELECT 
      (SELECT SUM(amount) FROM donations) - COALESCE((SELECT SUM(amount) FROM expenses), 0) AS dineroDisponible
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching available funds:', err);
      return res.status(500).json({ message: 'Error al obtener el dinero disponible.' });
    }
    
    console.log('Results:', results); // Para depuración
    if (results.length === 0) {
      return res.status(404).json({ message: 'No se encontraron resultados.' });
    }
    
    res.json({ dineroDisponible: results[0].dineroDisponible });
  });
});

/// Asignar presupuesto a un programa
router.post('/asignacion', (req, res) => {
  const { program_id, amount, date } = req.body;

  if (!amount || amount <= 0 || !program_id || !date) {
    return res.status(400).json({ message: 'Todos los campos son requeridos y el presupuesto debe ser mayor a 0.' });
  }

  const checkQuery = `SELECT * FROM expenses WHERE program_id = ?`;

  db.query(checkQuery, [program_id], (err, results) => {
    if (err) {
      console.error('Error checking for existing budget:', err);
      return res.status(500).json({ message: 'Error al comprobar el presupuesto existente.' });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'Este programa ya tiene un presupuesto asignado.' });
    }

    const insertQuery = `
      INSERT INTO expenses (program_id, amount, date)
      VALUES (?, ?, ?)
    `;

    db.query(insertQuery, [program_id, amount, date], (err, result) => {
      if (err) {
        console.error('Error assigning expense:', err);
        return res.status(500).json({ message: 'Error al asignar el gasto.' });
      }
      res.status(201).json({ message: 'Presupuesto asignado con éxito.', data: result.insertId });
    });
  });
});

// Editar asignación de presupuesto
router.put('/asignacion/:id', (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  const updateQuery = `
    UPDATE expenses
    SET amount = ?
    WHERE id = ?
  `;

  db.query(updateQuery, [amount, id], (err) => {
    if (err) {
      console.error('Error updating assignment:', err);
      return res.status(500).json({ message: 'Error al actualizar la asignación.' });
    }
    res.json({ message: 'Asignación actualizada con éxito.' });
  });
});


// Eliminar asignación de presupuesto
router.delete('/asignacion/:id', (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM expenses WHERE id = ?`;
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting expense:', err);
      return res.status(500).json({ message: 'Error al eliminar el presupuesto.' });
    }
    res.json({ message: 'Asignación eliminada con éxito.' });
  });
});

// Obtener programas activos
router.get('/programas', (req, res) => {
  const query = `SELECT id, name FROM programs WHERE status IN ('active', 'pause')`;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching programs:', err);
      return res.status(500).json({ message: 'Error al obtener los programas activos.' });
    }
    res.json(results);
  });
});

module.exports = router;
