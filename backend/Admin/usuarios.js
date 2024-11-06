const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken'); // Importar jsonwebtoken para verificar el token

// Definir la función authenticateToken
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // Si no hay token, retornar 401 (Unauthorized)

  jwt.verify(token, 'yourSecretKey', (err, user) => {
    if (err) return res.sendStatus(403); // Si el token no es válido, retornar 403 (Forbidden)
    req.user = user; // Adjuntar el usuario decodificado al request
    next(); // Continuar al siguiente middleware o ruta
  });
}

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

      const newUserId = result.insertId;
      db.query('SELECT id, name, email, role, description, profile_picture, DATE_FORMAT(created_at, "%Y-%m-%d") AS created_at FROM users WHERE id = ?', [newUserId], (err, newUser) => {
        if (err) {
          console.error('Error fetching newly created user:', err);
          return res.status(500).json({ message: 'Error al recuperar el usuario recién creado.' });
        }

        res.status(201).json(newUser[0]);
    });
  });
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
      res.status(200).json(updatedResults[0]);  
    });
  });
});

//Eliminar usuario si no esta asignado a algo
router.delete('/:id', (req, res) => {
  const userId = req.params.id;

  const checkProgramCoordinatorQuery = `
    SELECT programs.name 
    FROM programs 
    WHERE coordinator_charge = ?`;
  
  const checkBeneficiaryQuery = `
    SELECT programs.name 
    FROM beneficiaries 
    JOIN programs ON beneficiaries.program_id = programs.id 
    WHERE beneficiaries.user_id = ?`; 
  
  const checkVolunteerQuery = `
    SELECT programs.name 
    FROM volunteers 
    JOIN programs ON volunteers.program_id = programs.id 
    WHERE volunteers.user_id = ?`; 

  db.query(checkProgramCoordinatorQuery, [userId], (err, programRows) => {
    if (err) {
      console.error('Error checking programs:', err);
      return res.status(500).json({ message: 'Error al verificar asignación en programas.' });
    }

    if (programRows.length > 0) {
      const programNames = programRows.map(row => row.name).join(', ');
      return res.status(400).json({ message: `No se puede eliminar el usuario porque está asignado como coordinador en los siguientes programas: ${programNames}` });
    }

    db.query(checkBeneficiaryQuery, [userId], (err, beneficiaryRows) => {
      if (err) {
        console.error('Error checking beneficiaries:', err);
        return res.status(500).json({ message: 'Error al verificar asignación como beneficiario.' });
      }

      if (beneficiaryRows.length > 0) {
        const beneficiaryNames = beneficiaryRows.map(row => row.name).join(', ');
        return res.status(400).json({ message: `No se puede eliminar el usuario porque está asignado como beneficiario en los siguientes programas: ${beneficiaryNames}` });
      }

      db.query(checkVolunteerQuery, [userId], (err, volunteerRows) => {
        if (err) {
          console.error('Error checking volunteers:', err);
          return res.status(500).json({ message: 'Error al verificar asignación como voluntario.' });
        }

        if (volunteerRows.length > 0) {
          const volunteerNames = volunteerRows.map(row => row.name).join(', ');
          return res.status(400).json({ message: `No se puede eliminar el usuario porque está asignado como voluntario en los siguientes programas: ${volunteerNames}` });
        }

        // Si no está referenciado en ningún programa, proceder a eliminar
        db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
          if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).json({ message: 'Error al eliminar el usuario.' });
          }
          res.status(200).json({ message: 'Usuario eliminado exitosamente' });
        });
      });
    });
  });
});

// Ruta protegida para editar el perfil del usuario actual
router.put('/user', authenticateToken, async (req, res) => {
  const { name, email, role, profile_picture, description } = req.body;
  const userId = req.user.id; // Obtener el ID del usuario del token

  let query = 'UPDATE users SET name = ?, email = ?, role = ?, profile_picture = ?, description = ? WHERE id = ?';
  let params = [name, email, role, profile_picture, description, userId];

  db.query(query, params, (err, result) => {
    if (err) {
      console.error('Error updating user profile:', err);
      return res.status(500).json({ message: 'Error al actualizar la información del usuario.' });
    }

    // Obtener los datos actualizados del usuario
    db.query('SELECT id, name, email, role, profile_picture, description FROM users WHERE id = ?', [userId], (err, updatedUser) => {
      if (err) {
        console.error('Error fetching updated user:', err);
        return res.status(500).json({ message: 'Error al obtener los detalles actualizados del usuario.' });
      }
      res.status(200).json({ message: 'Información del usuario actualizada', user: updatedUser[0] });
    });
  });
});

module.exports = router;
