const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const secretKey = 'yourSecretKey';

function decodeToken(token) {
    try {
        const decoded = jwt.verify(token, secretKey);
        return decoded.id;
    } catch (err) {
        console.error('Error al verificar el token:', err.message);
        return null;
    }
}

router.use((req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const userId = decodeToken(token);
    if (!userId) {
        return res.status(403).json({ message: 'Token no válido' });
    }

    req.userId = userId;
    next();
});

// Obtener programas específicos del usuario
router.get('/programas', (req, res) => {
    const query = `
        SELECT p.*
        FROM programs p
        JOIN volunteers v ON p.id = v.program_id
        WHERE v.user_id = ?
    `;

    db.query(query, [req.userId], (err, results) => {
        if (err) {
            console.error('Error fetching programs:', err);
            return res.status(500).json({ message: 'Error en el servidor. Inténtelo más tarde.' });
        }
        res.json(results);
    });
});

// Obtener todas las tareas para un programa
router.get('/tasks/:programId', (req, res) => {
    const { programId } = req.params;
    const query = `
        SELECT t.id, 
            t.title, 
            t.description, 
            DATE_FORMAT(t.end_date, "%Y-%m-%d") AS end_date, 
            COUNT(CASE WHEN b.task_status = 1 THEN 1 END) AS completed,
            COUNT(b.id) AS total,
            t.image, 
            t.video
        FROM tasks t
        LEFT JOIN beneficiaries b ON b.task_id = t.id
        WHERE t.id_program = ?
        GROUP BY t.id, t.title, t.description, t.end_date, t.image, t.video
    `;

    db.query(query, [programId], (err, results) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            return res.status(500).json({ message: 'Error al obtener tareas.' });
        }
        res.json(results);
    });
});

// Crear una nueva tarea
router.post('/tasks', (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];
    const id_vol = decodeToken(token);
    const { id_program, title, description, end_date, image, video } = req.body;

    const insertTaskQuery = `
        INSERT INTO tasks (id_vol, id_program, title, description, end_date, image, video)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(insertTaskQuery, [id_vol, id_program, title, description, end_date, image, video], (err, result) => {
        if (err) {
            console.error('Error inserting task:', err);
            return res.status(500).json({ message: 'Error al crear la tarea.' });
        }

        const taskId = result.insertId;
        const assignQuery = `
            INSERT INTO beneficiaries (user_id, program_id, task_id, task_status)
            SELECT user_id, program_id, ?, 0 FROM beneficiaries WHERE program_id = ?
        `;

        db.query(assignQuery, [taskId, id_program], (err) => {
            if (err) {
                console.error('Error assigning task to beneficiaries:', err);
                return res.status(500).json({ message: 'Error al asignar la tarea.' });
            }
            res.status(201).json({ message: 'Tarea creada y asignada.', taskId });
        });
    });
});

// Editar una tarea
router.put('/tasks/:taskId', (req, res) => {
    const { taskId } = req.params;
    const { title, description, end_date, image, video } = req.body;

    const selectQuery = `SELECT image, video FROM tasks WHERE id = ?`;

    db.query(selectQuery, [taskId], (err, results) => {
        if (err) {
            console.error('Error fetching current task:', err);
            return res.status(500).json({ message: 'Error al obtener la tarea.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Tarea no encontrada.' });
        }

        const currentTask = results[0];
        const updatedImage = image || currentTask.image;
        const updatedVideo = video || currentTask.video;

        // Ejemplo de la consulta SQL en el backend
        const query = `
        SELECT t.id, 
            t.title, 
            t.description, 
            DATE_FORMAT(t.end_date, "%Y-%m-%d") AS end_date, 
            COUNT(CASE WHEN b.task_status = 1 THEN 1 END) AS completed,
            COUNT(b.id) AS total,
            t.image, 
            t.video
        FROM tasks t
        LEFT JOIN beneficiaries b ON b.task_id = t.id
        WHERE t.id_program = ?
        GROUP BY t.id, t.title, t.description, t.end_date, t.image, t.video
        `;

        db.query(updateQuery, [title, description, end_date, updatedImage, updatedVideo, taskId], (err) => {
            if (err) {
                console.error('Error updating task:', err);
                return res.status(500).json({ message: 'Error al actualizar la tarea.' });
            }
            res.json({ message: 'Tarea actualizada con éxito.' });
        });
    });
});

// Eliminar una tarea
router.delete('/tasks/:taskId', (req, res) => {
    const { taskId } = req.params;
    const query = `DELETE FROM tasks WHERE id = ?`;

    db.query(query, [taskId], (err) => {
        if (err) {
            console.error('Error deleting task:', err);
            return res.status(500).json({ message: 'Error al eliminar la tarea.' });
        }
        res.json({ message: 'Tarea eliminada con éxito.' });
    });
});

module.exports = router;
