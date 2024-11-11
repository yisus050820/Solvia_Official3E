const express = require('express'); 
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');  
const http = require('http');

const app = express();

// Configurar body-parser con límite de tamaño
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true
}));

app.use(express.json());

// Importar las rutas
const userRoutes = require('./Admin/usuarios');
const programRoutes = require('./Admin/programas');
const registerRoute = require('./auth/register');
const loginRoute = require('./auth/login');
const resetPasswordRoute = require('./auth/resetPassword');
const programReportsRoutes = require('./Admin/reportesProgramas');
const donationsReportsRoutes = require('./Admin/reportesDonaciones');
const usersReporsRoutes = require('./Admin/reportesUsuarios');
const asigBenProgRoutes = require('./Admin/asignacionesBen_Prog');
const asigPresProgRoutes = require('./Admin/aignacionesPresupuesto_Prog');
const asigVolProgRoutes = require('./Admin/asignacionesVol_Prog');
const perfilRoutes = require('./Admin/perfil');
const programsRoutes = require('./Coordi/programs');
const feedbackRoutes = require('./Beneficiary/feedback');
const taskVolRoutes = require('./Volunteer/task');
const taskBenRoutes = require('./Beneficiary/tasks');
const donarRoutes = require('./Donor/donar');
const feedRoutes = require('./index/feed')

// Usar las rutas
app.use('/usuarios', userRoutes);
app.use('/programas', programRoutes);
app.use('/register', registerRoute);
app.use('/login', loginRoute);
app.use('/resetPassword', resetPasswordRoute);
app.use('/programReports', programReportsRoutes);
app.use('/donationsReports', donationsReportsRoutes);
app.use('/userReports', usersReporsRoutes);
app.use('/asigBenProg', asigBenProgRoutes);
app.use('/asigPresProg', asigPresProgRoutes);
app.use('/asigVolProg', asigVolProgRoutes);
app.use('/perfil', perfilRoutes);
app.use('/programs', programsRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/taskVol', taskVolRoutes);
app.use('/task', taskBenRoutes);
app.use('/donar', donarRoutes);
app.use('/feed', feedRoutes)



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const server = http.createServer(app);

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
