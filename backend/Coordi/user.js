const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken'); // Importar jsonwebtoken para verificar el token

// Definir la función authenticateToken
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // Si no hay token, retornar 401 (Unauthorized)

  jwt.verify(token, 'yourSecretKey', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = { id: user.id, role: user.role }; // Adjuntar id y rol
    next();
  });
}

// Obtener todos los usuarios
router.get('/', (req, res) => {
  const { role } = req.query;
  let query = 'SELECT id, name, email, DATE_FORMAT(birth_date, "%Y-%m-%d") AS birth_date , role, description, profile_picture, DATE_FORMAT(created_at, "%Y-%m-%d") AS created_at FROM users';

  if (role) {
    query += ' WHERE role = ?';
  }

  db.query(query, role ? [role] : [], (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ message: 'Error en el servidor. Inténtelo más tarde.' });
    }
    res.json(results);
  });
});

// Obtener todos los coordinadores
router.get('/coordinadores', (req, res) => {
  const query = 'SELECT id, name FROM users WHERE role = "coordinator"';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching coordinators:', err);
      return res.status(500).json({ message: 'Error al obtener coordinadores.' });
    }
    res.json(results);
  });
});

// Obtener programas inscritos para todos los usuarios
router.get('/asignaciones', authenticateToken, (req, res) => {
  const query = `
    SELECT 
      u.id AS user_id,
      u.name AS user_name,
      u.role AS user_role,
      p.id AS program_id,
      p.name AS program_name
    FROM users u
    LEFT JOIN volunteers v ON u.id = v.user_id
    LEFT JOIN beneficiaries b ON u.id = b.user_id
    LEFT JOIN programs p
      ON (v.program_id = p.id OR b.program_id = p.id OR p.coordinator_charge = u.id)
    WHERE u.role IN ('volunteer', 'beneficiary', 'coordinator')
    ORDER BY u.id, p.id`;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching enrolled programs for all users:', err);
      return res.status(500).json({ message: 'Error al obtener programas inscritos.' });
    }

    const asignaciones = results.reduce((acc, row) => {
      if (!acc[row.user_id]) {
        acc[row.user_id] = {
          user_name: row.user_name,
          user_role: row.user_role,
          programas: [],
        };
      }
      if (row.program_id && row.program_name) {
        acc[row.user_id].programas.push({
          program_id: row.program_id,
          program_name: row.program_name,
        });
      }
      return acc;
    }, {});

    res.json(asignaciones);
  });
});

module.exports = router;
