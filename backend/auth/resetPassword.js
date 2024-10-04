const express = require('express');
const crypto = require('crypto'); // Para generar el token
const nodemailer = require('nodemailer'); // Para enviar el correo electrónico
const bcrypt = require('bcrypt'); // Para encriptar la nueva contraseña
const db = require('../db'); // Tu conexión a la base de datos
const router = express.Router();

// Endpoint para solicitar el restablecimiento de contraseña
router.post('/', (req, res) => {
  const { email } = req.body;

  console.log('Solicitud de restablecimiento recibida para:', email);

  // Verificar si el usuario existe
  const query = 'SELECT id FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error en la base de datos:', err);
      return res.status(500).json({ message: 'Error en el servidor.' });
    }

    if (results.length === 0) {
      console.log('Usuario no encontrado con el correo:', email);
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const userId = results[0].id;

    // Generar un token único
    const token = crypto.randomBytes(20).toString('hex');
    const tokenExpiration = Date.now() + 3600000; // El token expira en 1 hora

    // Guardar el token y la expiración en la base de datos
    const updateQuery = 'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?';
    db.query(updateQuery, [token, tokenExpiration, userId], (err) => {
      if (err) {
        console.error('Error al actualizar el token en la base de datos:', err);
        return res.status(500).json({ message: 'Error en el servidor.' });
      }

      // Configurar el transporte de nodemailer para enviar el correo
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'acabrales@ucol.mx',
          pass: 'mpacclnkcfnsbzqu', // Aquí deberías usar la contraseña de aplicación
        },
      });

      const resetUrl = `http://localhost:5000/resetPassword/${token}`;

      const mailOptions = {
        from: 'acabrales@ucol.mx',
        to: email,
        subject: 'Restablecer Contraseña',
        text: `Recibiste este correo porque solicitaste restablecer tu contraseña. Haz clic en el siguiente enlace para restablecer tu contraseña: \n\n ${resetUrl} \n\nEste enlace es válido por 1 hora. Si no solicitaste este cambio, puedes ignorar este correo.`,
      };

      // Enviar el correo electrónico
      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.error('Error al enviar el correo:', error);
          return res.status(500).json({ message: 'Error al enviar el correo de restablecimiento.' });
        }

        console.log('Correo de restablecimiento enviado a:', email);
        res.status(200).json({ message: 'Correo de restablecimiento enviado. Revisa tu bandeja de entrada.' });
      });
    });
  });
});

// Endpoint GET para manejar la redirección cuando el usuario hace clic en el enlace
router.get('/:token', (req, res) => {
  const { token } = req.params;

  // Verificar si el token es válido y no ha expirado
  const query = 'SELECT id FROM users WHERE reset_password_token = ? AND reset_password_expires > ?';
  db.query(query, [token, Date.now()], (err, results) => {
    if (err) {
      console.error('Error en la base de datos:', err);
      return res.status(500).json({ message: 'Error en el servidor.' });
    }

    if (results.length === 0) {
      console.log('Token inválido o expirado. Token:', token);
      return res.status(400).json({ message: 'Token inválido o expirado.' });
    }

    // Redirigir al frontend para que el usuario ingrese su nueva contraseña
    res.redirect(`http://localhost:3000/resetPassword/${token}`); // Cambia esto a la URL de tu frontend (puerto 3000)
  });
});

// Endpoint POST para restablecer la contraseña
router.post('/reset/:token', (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Verificar si el token es válido y no ha expirado
  const query = 'SELECT id FROM users WHERE reset_password_token = ? AND reset_password_expires > ?';
  db.query(query, [token, Date.now()], (err, results) => {
    if (err) {
      console.error('Error en la base de datos:', err);
      return res.status(500).json({ message: 'Error en el servidor.' });
    }

    if (results.length === 0) {
      console.log('Token inválido o expirado. Token:', token);
      return res.status(400).json({ message: 'Token inválido o expirado.' });
    }

    const userId = results[0].id;

    // Encriptar la nueva contraseña
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Actualizar la contraseña en la base de datos y eliminar el token
    const updateQuery = 'UPDATE users SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?';
    db.query(updateQuery, [hashedPassword, userId], (err) => {
      if (err) {
        console.error('Error al actualizar la contraseña:', err);
        return res.status(500).json({ message: 'Error al actualizar la contraseña.' });
      }

      console.log('Contraseña restablecida con éxito para el usuario ID:', userId);
      res.status(200).json({ message: 'Contraseña restablecida con éxito.' });
    });
  });
});

module.exports = router;
