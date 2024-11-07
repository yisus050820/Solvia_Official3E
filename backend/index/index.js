const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener feedback de usuarios únicos
router.get('/feedback', (req, res) => {
    db.query(`
        SELECT DISTINCT ON (u.id) b.feedback AS comment, b.score AS rating, u.name AS name, u.profile_picture AS image
        FROM beneficiaries b
        JOIN users u ON b.user_id = u.id
        WHERE b.feedback IS NOT NULL AND b.feedback != ''
    `, (err, feedbacks) => {
        if (err) {
            console.error('Error al obtener feedback:', err);
            return res.status(500).json({ error: 'Error al obtener feedback' });
        }
        res.status(200).json(feedbacks);
    });
});

module.exports = router;
