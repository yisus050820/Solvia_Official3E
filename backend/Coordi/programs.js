const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');
const multer = require('multer');
const path = require('path');

// Middleware para autenticar el token JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // No hay token

  jwt.verify(token, 'yourSecretKey', (err, user) => {
    if (err) return res.sendStatus(403); // Token no válido
    req.user = user;
    next();
  });
}

// Configuración de multer para guardar imágenes en la carpeta uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nombre único para evitar duplicados
    }
});

const upload = multer({ storage: storage });

// Obtener programas
router.get('/', (req, res) => {
  let query = `
      SELECT p.*, 
             u.name AS coordinator_name, 
             (SELECT SUM(e.amount) FROM expenses e WHERE e.program_id = p.id) AS budget
      FROM programs p
      JOIN users u ON p.coordinator_charge = u.id
  `;

  db.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching programs:', err);
          return res.status(500).json({ message: 'Error en el servidor. Inténtelo más tarde.' });
      }
      res.json(results);
  });
});

// Crear programa
router.post('/', authenticateToken, upload.single('program_image'), (req, res) => {
    const { name, description, start_date, end_date, objectives, status = 'active' } = req.body;  
    const coordinator_charge = req.user.id;
    const program_image = req.file ? `/uploads/${req.file.filename}` : null;

    db.query(
        'INSERT INTO programs (name, description, start_date, end_date, objectives, coordinator_charge, program_image, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',  
        [name, description, start_date, end_date, objectives, coordinator_charge, program_image, status],
        (err, result) => {
            if (err) {
                console.error('Error inserting program:', err);
                return res.status(500).json({ message: 'Error al crear programa.' });
            }
            const newProgram = { id: result.insertId, name, description, start_date, end_date, objectives, coordinator_charge, program_image, status };
            res.status(201).json(newProgram);
        }
    );
});

// Editar programa
router.put('/:id', authenticateToken, upload.single('program_image'), (req, res) => {
  // Si ocurre un error al subir la imagen
  if (req.fileValidationError) {
    return res.status(400).json({ message: req.fileValidationError });
  }

  const { name, description, start_date, end_date, objectives, status } = req.body;
  const programId = req.params.id;
  const coordinator_charge = req.user.id;
  
  // Si se sube una nueva imagen, usa la nueva ruta, si no, mantiene la imagen anterior
  const program_image = req.file ? `/uploads/${req.file.filename}` : req.body.program_image;

  const query = `
    UPDATE programs 
    SET name = ?, description = ?, start_date = ?, end_date = ?, objectives = ?, coordinator_charge = ?, program_image = ?, status = ? 
    WHERE id = ?
  `;

  const params = [name, description, start_date, end_date, objectives, coordinator_charge, program_image, status, programId];

  db.query(query, params, (err) => {
    if (err) {
      console.error('Error updating program:', err);
      return res.status(500).json({ message: 'Error al actualizar programa.' });
    }
    res.status(200).json({ message: 'Programa actualizado exitosamente' });
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

router.get('/expenses/total/:id', (req, res) => {
  const programId = req.params.id;
  const query = 'SELECT SUM(amount) AS total FROM expenses WHERE program_id = ?';
  
  db.query(query, [programId], (err, results) => {
    if (err) {
      console.error('Error fetching expenses:', err);
      return res.status(500).json({ message: 'Error en el servidor.' });
    }
    
    const total = results[0].total || 0;

    res.json({ total });
  });
});

module.exports = router;
