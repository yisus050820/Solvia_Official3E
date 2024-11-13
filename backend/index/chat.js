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

// Obtener mensajes separados para el usuario logueado y otros usuarios
router.get('/', authenticateToken, (req, res) => {
    const userId = req.user.id;

    const query = `
        SELECT c.id, c.message, c.sent_at AS timestamp, u.id AS user_id, u.name AS user, u.profile_picture AS avatar
        FROM communications c
        JOIN users u ON c.sender_id = u.id
        ORDER BY c.sent_at ASC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener mensajes:', err);
            return res.status(500).json({ message: 'Error en el servidor. Inténtelo más tarde.' });
        }
        
        // Ajustar el formato de la respuesta para incluir user_id del usuario logueado
        const formattedResults = results.map((message) => ({
            ...message,
            timestamp: new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));

        res.json({
            user_id: userId, // Incluir el user_id del usuario logueado
            messages: formattedResults
        });
    });
});

// Mandar mensaje
router.post('/', authenticateToken, (req, res) => {
    const sender_id = req.user.id;
    const { message } = req.body;

    if (!message || message.trim() === '') {
        return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
    }

    const query = `
        INSERT INTO communications (sender_id, message, sent_at)
        VALUES (?, ?, NOW())
    `;

    db.query(query, [sender_id, message], (err, result) => {
        if (err) {
            console.error('Error al enviar mensaje:', err);
            return res.status(500).json({ message: 'Error en el servidor al enviar mensaje.' });
        }

        // Obtener el mensaje recién insertado para devolverlo al frontend
        const newMessageQuery = `
            SELECT c.id, c.message, c.sent_at AS timestamp, u.id AS user_id, u.name AS user, u.profile_picture AS avatar
            FROM communications c
            JOIN users u ON c.sender_id = u.id
            WHERE c.id = ?
        `;

        db.query(newMessageQuery, [result.insertId], (error, messageResult) => {
            if (error) {
                console.error('Error al obtener el mensaje recién enviado:', error);
                return res.status(500).json({ message: 'Error en el servidor al obtener el mensaje.' });
            }
            const messageData = messageResult[0];
            messageData.timestamp = new Date(messageData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            res.status(201).json(messageData);
        });
    });
});

module.exports = router;