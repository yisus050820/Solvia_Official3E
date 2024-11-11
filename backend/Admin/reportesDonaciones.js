const express = require('express');
const router = express.Router();
const db = require('../db'); 

// Ruta para obtener el total de donaciones
router.get('/totalDonaciones', (req, res) => {
  const query = 'SELECT SUM(amount) AS total_donaciones FROM donations';
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching total donations:', err);
      return res.status(500).json({ message: 'Error en el servidor.' });
    }
    res.json(result[0].total_donaciones);
  });
});

// Ruta para obtener los gastos totales
router.get('/totalGastos', (req, res) => {
  const query = 'SELECT SUM(amount) AS total_gastos FROM expenses';
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching total expenses:', err);
      return res.status(500).json({ message: 'Error en el servidor.' });
    }
    res.json(result[0].total_gastos);
  });
});

// Ruta para obtener la distribución de donaciones por donante
router.get('/distribucionDonaciones', (req, res) => {
  const query = `
    SELECT u.name AS donor_name, COALESCE(SUM(d.amount), 0) AS total_donations
    FROM users u
    INNER JOIN donations d ON u.id = d.donor_id
    WHERE u.role = 'donor'
    GROUP BY u.name;
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching donation distribution:', err);
      return res.status(500).json({ message: 'Error en el servidor.' });
    }
    res.json(results);
  });
});

// Ruta para obtener la evolucion de las donaciones
router.get('/evolucionDonaciones', (req, res) => {
    const query = `
      SELECT 
        MONTHNAME(d.date) AS month, 
        SUM(d.amount) AS Donaciones 
      FROM donations d
      GROUP BY month
      ORDER BY MONTH(d.date)
    `;
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching donations evolution:', err);
        return res.status(500).json({ message: 'Error en el servidor.' });
      }
      res.json(results);
    });
  });
  

module.exports = router;
