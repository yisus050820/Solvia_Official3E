const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Endpoint de registro
router.post('/', upload.single('profile_picture'), (req, res) => {
  const { name, email, password, role, description } = req.body;

  if (!name || !email || !password || !role || !description) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  const hashedPassword = bcrypt.hashSync(password, 8);
  const profilePicture = req.file ? `/uploads/${req.file.filename}` : 'https://via.placeholder.com/150/000000/FFFFFF/?text=Nuevo+Usuario';

  db.query(
    'INSERT INTO users (name, email, password, role, profile_picture, description) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, hashedPassword, role, profilePicture, description],
    (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).json({ message: 'Error al registrar usuario. Inténtelo de nuevo.' });
      }
      res.status(201).json({ message: 'Usuario registrado exitosamente.' });
    }
  );
});

module.exports = router;
