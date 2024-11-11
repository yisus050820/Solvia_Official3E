const express = require('express');
const router = express.Router();
const db = require('../db');

// Ruta para obtener el total de usuarios
router.get('/totalUsuarios', (req, res) => {
    const query = 'SELECT COUNT(*) AS total FROM users';
    db.query(query, (err, result) => {
        if (err) {
            console.error('Error fetching total users:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }
        res.json({ total: result[0].total });
    });
});

// Ruta para obtener la distribución de usuarios por rol
router.get('/usuariosPorRoles', (req, res) => {
    const query = `
        SELECT 
            CASE 
                WHEN role = 'admin' THEN 'Administrador'
                WHEN role = 'coordinator' THEN 'Coordinador'
                WHEN role = 'volunteer' THEN 'Voluntario'
                WHEN role = 'beneficiary' THEN 'Beneficiario'
                WHEN role = 'donor' THEN 'Donante'
                ELSE role
            END AS name, 
            COUNT(*) AS value
        FROM users
        GROUP BY role
    `;
    db.query(query, (err, result) => {
        if (err) {
            console.error('Error fetching users distribution:', err);
            return res.status(500).json({ message: 'Error en el servidor.' });
        }
        res.json(result);
    });
});

// Ruta para obtener nuevos usuarios en la última semana
router.get('/nuevosUsuarios', (req, res) => {
    const query = `
        SELECT COUNT(*) AS nuevosUsuarios
        FROM users
        WHERE created_at >= CURDATE() - INTERVAL 7 DAY
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error en /nuevosUsuarios:', err.message);
            return res.status(500).json({ message: 'Error en el servidor' });
        }
        res.json(results[0].nuevosUsuarios);
    });
});

// Ruta para obtener el crecimiento de usuarios a lo largo del tiempo
router.get('/crecimientoUsuarios', (req, res) => {
    const query = `
        SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS Usuarios
        FROM users
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY MIN(created_at)
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error en /crecimientoUsuarios:', err.message);
            return res.status(500).json({ error: 'Error al obtener el crecimiento de usuarios' });
        }
        res.json(results);
    });
});


module.exports = router;
