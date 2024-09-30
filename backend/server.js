const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(express.json());

app.use(bodyParser.json());

// Importar las rutas y la conexión a la base de datos
const userRoutes = require('./Admin/usuarios');
const programRoutes = require('./Admin/programas');
const registerRoute = require('./auth/register');
const loginRoute = require('./auth/login');
const programReportsRoutes = require('./Admin/reportesProgramas')
const donationsReportsRoutes = require('./Admin/reportesDonaciones')
const usersReporsRoutes = require('./Admin/reportesUsuarios')

// Usar las rutas
app.use('/usuarios', userRoutes);
app.use('/programas', programRoutes);
app.use('/register', registerRoute);
app.use('/login', loginRoute);
app.use('/programReports', programReportsRoutes);
app.use('/donationsReports', donationsReportsRoutes);
app.use('/userReports', usersReporsRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
