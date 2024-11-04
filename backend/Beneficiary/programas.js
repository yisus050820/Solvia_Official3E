const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');

// Middleware para autenticar el token JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, 'yourSecretKey', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user; // Asignar usuario decodificado a req.user
        next();
    });
}

// Obtener programas en los que el usuario está inscrito
router.get('/', authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.query(`
      SELECT p.id, p.name, p.description, p.program_image
      FROM programs p
      JOIN beneficiaries b ON p.id = b.program_id
      WHERE b.user_id = ?
    `, [userId], (err, programs) => {
        if (err) {
            console.error('Error al obtener programas:', err);
            return res.status(500).json({ error: 'Error al obtener programas' });
        }
        res.status(200).json(programs);
    });
});

module.exports = router;
