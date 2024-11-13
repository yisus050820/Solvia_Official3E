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

// Obtener donaciones que el usuario ha hecho
router.get('/', authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.query(`
       SELECT id, amount, DATE_FORMAT(date, "%Y-%m-%d") AS date, DATE_FORMAT(date, "%Y-%m-%d %H:%i:%s") AS orden
       FROM donations
       WHERE donor_id = ?
       ORDER BY orden DESC
    `, [userId], (err, programs) => {
        if (err) {
            console.error('Error al obtener donaciones:', err);
            return res.status(500).json({ error: 'Error al obtener donaciones' });
        }
        res.status(200).json(programs);
    });
});

// Insetar las donaciones
router.post('/donante', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { amount } = req.body;

    db.query(
        'INSERT INTO donations (donor_id, amount) VALUES (?, ?)',
        [userId, amount],
        (err, result) => {
            if (err) {
                console.error('Error al crear programa:', err);
                return res.status(500).json({ message: 'Error al crear programa.' });
            }
            res.status(201).json({ message: 'Donación registrada exitosamente', donationId: result.insertId });
        }
    );

});

// Insetar las donaciones
router.post('/usuarios', (req, res) => {
    const { amount } = req.body;

    db.query(
        'INSERT INTO donations (amount) VALUES (?)',
        [userId, amount],
        (err, result) => {
            if (err) {
                console.error('Error al crear programa:', err);
                return res.status(500).json({ message: 'Error al crear programa.' });
            }
            res.status(201).json({ message: 'Donación registrada exitosamente', donationId: result.insertId });
        }
    );

});


module.exports = router;