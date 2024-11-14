const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const bcrypt = require('bcryptjs');

// Middleware para servir archivos de la carpeta de uploads
router.use('/uploads', express.static(path.join(__dirname, './uploads')));

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

// Configuración de multer para la carga de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Validación de email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Ruta para obtener la información del perfil del usuario autenticado
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;

  const query = 'SELECT id, name, email, DATE_FORMAT(birth_date, "%Y-%m-%d") AS birth_date, role, description, profile_picture FROM users WHERE id = ?';
  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error('Error fetching user profile:', err);
      return res.status(500).json({ message: 'Error al obtener el perfil del usuario.' });
    }
    if (result.length === 0) {
      console.log('Usuario no encontrado.');
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.json(result[0]);
  });
});

// Ruta para actualizar el perfil del usuario autenticado
router.put('/usuarios', authenticateToken, upload.single('profile_picture'), (req, res) => {
  const id = req.user.id;
  const { name, email, birth_date, role, description, password } = req.body;
  
  // Log para verificar los datos recibidos en el cuerpo de la solicitud
  console.log("Datos recibidos en el cuerpo de la solicitud:", req.body);

  // Verifica si se subió un archivo y establece la ruta de `profile_picture`
  const profile_picture = req.file ? `/uploads/${req.file.filename}` : req.body.profile_picture;
  
  // Log para verificar si se subió un archivo y la ruta de la imagen
  console.log("Ruta de la imagen de perfil:", profile_picture);

  // Validación para asegurar que `birth_date` esté en el formato correcto
  let formattedBirthDate = null;
  if (birth_date) {
    formattedBirthDate = new Date(birth_date);
    if (isNaN(formattedBirthDate)) {
      return res.status(400).json({ message: 'Fecha de nacimiento inválida.' });
    }
  }

  let query = 'UPDATE users SET';
  const params = [];
  const updates = [];

  if (name) {
    updates.push(' name = ?');
    params.push(name);
  }
  if (email) {
    updates.push(' email = ?');
    params.push(email);
  }
  if (formattedBirthDate) {
    updates.push(' birth_date = ?');
    params.push(formattedBirthDate);
  }
  if (role) {
    updates.push(' role = ?');
    params.push(role);
  }
  if (description) {
    updates.push(' description = ?');
    params.push(description);
  }
  if (password) {
    updates.push(' password = ?');
    const hashedPassword = bcrypt.hashSync(password, 8);
    params.push(hashedPassword);
  }
  if (profile_picture) {
    updates.push(' profile_picture = ?');
    params.push(profile_picture);
  }

  // Log para ver cómo queda la consulta y sus parámetros antes de ejecutarla
  console.log("Consulta SQL:", query + updates.join(',') + ' WHERE id = ?', params);

  if (updates.length === 0) {
    return res.status(400).json({ message: 'No se proporcionaron campos para actualizar.' });
  }

  query += updates.join(',') + ' WHERE id = ?';
  params.push(id);

  db.query(query, params, (err) => {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ message: 'Error actualizando el usuario.' });
    }

    const selectQuery = 'SELECT id, name, email, DATE_FORMAT(birth_date, "%Y-%m-%d") AS birth_date, role, description, profile_picture FROM users WHERE id = ?';
    db.query(selectQuery, [id], (err, result) => {
      if (err) {
        console.error('Error fetching updated user profile:', err);
        return res.status(500).json({ message: 'Error al obtener el perfil actualizado del usuario.' });
      }

      // Log para verificar los datos que se están devolviendo después de la actualización
      console.log("Datos del usuario actualizados:", result[0]);
      res.json(result[0]);
    });
  });
});

module.exports = router;
