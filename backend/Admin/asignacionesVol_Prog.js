const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, param, validationResult } = require('express-validator');

// Función para verificar si ya existe la asignación
const verifyAssignmentExists = (user_id, program_id, id, callback) => {
    const query = `
        SELECT COUNT(*) AS count 
        FROM volunteers 
        WHERE user_id = ? AND program_id = ? ${id ? 'AND id != ?' : ''}
    `;
    const params = id ? [user_id, program_id, id] : [user_id, program_id];
    db.query(query, params, (err, result) => {
        if (err) return callback(err);
        callback(null, result[0].count > 0);
    });
};

// Obtener todos los usuarios con el rol de voluntario
router.get('/voluntarios', (req, res) => {
    const query = `
        SELECT id, name, email 
        FROM users 
        WHERE role = 'volunteer'
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching volunteers:', err);
            return res.status(500).json({ message: 'Error al obtener voluntarios.' });
        }
        res.json(results);
    });
});

// Obtener todas las asignaciones con su voluntario y programa asignado
router.get('/asignaciones', (req, res) => {
    const query = `
        SELECT v.id, u.name AS voluntario, p.name AS programa, v.task_status, v.user_id, v.program_id
        FROM volunteers v
        JOIN users u ON v.user_id = u.id
        JOIN programs p ON v.program_id = p.id
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching assignments:', err);
            return res.status(500).json({ message: 'Error al obtener asignaciones.' });
        }
        res.json(results);
    });
});

// Asignar un voluntario a un programa (usando el coordinator_charge del programa seleccionado)
router.post('/voluntarios', [
    body('user_id').isNumeric().withMessage('El ID de usuario debe ser numérico'),
    body('program_id').isNumeric().withMessage('El ID del programa debe ser numérico')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { user_id, program_id, task_status } = req.body;

    if (!user_id || !program_id || !task_status) {
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    verifyAssignmentExists(user_id, program_id, null, (err, exists) => {
        if (err) {
            console.error('Error during verification:', err);
            return res.status(500).json({ message: 'Error al verificar la asignación.' });
        }

        if (exists) {
            return res.status(409).json({ message: 'El voluntario ya está asignado a este programa.' });
        }

        const insertQuery = `
            INSERT INTO volunteers (user_id, program_id, task_status)
            VALUES (?, ?, ?)
        `;

        db.query(insertQuery, [user_id, program_id, task_status], (err, result) => {
            if (err) {
                console.error('Error assigning volunteer:', err);
                return res.status(500).json({ message: 'Error al asignar voluntario.' });
            }
            res.status(201).json({ message: 'Voluntario asignado con éxito.', data: result.insertId });
        });
    });
});

// Editar datos de una asignación de voluntario (usando el coordinator_charge del programa seleccionado)
router.put('/voluntarios/:id', [
    param('id').isNumeric().withMessage('El ID debe ser numérico'),
    body('user_id').isNumeric().withMessage('El ID de usuario debe ser numérico'),
    body('program_id').isNumeric().withMessage('El ID del programa debe ser numérico')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { user_id, program_id, task_status } = req.body;

    if (!user_id || !program_id || !task_status) {
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    // Verificar si la asignación ya existe para el usuario y programa, excluyendo la actual asignación
    verifyAssignmentExists(user_id, program_id, id, (err, exists) => {
        if (err) {
            console.error('Error during verification:', err);
            return res.status(500).json({ message: 'Error al verificar la asignación.' });
        }

        if (exists) {
            return res.status(409).json({ message: 'El usuario ya está asignado a este programa.' });
        }

        // Si no existe la asignación, proceder con la actualización
        const updateQuery = `
            UPDATE volunteers
            SET user_id = ?, program_id = ?, task_status = ?
            WHERE id = ?
        `;

        db.query(updateQuery, [user_id, program_id, task_status, id], (err, result) => {
            if (err) {
                console.error('Error updating assignment:', err);
                return res.status(500).json({ message: 'Error al actualizar la asignación.' });
            }

            // Obtener los datos actualizados
            const selectQuery = `
                SELECT v.id, u.name AS voluntario, p.name AS programa, v.task_status AS estado, v.user_id, v.program_id
                FROM volunteers v
                JOIN users u ON v.user_id = u.id
                JOIN programs p ON v.program_id = p.id
                WHERE v.id = ?
            `;

            db.query(selectQuery, [id], (err, updatedResult) => {
                if (err) {
                    console.error('Error fetching updated assignment:', err);
                    return res.status(500).json({ message: 'Error al obtener los datos actualizados.' });
                }

                res.json({
                    message: 'Asignación actualizada con éxito.',
                    updatedData: updatedResult[0]
                });
            });
        });
    });
});

// Eliminar una asignación
router.delete('/voluntarios/:id', [
    param('id').isNumeric().withMessage('El ID debe ser numérico')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    const query = `
        DELETE FROM volunteers WHERE id = ?
    `;

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting assignment:', err);
            return res.status(500).json({ message: 'Error al eliminar la asignación.' });
        }
        res.json({ message: 'Asignación eliminada con éxito.' });
    });
});

// Obtener programas activos
router.get('/programas', (req, res) => {
    const query = `
        SELECT id, name 
        FROM programs 
        WHERE status = 'active'
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching programs:', err);
            return res.status(500).json({ message: 'Error al obtener los programas activos.' });
        }
        res.json(results);
    });
});

router.get('/beneficiaries/count/:id', (req, res) => {
    const programId = req.params.id;
    const query = 'SELECT COUNT(*) AS count FROM beneficiaries WHERE program_id = ?';
    db.query(query, [programId], (err, results) => {
        if (err) {
            console.error('Error fetching beneficiary count:', err);
            return res.status(500).json({ message: 'Error en el servidor.' });
        }
        res.json({ count: results[0].count });
    });
});

module.exports = router;
