const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

router.post('/', (req, res) => {
  console.log('La info llego al back');
  const { email, password } = req.body;
  console.log(req.body);

  // Verificar si el usuario existe en la base de datos
  const query = 'SELECT id, name, email, password, role FROM users WHERE email = ?';
  
  db.query(query, [email], (err, results) => {

    if (results.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const user = results[0];
    console.log(user.password);

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Contraseña incorrecta.' });
    }

    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ message: 'Error en el servidor.' });
    }

    // Generar el token con el id y rol del usuario
    const token = jwt.sign({ id: user.id, role: user.role }, 'yourSecretKey', { expiresIn: '2h' });

    // Enviar el token y el rol del usuario al frontend
    res.json({ token, role: user.role });
  });
});

module.exports = router;
