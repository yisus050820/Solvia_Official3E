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
import MessageIcon from '@mui/icons-material/Message';
import { Feedback } from '@mui/icons-material';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { Avatar } from '@mui/material';



import PerfilUsuario from './componentesAdmin/ConfigDePerfil';
import CrudPrograms from './componentesCoordi/ProgramasCrud';
import ReportesUsuarios from './componentesAdmin/ReportesUsuarios';
import ReportesDonaciones from './componentesAdmin/ReportesDonaciones';
import ReportesProgramasAyuda from './componentesAdmin/ReportesProgramasAyuda';
import AsignacionesBen_Pro from './componentesAdmin/AsignacionesBen_Pro';
import AsignacionesVol_Pro from './componentesAdmin/AsignacionesVol_Pro';
import AsignacionesPresupuesto_Pro from './componentesAdmin/AsignacionesPresupuesto_Pro';
import CrudUsuariosCoordi from './componentesCoordi/Usuarios';
import Comunicacion from './componentesAdmin/Comunicacion';
import VerFeedback from './componentesAdmin/VerFeedback';
import ChatGlobal from './ChatGlobal';
import CerrarSesion from './logout';

const NAVIGATION = [

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
        title: 'Mensajería',
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
  palette: {
    primary: {
      main: '#383D3B', // Color principal oscuro
    },
    secondary: {
      main: '#92DCE5', // Color secundario
    },
    background: {
      default: '#EEE5E9', // Fondo principal claro
      paper: '#7C7C7C',   // Fondo de componentes
    },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#2B4A48', // Color de la barra lateral
          color: '#EEE5E9',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#2B4A48', // Color de la barra superior
          color: '#EEE5E9', // Color del texto en la barra superior
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: '#92DCE5', // Color de fondo cuando está seleccionado
            color: '#2B4A48', // Color del texto cuando está seleccionado
            '&:hover': {
              backgroundColor: '#81C7CE', // Color al pasar el cursor sobre el seleccionado
            },
          },
          '&:hover': {
            backgroundColor: '#607D8B', // Color al pasar el cursor sobre elementos no seleccionados
          },
        },
      },
    },
  },
});

function DemoPageContent({ pathname }) {
  return (
    <Box
      sx={{
        py: 4,
        px: 6,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        textAlign: 'left',
        width: '100%',
        backgroundColor: '#EEE5E9', // Usa el color del tema
      }}
    >
        {pathname === '/configuracion-perfil' && <PerfilUsuario />}
        {pathname === '/users' && <CrudUsuariosCoordi />}
        {pathname === '/programas' && <CrudPrograms />}
        {pathname === '/reportes/usuarios' && <ReportesUsuarios />}
        {pathname === '/reportes/donaciones' && <ReportesDonaciones />}
        {pathname === '/reportes/programas' && <ReportesProgramasAyuda />}
        {pathname === '/asignaciones/beneficiario-programa' && <AsignacionesBen_Pro />}
        {pathname === '/asignaciones/voluntarios-programas' && <AsignacionesVol_Pro />}
        {pathname === '/asignaciones/presupuesto-programa' && <AsignacionesPresupuesto_Pro />}
        {pathname === '/comunicacion/contacto' && <ChatGlobal />}
        {pathname === '/comunicacion/ver-feedback' && <VerFeedback />}
        {pathname === '/logout' && <CerrarSesion />}
        
    </Box>
  );
}



DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

function DashboardCoordi(props) {
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
      branding={{
        logo: (
          <Avatar sx={{ bgcolor: 'primary.main', color: 'white' }}>
            S
          </Avatar>
        ),
        title: 'SOLVIA',
      }}
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

DashboardCoordi.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window: PropTypes.func,
};

export default DashboardCoordi;