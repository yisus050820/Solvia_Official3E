const mysql = require('mysql');

// Opciones de configuración para la conexión MySQL
const db_config = {
  host: 'bzpptqeoux1gmgpq7htr-mysql.services.clever-cloud.com',
  user: 'un9cmicovuufs4ab',
  password: 'kDHdJxIMfn34jNeUllfD',
  database: 'bzpptqeoux1gmgpq7htr'
};

let connection;

function handleDisconnect() {
  connection = mysql.createConnection(db_config); // Re-establece la conexión a la base de datos

  connection.connect((err) => {
    if (err) {
      console.error('Error al conectarse a la base de datos:', err);
      setTimeout(handleDisconnect, 2000); // Si hay error, vuelve a intentar la conexión después de 2 segundos
    } else {
      console.log('Conectado a la base de datos MySQL.');
    }
  });

  // Maneja el evento 'error' de la conexión
  connection.on('error', (err) => {
    console.error('Error en la conexión a MySQL:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect(); // Reconecta cuando la conexión se pierde
    } else {
      throw err; // Si es un error diferente, lanza el error
    }
  });
}

handleDisconnect();

module.exports = connection;
