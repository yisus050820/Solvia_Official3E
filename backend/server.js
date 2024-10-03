const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');  // Ya está agregada

const app = express();

// Configurar body-parser con límite de tamaño
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(cors());
app.use(express.json()); // Esta línea ya es suficiente para manejar JSON en las solicitudes

// Importar las rutas
const userRoutes = require('./Admin/usuarios');
const programRoutes = require('./Admin/programas');
const registerRoute = require('./auth/register');
const loginRoute = require('./auth/login');
const resetPasswordRoute = require('./auth/resetPassword'); // Importar la nueva ruta de restablecimiento de contraseña
const programReportsRoutes = require('./Admin/reportesProgramas');
const donationsReportsRoutes = require('./Admin/reportesDonaciones');
const usersReporsRoutes = require('./Admin/reportesUsuarios');
const asigBenProgRoutes = require('./Admin/asignacionesBen_Prog');
const asigPresProgRoutes = require('./Admin/aignacionesPresupuesto_Prog');
const asigVolProgRoutes = require('./Admin/asignacionesVol_Prog');
const perfilRoutes = require('./Admin/perfil');

// Usar las rutas
app.use('/usuarios', userRoutes);
app.use('/programas', programRoutes);
app.use('/register', registerRoute);
app.use('/login', loginRoute);
app.use('/auth', resetPasswordRoute); // Usar la nueva ruta para reset-password
app.use('/programReports', programReportsRoutes);
app.use('/donationsReports', donationsReportsRoutes);
app.use('/userReports', usersReporsRoutes);
app.use('/asigBenProg', asigBenProgRoutes);
app.use('/asigPresProg', asigPresProgRoutes);
app.use('/asigVolProg', asigVolProgRoutes);
app.use('/perfil', perfilRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
