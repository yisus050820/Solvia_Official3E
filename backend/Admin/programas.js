const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');

const secretKey = 'yourSecretKey';

function decodeToken(token) {
  try {
    const decoded = jwt.verify(token, secretKey);
    console.log('ID del usuario: ', userId);
    return userId;
  } catch (err) {
    console.error('Error al verificar el token:', err.message);
    return null;
  }
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
router.post('/', upload.single('program_image'), (req, res) => {
  const { name, description, start_date, end_date, objectives, coordinator_charge, status = 'active' } = req.body;  
  const program_image = req.file ? `/uploads/${req.file.filename}` : null; 

  db.query(
    'INSERT INTO programs (name, description, start_date, end_date, objectives, coordinator_charge, program_image, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',  
    [name, description, start_date, end_date, objectives, coordinator_charge, program_image, status],
    (err, result) => {
      if (err) {
        console.error('Error inserting program:', err);
        return res.status(500).json({ message: 'Error al crear programa.' });
      }
      res.status(201).json({ message: 'Programa creado con éxito' });
    }
  );
});

// Editar programa
router.put('/:id', upload.single('program_image'), (req, res) => {
  // Si ocurre un error al subir la imagen
  if (req.fileValidationError) {
    return res.status(400).json({ message: req.fileValidationError });
  }

  const { name, description, start_date, end_date, objectives, coordinator_charge, status } = req.body;
  const programId = req.params.id;
  
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

// Eliminar programa
router.delete('/:id', (req, res) => {
  const programId = req.params.id;

  const checkProgramBeneficiaryQuery = `
  SELECT COUNT(*) as count
  FROM beneficiaries
  WHERE program_id = ?`;

  const checkProgramVolunteersQuery = `
  SELECT COUNT(*) as count
  FROM volunteers
  WHERE program_id = ?`;

  // Verificar beneficiarios primero
  db.query(checkProgramBeneficiaryQuery, [programId], (err, beneficiaryRows) => {
      if (err) {
          console.error('Error checking beneficiaries:', err);
          return res.status(500).json({ message: 'Error al verificar asignación de beneficiarios.' });
      }

      const beneficiaryCount = beneficiaryRows[0].count;

      // Luego verificar voluntarios
      db.query(checkProgramVolunteersQuery, [programId], (err, volunteerRows) => {
          if (err) {
              console.error('Error checking volunteers:', err);
              return res.status(500).json({ message: 'Error al verificar asignación de voluntarios.' });
          }

          const volunteerCount = volunteerRows[0].count;

          // Generar los mensajes de error correspondientes
          if (beneficiaryCount > 0 && volunteerCount > 0) {
              return res.status(400).json({ 
                  message: `No se puede eliminar el programa porque tiene ${beneficiaryCount} beneficiarios y ${volunteerCount} voluntarios asignados.` 
              });
          }

          if (beneficiaryCount > 0) {
              return res.status(400).json({ 
                  message: `No se puede eliminar el programa porque tiene ${beneficiaryCount} beneficiarios asignados.` 
              });
          }

          if (volunteerCount > 0) {
              return res.status(400).json({ 
                  message: `No se puede eliminar el programa porque tiene ${volunteerCount} voluntarios asignados.` 
              });
          }

          // Si no tiene ni beneficiarios ni voluntarios, proceder a eliminar
          db.query('DELETE FROM programs WHERE id = ?', [programId], (err, result) => {
              if (err) {
                  console.error('Error deleting program:', err);
                  return res.status(500).json({ message: 'Error al eliminar el programa.' });
              }
              res.status(200).json({ message: 'Programa eliminado exitosamente' });
          });
      });
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
