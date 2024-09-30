const bcrypt = require('bcrypt')
const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los usuarios
router.get('/', (req, res) => {
  const { role } = req.query;
  let query = 'SELECT id, name, email, role, description, profile_picture, DATE_FORMAT(created_at, "%Y-%m-%d") AS created_at FROM users';
  
  if (role) {
    query += ' WHERE role = ?';
  }
  
  db.query(query, role ? [role] : [], (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ message: 'Error en el servidor. Inténtelo más tarde.' });
    }
    res.json(results);
  });
});


// Obtener todos los coordinadores
router.get('/coordinadores', (req, res) => {
  const query = 'SELECT id, name FROM users WHERE role = "coordinator"';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching coordinators:', err);
      return res.status(500).json({ message: 'Error al obtener coordinadores.' });
    }
    res.json(results);
  });
});

// Crear usuario 
router.post('/', (req, res) => {
  const { name, email, password, role, description, profile_picture } = req.body;
  const profilePicture = profile_picture || 'https://via.placeholder.com/150/000000/FFFFFF/?text=Nuevo+Usuario';
  const hashedPassword = bcrypt.hashSync(password, 8);

  db.query(
    'INSERT INTO users (name, email, password, role, profile_picture, description) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, hashedPassword, role, profilePicture, description],
    (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).json({ message: 'Error al añadir usuario. Inténtelo de nuevo.' });
      }
      const newUser = { id: result.insertId, name, email, role, description, profile_picture: profilePicture };
      res.status(201).json(newUser);
    }
  );
});

// Actualizar usuario
router.put('/:id', (req, res) => {
  const { name, email, role, description, password } = req.body;
  const userId = req.params.id;

  let query = 'UPDATE users SET name = ?, email = ?, role = ?, description = ? WHERE id = ?';
  let params = [name, email, role, description, userId];

  if (password && password.length >= 8) {
    const hashedPassword = bcrypt.hashSync(password, 8);
    query = 'UPDATE users SET name = ?, email = ?, role = ?, description = ?, password = ? WHERE id = ?';
    params = [name, email, role, description, hashedPassword, userId];
  }

  db.query(query, params, (err, result) => {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ message: 'Error al actualizar el usuario.' });
    }

    // Consulta para obtener la fecha de creación
    db.query('SELECT id, name, email, role, description, profile_picture, DATE_FORMAT(created_at, "%Y-%m-%d") AS created_at FROM users WHERE id = ?', [userId], (err, updatedResults) => {
      if (err) {
        console.error('Error fetching updated user:', err);
        return res.status(500).json({ message: 'Error al obtener los detalles actualizados del usuario.' });
      }
      res.status(200).json(updatedResults[0]);  // Devuelve el usuario actualizado, incluyendo la fecha de creación
    });
  });
});

// Eliminar usuario
router.delete('/:id', (req, res) => {
  const userId = req.params.id;

  db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ message: 'Error al eliminar el usuario.' });
    }
    res.status(200).json({ message: 'Usuario eliminado exitosamente' });
  });
});

module.exports = router;
