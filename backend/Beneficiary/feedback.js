const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');
const path = require('path');

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

// Obtener programas en los que el usuario está inscrito junto con el feedback
router.get('/programas', authenticateToken, (req, res) => {
    const userId = req.user.id;

    const query = `
        SELECT DISTINCT p.*, b.feedback, b.score
        FROM programs p
        JOIN beneficiaries b ON p.id = b.program_id
        WHERE b.user_id = ?
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching programs with feedback:', err);
            return res.status(500).json({ message: 'Error en el servidor. Inténtelo más tarde.' });
        }
        res.json(results);
    });
});

// Obtener feedback para un programa específico
router.get('/:programId/feed', (req, res) => {
    const { programId } = req.params;
    
    db.query(`
        SELECT b.feedback AS message, b.score AS rating, u.name AS username
        FROM beneficiaries b
        JOIN users u ON b.user_id = u.id
        WHERE b.program_id = ? AND b.feedback IS NOT NULL AND b.feedback != ''
    `, [programId], (err, feedbacks) => {
        if (err) {
            console.error('Error al obtener feedback:', err);
            return res.status(500).json({ error: 'Error al obtener feedback' });
        }
        res.status(200).json(feedbacks);
    });
});

// Crear o actualizar feedback para un programa específico
router.put('/:programId', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { programId } = req.params;
    const { feedback, score } = req.body;

    if (score < 0 || score > 5) {
        return res.status(400).json({ error: 'La calificación debe ser entre 0 y 5' });
    }

    db.query(`
      SELECT * FROM beneficiaries WHERE user_id = ? AND program_id = ?
    `, [userId, programId], (err, results) => {
        if (err) {
            console.error('Error al verificar feedback existente:', err);
            return res.status(500).json({ error: 'Error en el servidor al verificar feedback' });
        }

        if (results.length > 0) {
            // Actualizar el feedback y score
            db.query(`
              UPDATE beneficiaries
              SET feedback = ?, score = ?
              WHERE user_id = ? AND program_id = ?
            `, [feedback, score, userId, programId], (updateErr) => {
                if (updateErr) {
                    console.error('Error al actualizar feedback:', updateErr);
                    return res.status(500).json({ error: 'Error en el servidor al actualizar feedback' });
                }
                res.status(200).json({ message: 'Feedback actualizado correctamente' });
            });
        } else {
            res.status(404).json({ message: 'No existe una asignación para este usuario y programa.' });
        }
    });
});

// Eliminar comentario
router.delete('/:programId', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { programId } = req.params;

    db.query(`
      UPDATE beneficiaries
      SET feedback = NULL, score = NULL
      WHERE user_id = ? AND program_id = ?
    `, [userId, programId], (err, result) => {
        if (err) {
            console.error('Error al eliminar el feedback:', err);
            return res.status(500).json({ message: 'Error al eliminar el feedback.' });
        }
        res.status(200).json({ message: 'Feedback eliminado exitosamente' });
    });
});

module.exports = router;
