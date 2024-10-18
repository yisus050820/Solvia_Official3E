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
          user: 'solviacorp@gmail.com',
          pass: 'qtqucfzmxnzjpkaj', // Aquí deberías usar la contraseña de aplicación
        },
      });

      const resetUrl = `http://localhost:3000/resetPassword/${token}`;

      const mailOptions = {
        from: 'solviacorp@gmail.com',
        to: email,
        subject: 'Restablecer Contraseña',
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #1c1c1c; color: #e0e0e0; padding: 40px; text-align: center;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #2a2a2a; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);">
            
              <!-- Logo de la empresa -->
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHX-re8lsBW-IfH2tw59fO4W_-v1HrLqfZ-Q&s" alt="Logo" style="border-radius: 50%; width: 100px; height: 100px; object-fit: cover;">
              </div>
            
              <h2 style="color: #f39c12; font-size: 24px; margin-bottom: 20px;">Restablecer tu Contraseña</h2>
              <p style="color: #b0b0b0; font-size: 16px; line-height: 1.6;">Hola,</p>
              <p style="color: #b0b0b0; font-size: 16px; line-height: 1.6;">
                Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el botón a continuación para proceder:
              </p>
              
              <!-- Botón para restablecer la contraseña -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="padding: 15px 30px; background-color: #e74c3c; color: white; text-decoration: none; font-size: 16px; border-radius: 5px; display: inline-block; transition: background-color 0.3s ease;">
                  Restablecer Contraseña
                </a>
              </div>
      
              <p style="color: #999; font-size: 14px;">O copia y pega el siguiente enlace en tu navegador:</p>
              <p style="word-break: break-all; color: #f39c12; font-size: 14px;">${resetUrl}</p>
              
              <p style="color: #999; font-size: 14px; margin-top: 20px;">Este enlace es válido por 1 hora.</p>
              <p style="color: #999; font-size: 14px;">
                Si no solicitaste este cambio, ignora este correo y tu contraseña no se verá afectada.
              </p>
      
              <!-- Firma del equipo -->
              <p style="color: #b0b0b0; margin-top: 30px; font-size: 14px;">Gracias,<br>El equipo de Solvia</p>
            </div>
            
            <!-- Pie de página -->
            <p style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
              © 2024 Solvia Corp. Todos los derechos reservados.
            </p>
          </div>
        `,
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

// Endpoint para restablecer la contraseña
router.post('/reset/:token', (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Verificar si el token es válido y no ha expirado
  const query = 'SELECT id FROM users WHERE reset_password_token = ? AND reset_password_expires > ?';
  db.query(query, [token, Date.now()], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error en el servidor.' });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'Token inválido o expirado.' });
    }

    const userId = results[0].id;

    // Encriptar la nueva contraseña
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Actualizar la contraseña en la base de datos y eliminar el token
    const updateQuery = 'UPDATE users SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?';
    db.query(updateQuery, [hashedPassword, userId], (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error al actualizar la contraseña.' });
      }

      res.status(200).json({ message: 'Contraseña restablecida con éxito.' });
    });
  });
});

// Endpoint GET para manejar la redirección cuando el usuario hace clic en el enlace
router.get('/reset/:token', (req, res) => {
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

module.exports = router;
