const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const secretKey = 'yourSecretKey'; // Cambiar por process.env.SECRET_KEY en producción

function decodeToken(token) {
    try {
        const decoded = jwt.verify(token, secretKey);
        const userId = decoded.id; // Suponiendo que el token contiene el 'id' del usuario
        console.log('ID del usuario:', userId);
        return userId;
    } catch (err) {
        console.error('Error al verificar el token:', err.message);
        return null;
    }
}

// Obtener programas específicos del usuario
router.get('/:id', authenticateToken, (req, res) => {
    const userId = req.params.id;

    let query = `
        SELECT p.*, u.name AS coordinator_name
        FROM programs p
        JOIN users u ON p.coordinator_charge = u.id
        WHERE p.coordinator_charge = ?
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching programs:', err);
            return res.status(500).json({ message: 'Error en el servidor. Inténtelo más tarde.' });
        }
        res.json(results);
    });
});

// Obtener todas las tareas para un programa
router.get('/tasks/:programId', authenticateToken, (req, res) => {
    const programId = req.params.programId;
    const query = `
        SELECT t.id, t.title, t.description, t.end_date, 
               COUNT(CASE WHEN b.task_status = 1 THEN 1 END) AS completed,
               COUNT(b.id) AS total,
               t.image, t.video
        FROM tasks t
        LEFT JOIN beneficiaries b ON b.task_id = t.id
        WHERE t.id_program = ?
        GROUP BY t.id
    `;

    db.query(query, [programId], (err, results) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            return res.status(500).json({ message: 'Error fetching tasks' });
        }
        res.json(results);
    });
});

// Crear una nueva tarea
router.post('/tasks', authenticateToken, (req, res) => {
    const { id_vol, id_program, title, description, end_date, image, video } = req.body;
    const query = `
        INSERT INTO tasks (id_vol, id_program, title, description, end_date, image, video)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [id_vol, id_program, title, description, end_date, image, video], (err, result) => {
        if (err) {
            console.error('Error inserting task:', err);
            return res.status(500).json({ message: 'Error creating task' });
        }

        // Asignar la tarea a todos los beneficiarios del programa
        const taskId = result.insertId;
        const assignQuery = `
            INSERT INTO beneficiaries (user_id, program_id, task_id, task_status)
            SELECT user_id, program_id, ?, 0 FROM beneficiaries WHERE program_id = ?
        `;

        db.query(assignQuery, [taskId, id_program], (err) => {
            if (err) {
                console.error('Error assigning task to beneficiaries:', err);
                return res.status(500).json({ message: 'Error assigning task' });
            }
            res.status(201).json({ message: 'Task created and assigned', taskId });
        });
    });
});

// Editar una tarea
router.put('/tasks/:taskId', authenticateToken, (req, res) => {
    const taskId = req.params.taskId;
    const { title, description, end_date, image, video } = req.body;
    const query = `
        UPDATE tasks
        SET title = ?, description = ?, end_date = ?, image = ?, video = ?
        WHERE id = ?
    `;

    db.query(query, [title, description, end_date, image, video, taskId], (err) => {
        if (err) {
            console.error('Error updating task:', err);
            return res.status(500).json({ message: 'Error updating task' });
        }
        res.json({ message: 'Task updated successfully' });
    });
});

// Eliminar una tarea
router.delete('/tasks/:taskId', authenticateToken, (req, res) => {
    const taskId = req.params.taskId;
    const query = `
        DELETE FROM tasks WHERE id = ?
    `;

    db.query(query, [taskId], (err) => {
        if (err) {
            console.error('Error deleting task:', err);
            return res.status(500).json({ message: 'Error deleting task' });
        }
        res.json({ message: 'Task deleted successfully' });
    });
});

// Obtener porcentaje de beneficiarios que completaron una tarea
router.get('/tasks/:taskId/completion', authenticateToken, (req, res) => {
    const taskId = req.params.taskId;
    const query = `
        SELECT 
            COUNT(CASE WHEN task_status = 1 THEN 1 END) / COUNT(*) * 100 AS completion_rate
        FROM beneficiaries
        WHERE task_id = ?
    `;

    db.query(query, [taskId], (err, results) => {
        if (err) {
            console.error('Error fetching completion rate:', err);
            return res.status(500).json({ message: 'Error fetching completion rate' });
        }
        res.json(results[0]);
    });
});

module.exports = router;
