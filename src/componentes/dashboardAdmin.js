import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { createTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import PersonIcon from '@mui/icons-material/Person';
import People from '@mui/icons-material/People';
import AssignmentInd from '@mui/icons-material/AssignmentInd';
import Paid from '@mui/icons-material/Paid';
import Event from '@mui/icons-material/Event';
import VolunteerActivism from '@mui/icons-material/VolunteerActivism';
import EmojiPeople from '@mui/icons-material/EmojiPeople';
import AttachMoney from '@mui/icons-material/AttachMoney';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount'
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import MessageIcon from '@mui/icons-material/Message';
import { Feedback } from '@mui/icons-material';

// Importaciones de los formularios hijos
import ProgramasCrud from './componentesAdmin/ProgramasCrud';
import ReportesDonaciones from './componentesAdmin/ReportesDonaciones';
import ReportesProgramasAyuda from './componentesAdmin/ReportesProgramasAyuda';
import ReportesUsuarios from './componentesAdmin/ReportesUsuarios';
import TarjetasProgramas from './componentesAdmin/TarjetasProgramas';
import UsuariosCrud from './componentesAdmin/UsuariosCrud';
import AsignacionesBen_Pro from './componentesAdmin/AsignacionesBen_Pro';
import AsignacionesVol_Pro from './componentesAdmin/AsignacionesVol_Pro';
import AsignacionPresupuesto_Pro from './componentesAdmin/AsignacionesPresupuesto_Pro';
import PerfilUsuario from './componentesAdmin/ConfigDePerfil';
import Comunicacion from './componentesAdmin/Comunicacion';
import VerFeedback from './componentesAdmin/VerFeedback';


const NAVIGATION = [
  {
    kind: 'header',
    title: 'Opciones',
  },
  {
    segment: 'configuracion-perfil',
    title: 'Mi perfil',
    icon: <DashboardIcon />,
  },
  {
    segment: 'users',
    title: 'Usuarios',
    icon: <People />,
  },
  {
    segment: 'programas',
    title: 'Programas',
    icon: <Event />,
  },  
  
  {
    segment: 'reportes',
    title: 'Reportes',
    icon: <BarChartIcon />,
    children: [
        {
          segment: 'usuarios',
          title: 'Usuarios',
          icon: <PersonIcon />,
        },
        {
          segment: 'donaciones',
          title: 'Donaciones',
          icon: <Paid />,
        },
        {
          segment: 'programas',
          title: 'Programas',
          icon: <Event />,
        },
      
      ],
  },
  {
    segment: 'asignaciones',
    title: 'Asignaciones',
    icon: <AssignmentInd />,
    children: [
        {
          segment: 'beneficiario-programa',
          title: 'Beneficiario/Programa',
          icon: <VolunteerActivism />,
        },
        {
          segment: 'voluntarios-programas',
          title: 'Voluntarios/Programas',
          icon: <EmojiPeople />,
        },
        {
          segment: 'presupuesto-programa',
          title: 'Presupuesto/Programa',
          icon: <AttachMoney />,
        },
      
      ],
  },
  {
    segment: 'comunicacion',
    title: 'Comunicacion',
    icon: <ChatBubbleIcon />,
    children: [

      {
        segment: 'contacto',
        title: 'Contactar con un usuario',
        icon: <MessageIcon />,
      },
      {
        segment: 'ver-feedback',
        title: 'Ver feedback de programas',
        icon: <Feedback />,
      },
    ],
  },
    
];

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function DemoPageContent({ pathname }) {
  return (
    <Box
      sx={{
        py: 4,
        px: 6, // Ajustamos el padding horizontal
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start', // Aseguramos que los items estén hacia el inicio
        alignItems: 'flex-start', // Los alineamos a la izquierda
        textAlign: 'left', // El texto alineado a la izquierda
        width: '100%', // Aseguramos que ocupe todo el ancho disponible
      }}
    >
      {pathname === '/users' && <UsuariosCrud />}
      {pathname === '/programas' && <ProgramasCrud />}
      {pathname === '/reportes/usuarios' && <ReportesUsuarios />}
      {pathname === '/reportes/donaciones' && <ReportesDonaciones />}
      {pathname === '/reportes/programas' && <ReportesProgramasAyuda />}
      {pathname === '/asignaciones/beneficiario-programa' && <AsignacionesBen_Pro />}
      {pathname === '/asignaciones/voluntarios-programas' && <AsignacionesVol_Pro />}
      {pathname === '/asignaciones/presupuesto-programa' && <AsignacionPresupuesto_Pro />}
      {pathname === '/configuracion-perfil' && <PerfilUsuario />}   
      {pathname === '/comunicacion/contacto' && <Comunicacion />}
      {pathname === '/comunicacion/ver-feedback' && <VerFeedback />}
    </Box>
  );
}



DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

function DashboardLayoutBasic(props) {
  const { window } = props;

  const [pathname, setPathname] = React.useState('/configuracion-perfil');

  const router = React.useMemo(() => {
    return {
      pathname,
      searchParams: new URLSearchParams(),
      navigate: (path) => setPathname(String(path)),
    };
  }, [pathname]);

  // Remove this const when copying and pasting into your project.
  const demoWindow = window !== undefined ? window() : undefined;

  return (
    // preview-start
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout>
        <DemoPageContent pathname={pathname} />
      </DashboardLayout>
    </AppProvider>
    // preview-end
  );
}

DashboardLayoutBasic.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window: PropTypes.func,
};

export default DashboardLayoutBasic;