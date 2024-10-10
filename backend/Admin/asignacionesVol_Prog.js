const express = require('express');
const router = express.Router();
const db = require('../db');

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
        SELECT v.id, u.name AS voluntario, p.name AS programa, v.task_status, v.coordinator_id, v.user_id, v.program_id
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
router.post('/voluntarios', (req, res) => {
    console.log(req.body); // Verifica los datos recibidos desde el frontend
    const { user_id, program_id, task_status } = req.body;

    if (!user_id || !program_id || !task_status) {
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    // Buscar el coordinator_charge del programa seleccionado
    const coordinatorQuery = `
        SELECT coordinator_charge 
        FROM programs 
        WHERE id = ?
    `;

    db.query(coordinatorQuery, [program_id], (err, result) => {
        if (err) {
            console.error('Error fetching coordinator charge:', err);
            return res.status(500).json({ message: 'Error al obtener el coordinador.' });
        }

        const coordinator_id = result[0]?.coordinator_charge;

        if (!coordinator_id) {
            return res.status(400).json({ message: 'No se encontró un coordinador para el programa seleccionado.' });
        }

        // Insertar la asignación usando el coordinator_charge del programa
        const insertQuery = `
            INSERT INTO volunteers (user_id, program_id, task_status, coordinator_id)
            VALUES (?, ?, ?, ?)
        `;

        db.query(insertQuery, [user_id, program_id, task_status, coordinator_id], (err, result) => {
            if (err) {
                console.error('Error assigning volunteer:', err);
                return res.status(500).json({ message: 'Error al asignar voluntario.' });
            }
            res.status(201).json({ message: 'Voluntario asignado con éxito.', data: result.insertId });
        });
    });
});

// Editar datos de una asignación de voluntario (usando el coordinator_charge del programa seleccionado)
router.put('/voluntarios/:id', (req, res) => {
    const { id } = req.params;
    const { user_id, program_id, task_status } = req.body;

    if (!user_id || !program_id || !task_status) {
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    // Buscar el coordinator_charge del programa seleccionado
    const coordinatorQuery = `
        SELECT coordinator_charge 
        FROM programs 
        WHERE id = ?
    `;

    db.query(coordinatorQuery, [program_id], (err, result) => {
        if (err) {
            console.error('Error fetching coordinator charge:', err);
            return res.status(500).json({ message: 'Error al obtener el coordinador.' });
        }

        const coordinator_id = result[0]?.coordinator_charge;

        if (!coordinator_id) {
            return res.status(400).json({ message: 'No se encontró un coordinador para el programa seleccionado.' });
        }

        // Actualizar la asignación usando el coordinator_charge del programa
        const updateQuery = `
            UPDATE volunteers
            SET user_id = ?, program_id = ?, task_status = ?, coordinator_id = ?
            WHERE id = ?
        `;

        db.query(updateQuery, [user_id, program_id, task_status, coordinator_id, id], (err, result) => {
            if (err) {
                console.error('Error updating assignment:', err);
                return res.status(500).json({ message: 'Error al actualizar la asignación.' });
            }
            res.json({ message: 'Datos del voluntario actualizados con éxito.' });
        });
    });
});

// Eliminar una asignación
router.delete('/voluntarios/:id', (req, res) => {
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
