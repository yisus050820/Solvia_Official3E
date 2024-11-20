import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import Event from '@mui/icons-material/Event';
import VolunteerActivism from '@mui/icons-material/VolunteerActivism';
import { FaIconName } from 'react-icons/fa';
import { ChatBubbleOutline, Feedback } from '@mui/icons-material';
import MessageIcon from '@mui/icons-material/Message';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import SettingsIcon from '@mui/icons-material/Settings';


import PerfilUsuario from './componentesAdmin/ConfigDePerfil';
import MisProgramas from './componentesBeneficiario/MisProgramas';
import Calificar from './componentesBeneficiario/Feedback';
import VerFeedback from './componentesAdmin/VerFeedback';
import ProgramasActivos from './componentesBeneficiario/ProgramasDisponiblesActivos';
import ChatGlobal from './ChatGlobal';
import CerrarSesion from './logout';



const NAVIGATION = [

  {
    segment: 'configuracion-perfil',
    title: 'Mi perfil',
    icon: <DashboardIcon />,
  },
    
  {
    segment: 'programas',
    title: 'Programas',
    icon: <Event />,
    children: [
      {
        segment: 'disponibles',
        title: 'Programas disponibles',
        icon: <Event />,
      },
      {
        segment: 'actuales',
        title: 'Mis programas',
        icon: <Event />,
      },
    ],
  },
 
  {
    segment: 'ayuda',
    title: 'Donaciones',
    icon: <VolunteerActivism />,
    
  },
  {
    segment: 'comunicacion',
    title: 'Comunicación', // Título actualizado
    icon: <ChatBubbleIcon />,
    children: [
      {
        segment: 'contacto',
        title: 'Mensajería',
        icon: <MessageIcon />,
      },
      {
        segment: 'feedback', // Nuevo hijo "Feedback"
        title: 'Dar feedback',
        icon: <Feedback />, // Puedes cambiar el ícono si lo deseas
      },
      {
        segment: 'ver-feedback',
        title: 'Ver feedback',
        icon: <Feedback />,
      },
    ],
  },
  {
    segment: 'logout',
    title: 'Cerrar sesión',
    icon: <SettingsIcon />, // Puedes cambiar el icono si lo deseas
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
          backgroundColor: '#383D3B', // Color de la barra lateral
          color: '#EEE5E9',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#383D3B', // Color de la barra superior
          color: '#EEE5E9', // Color del texto en la barra superior
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
    {pathname === '/programas/disponibles' && <ProgramasActivos />}
    {pathname === '/programas/actuales' && <MisProgramas />}
    {pathname === '/comunicacion/feedback' && <Calificar />}
    {pathname === '/comunicacion/contacto' && <ChatGlobal />}
    {pathname === '/comunicacion/ver-feedback' && <VerFeedback />}
    {pathname === '/logout' && <CerrarSesion />}

    
      
    </Box>
  );
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

function DashboardBeneficiario(props) {
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
        logo: <img src="https://mui.com/static/logo.png" alt="SOLVIA logo" />,
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

DashboardBeneficiario.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window: PropTypes.func,
};

export default DashboardBeneficiario;