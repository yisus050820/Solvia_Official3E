import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import PersonIcon from '@mui/icons-material/Person';
import People from '@mui/icons-material/People';
import AssignmentInd from '@mui/icons-material/AssignmentInd';
import Paid from '@mui/icons-material/Paid';
import Event from '@mui/icons-material/Event';
import VolunteerActivism from '@mui/icons-material/VolunteerActivism';
import EmojiPeople from '@mui/icons-material/EmojiPeople';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import MessageIcon from '@mui/icons-material/Message'
import { Feedback } from '@mui/icons-material';
import SettingsIcon from '@mui/icons-material/Settings';
import { Avatar } from '@mui/material';




import OtrosVoluntarios from './componentesVol/OtrosVol';
import MisProgramasVol from './componentesVol/MisProgramasVol';
import PerfilUsuario from './componentesAdmin/ConfigDePerfil';
import Calificar from './componentesBeneficiario/Feedback';
import Comunicacion from './componentesDonador/Comunicacion';
import VerFeedback from './componentesAdmin/VerFeedback';
import ProgramasDisp from './componentesDonador/VerProgramasDisp';
import ChatGlobal from './ChatGlobal';
import CerrarSesion from './logout';





const NAVIGATION = [
  {
    segment: 'configuracion-perfil',
    title: 'Perfil',
    icon: <DashboardIcon />,
  },
    
  {
    segment: 'usuarios',
    title: 'Usuarios',
    icon: <People />,
  },

  {
    segment: 'programas',
    title: 'Programas',
    icon: <People />,
    children: [
      {
        segment: 'programas-inscritos',
        title: 'Programas Inscritos',
        icon: <AssignmentInd />,   
      },

      {
        segment: 'programas-disponibles',
        title: 'Programas Disponibles',
        icon: <AssignmentInd />,   
      },
    ],
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
        segment: 'ver-feedback',
        title: 'Ver feedback de programas',
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
      {pathname === '/usuarios' && <OtrosVoluntarios />}
      {pathname === '/programas/programas-inscritos' && <MisProgramasVol />}
      {pathname === '/programas/programas-disponibles' && <ProgramasDisp />}
      {pathname === '/configuracion-perfil' && <PerfilUsuario />}
      {pathname === '/comunicacion/contacto' && <ChatGlobal />}
      {pathname === '/comunicacion/feedback' && <Calificar />}
      {pathname === '/comunicacion/ver-feedback' && <VerFeedback />}
      {pathname === '/logout' && <CerrarSesion />}
    </Box>
  );
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

function DashboardVoluntario(props) {
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

DashboardVoluntario.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window: PropTypes.func,
};

export default DashboardVoluntario;