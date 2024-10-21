const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const bcrypt = require('bcryptjs');


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

// Configuración de multer para cargar imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Función de validación de email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Ruta para obtener la información del perfil del usuario autenticado
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;

  //console.log(`Obteniendo información del perfil del usuario con ID: ${userId}`);

  const query = 'SELECT id, name, email, role, description, profile_picture FROM users WHERE id = ?';
  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error('Error fetching user profile:', err);
      return res.status(500).json({ message: 'Error al obtener el perfil del usuario.' });
    }
    if (result.length === 0) {
      console.log('Usuario no encontrado.');
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    //console.log('Perfil del usuario obtenido correctamente:', result[0]);
    res.json(result[0]);
  });
});

// Ruta para actualizar el perfil del usuario autenticado
router.put('/', authenticateToken, upload.single('profile_picture'), (req, res) => {
  const userId = req.user.id;
  const { name, email, password, description } = req.body;
  const profilePicture = req.file ? `/uploads/${req.file.filename}` : null; // Ajuste aquí

  // Validación de email
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'El formato del correo no es válido.' });
  }

  // Comprobar si el correo ya existe
  const checkEmailQuery = 'SELECT id FROM users WHERE email = ? AND id != ?';
  db.query(checkEmailQuery, [email, userId], (err, results) => {
    if (err) {
      console.error('Error al verificar el correo:', err);
      return res.status(500).json({ message: 'Error al verificar el correo.' });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'El correo ya está en uso.' });
    }

    // Validación de la contraseña
    if (password && password.length < 8) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    let query = 'UPDATE users SET name = ?, email = ?, description = ?';
    const params = [name, email, description];

    if (profilePicture) {
      query += ', profile_picture = ?';
      params.push(profilePicture);
    }

    if (password) {
      const hashedPassword = bcrypt.hashSync(password, 8);
      query += ', password = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(userId);

    db.query(query, params, (err, result) => {
      if (err) {
        console.error('Error actualizando perfil de usuario:', err);
        return res.status(500).json({ message: 'Error al actualizar el perfil.' });
      }

      db.query('SELECT id, name, email, role, description, profile_picture FROM users WHERE id = ?', [userId], (err, updatedResult) => {
        if (err) {
          console.error('Error al obtener el perfil actualizado:', err);
          return res.status(500).json({ message: 'Error al obtener el perfil actualizado.' });
        }
        res.json(updatedResult[0]);
        console.log('Información del perfil actualizado:', updatedResult[0]);
      });
    });
  });
});

module.exports = router;
