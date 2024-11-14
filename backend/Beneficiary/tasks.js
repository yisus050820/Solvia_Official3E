const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const secretKey = 'yourSecretKey';

function decodeToken(token) {
    try {
        const decoded = jwt.verify(token, secretKey);
        const userId = decoded.id; 
        console.log('ID del usuario:', userId);
        return userId;
    } catch (err) {
        console.error('Error al verificar el token:', err.message);
        return null;
    }
}

// Obtener programas específicos del usuario
router.get('/programas', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const userId = decodeToken(token);
    if (!userId) {
        return res.status(403).json({ message: 'Token no válido' });
    }

    const query = `
        SELECT p.*
        FROM programs p
        JOIN beneficiaries v ON p.id = v.program_id
        WHERE v.user_id = ?
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching programs:', err);
            return res.status(500).json({ message: 'Error en el servidor. Inténtelo más tarde.' });
        }
        res.json(results);
    });
});

// Obtener todas las tareas para un programa, incluyendo el estado actual de task_status
router.get('/tasks/:programId', (req, res) => {
    const programId = req.params.programId;
    const token = req.headers['authorization'].split(' ')[1];
    const userId = decodeToken(token);

    if (!userId) {
        return res.status(403).json({ message: 'Token no válido' });
    }

    const query = `
        SELECT t.id, 
            t.title, 
            t.description, 
            DATE_FORMAT(t.end_date, "%Y-%m-%d") AS end_date, 
            t.image, 
            t.video,
            IF(b.task_status = 1, true, false) AS completed
        FROM tasks t
        LEFT JOIN beneficiaries b ON b.task_id = t.id AND b.user_id = ?
        WHERE t.id_program = ?
        GROUP BY t.id, t.title, t.description, t.end_date, t.image, t.video, b.task_status
    `;

    db.query(query, [userId, programId], (err, results) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            return res.status(500).json({ message: 'Error fetching tasks' });
        }
        res.json(results);
    });
});

// Actualizar el estado de una tarea
router.put('/status', (req, res) => {
    const { taskId, status } = req.body;
    const token = req.headers['authorization'].split(' ')[1];
    const userId = decodeToken(token);

    if (!userId) {
        return res.status(403).json({ message: 'Token no válido' });
    }

    const query = `
        UPDATE beneficiaries
        SET task_status = ?
        WHERE task_id = ? AND user_id = ?
    `;

    db.query(query, [status ? 1 : 0, taskId, userId], (err, result) => {
        if (err) {
            console.error('Error updating task status:', err);
            return res.status(500).json({ message: 'Error actualizando el estado de la tarea' });
        }

        if (result.affectedRows === 0) {
            console.log(`No se encontró la tarea con ID ${taskId} para el usuario ${userId}`);
            return res.status(404).json({ message: 'Tarea o usuario no encontrado' });
        }

        res.status(200).json({ message: 'Estado de la tarea actualizado exitosamente' });
    });
});

module.exports = router;
