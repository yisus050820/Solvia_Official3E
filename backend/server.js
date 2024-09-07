const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); 

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de la base de nuestra data base
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'solvia'
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});

// Configuración de Multer para la carga de imágenes
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

app.post('/register', upload.single('profile_picture'), (req, res) => {
  const { name, email, password, role, description } = req.body;

  // Validación de campos requeridos
  if (!name || !email || !password || !role || !description) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  // Verifica si el usuario ya existe
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ message: 'Error en el servidor. Inténtelo más tarde.' });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: 'Correo ya registrado' });
    }

    const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;

    if (!profilePicture) {
      return res.status(400).json({ message: 'La imagen de perfil es obligatoria.' });
    }

    // Hash de la contraseña
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Insertar el nuevo usuario en la base de datos
    db.query(
      'INSERT INTO users (name, email, password, role, profile_picture, description) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, profilePicture, description],
      (err, result) => {
        if (err) {
          console.error('Error inserting user:', err);
          return res.status(500).json({ message: 'Error al registrar usuario. Inténtelo de nuevo.' });
        }
        res.status(201).json({ message: 'Usuario registrado exitosamente' });
      }
    );
  });
});


// Ruta para iniciar sesión
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Verificar si el usuario existe
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ message: 'Error en el servidor. Inténtelo más tarde.' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Correo no encontrado' });
    }

    const user = results[0];

    // Verificar la contraseña
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Generar un token JWT
    const token = jwt.sign({ id: user.id, role: user.role }, 'your_secret_key', {
      expiresIn: '1h'
    });

    res.status(200).json({ message: 'Inicio de sesión exitoso', token });
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
