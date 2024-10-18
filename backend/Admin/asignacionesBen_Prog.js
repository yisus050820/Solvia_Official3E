const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, param, validationResult } = require('express-validator');

// Función para verificar si ya existe la asignación
const verifyAssignmentExists = (user_id, program_id, exclude_id = null, callback) => {
    let query = 'SELECT COUNT(*) AS count FROM beneficiaries WHERE user_id = ? AND program_id = ?';
    const params = [user_id, program_id];

    // Si es una edición, excluye la asignación actual de la verificación
    if (exclude_id) {
        query += ' AND id != ?';
        params.push(exclude_id);
    }

    db.query(query, params, (err, result) => {
        if (err) return callback(err);
        callback(null, result[0].count > 0);
    });
};

// Obtener todos los usuarios con el rol de beneficiario
router.get('/beneficiarios', (req, res) => {
    const query = `
        SELECT id, name, email 
        FROM users 
        WHERE role = 'beneficiary'
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching beneficiaries:', err);
            return res.status(500).json({ message: 'Error al obtener beneficiarios.' });
        }
        res.json(results);
    });
});

// Obtener todas las asignaciones con su beneficiario y programa asignado
router.get('/asignaciones', (req, res) => {
    const query = `
        SELECT v.id, u.name AS beneficiario, p.name AS programa, v.user_id, v.program_id
        FROM beneficiaries v
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

// Asignar un beneficiario a un programa
router.post('/beneficiarios', [
    body('user_id').isNumeric().withMessage('El ID de usuario debe ser numérico'),
    body('program_id').isNumeric().withMessage('El ID del programa debe ser numérico')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { user_id, program_id } = req.body;

    // Verificar si ya existe una asignación con ese usuario y programa
    verifyAssignmentExists(user_id, program_id, null, (err, exists) => {
        if (err) {
            console.error('Error during verification:', err);
            return res.status(500).json({ message: 'Error al verificar la asignación.' });
        }

        if (exists) {
            return res.status(409).json({ message: 'El beneficiario ya está asignado a este programa.' });
        }

        const insertQuery = `INSERT INTO beneficiaries (user_id, program_id) VALUES (?, ?)`;
        db.query(insertQuery, [user_id, program_id], (err, result) => {
            if (err) {
                console.error('Error assigning beneficiary:', err);
                return res.status(500).json({ message: 'Error al asignar beneficiario.' });
            }
            res.status(201).json({ message: 'Beneficiario asignado con éxito.', data: result.insertId });
        });
    });
});

// Editar datos de una asignación de beneficiario
router.put('/beneficiarios/:id', [
    param('id').isNumeric().withMessage('El ID debe ser numérico'),
    body('user_id').isNumeric().withMessage('El ID de usuario debe ser numérico'),
    body('program_id').isNumeric().withMessage('El ID del programa debe ser numérico')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { user_id, program_id } = req.body;

    // Verificar si ya existe una asignación con ese usuario y programa, excluyendo la asignación actual
    verifyAssignmentExists(user_id, program_id, id, (err, exists) => {
        if (err) {
            console.error('Error during verification:', err);
            return res.status(500).json({ message: 'Error al verificar la asignación.' });
        }

        if (exists) {
            return res.status(409).json({ message: 'El beneficiario ya está asignado a este programa.' });
        }

        const updateQuery = `
            UPDATE beneficiaries
            SET user_id = ?, program_id = ?
            WHERE id = ?
        `;
        
        db.query(updateQuery, [user_id, program_id, id], (err, result) => {
            if (err) {
                console.error('Error updating assignment:', err);
                return res.status(500).json({ message: 'Error al actualizar la asignación.' });
            }

            // Realiza una consulta para devolver los datos actualizados de la asignación
            const selectQuery = `
                SELECT v.id, u.name AS beneficiario, p.name AS programa, v.user_id, v.program_id
                FROM beneficiaries v
                JOIN users u ON v.user_id = u.id
                JOIN programs p ON v.program_id = p.id
                WHERE v.id = ?
            `;

            db.query(selectQuery, [id], (err, updatedResult) => {
                if (err) {
                    console.error('Error fetching updated assignment:', err);
                    return res.status(500).json({ message: 'Error al obtener los datos actualizados.' });
                }

                // Devolver los datos actualizados al cliente
                res.json({
                    message: 'Asignación actualizada con éxito.',
                    updatedData: updatedResult[0]  // Enviamos los datos actualizados
                });
            });
        });
    });
});

// Eliminar una asignación
router.delete('/beneficiarios/:id', [
    param('id').isNumeric().withMessage('El ID debe ser numérico')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const query = `
        DELETE FROM beneficiaries WHERE id = ?
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

// Contar beneficiarios por programa
router.get('/beneficiaries/count/:id', [
    param('id').isNumeric().withMessage('El ID del programa debe ser numérico')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

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
