const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener la cantidad total de programas
router.get('/totalProgramas', (req, res) => {
  const query = "SELECT COUNT(*) as total FROM programs WHERE status = 'active'";
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching total programs:', err);
      return res.status(500).json({ message: 'Error en el servidor.' });
    }
    res.json(results[0].total);
  });
});

// Obtener el total de beneficiarios (filtrado por rol 'beneficiary' en la tabla `users`)
router.get('/totalBeneficiarios', (req, res) => {
  const query = "SELECT COUNT(*) as total FROM beneficiaries";
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching total beneficiaries:', err);
      return res.status(500).json({ message: 'Error en el servidor.' });
    }
    res.json(results[0].total);
  });
});

// Obtener el total de voluntarios (filtrado por rol 'volunteer' en la tabla `users`)
router.get('/totalVoluntarios', (req, res) => {
  const query = "SELECT COUNT(*) as total FROM volunteers";
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching total volunteers:', err);
      return res.status(500).json({ message: 'Error en el servidor.' });
    }
    res.json(results[0].total);
  });
});

// Obtener crecimiento de programas a lo largo del tiempo (basado en la fecha de creación)
router.get('/crecimientoProgramas', (req, res) => {
  const query = `
    SELECT MONTHNAME(start_date) AS month, COUNT(id) AS program_count
    FROM programs
    GROUP BY MONTH(start_date)
    ORDER BY MONTH(start_date);
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching program growth:', err);
      return res.status(500).json({ message: 'Error fetching data.' });
    }
    res.json(results);
  });
});

module.exports = router;


// Obtener total de donaciones recaudadas agrupadas por mes
router.get('/totalDonaciones', (req, res) => {
  const query = `
    SELECT DATE_FORMAT(date, '%M') as month, SUM(amount) as total
    FROM donations
    GROUP BY month
    ORDER BY date ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching total donations:', err);
      return res.status(500).json({ message: 'Error en el servidor.' });
    }
    res.json(results);
  });
});

// Obtener la cantidad de beneficiarios por programa
router.get('/beneficiariosPorPrograma', (req, res) => {
  const query = `
    SELECT p.name AS program_name, COUNT(b.id) AS total_beneficiaries
    FROM beneficiaries b
    JOIN programs p ON b.program_id = p.id
    GROUP BY b.program_id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching beneficiaries by program:', err);
      return res.status(500).json({ message: 'Error en el servidor.' });
    }
    res.json(results);
  });
});

module.exports = router;
