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



import OtrosVoluntarios from './componentesVol/OtrosVol';
import MisProgramas from './componentesBeneficiario/MisProgramas';
import PerfilUsuario from './componentesAdmin/ConfigDePerfil';
import Calificar from './componentesBeneficiario/Feedback';
import Comunicacion from './componentesDonador/Comunicacion';
import VerFeedback from './componentesDonador/VerFeedback';





const NAVIGATION = [
  {
    kind: 'header',
    title: 'Opciones',
  },
  {
    segment: 'configuracion-perfil',
    title: 'Perfil',
    icon: <DashboardIcon />,
  },
    
  {
    segment: 'voluntarios',
    title: 'Voluntarios',
    icon: <People />,
    children: [
      {
        segment: 'otros-voluntarios',
        title: 'Otros Voluntarios',
        icon: <EmojiPeople />,
      },
    ],
  },


  {
    segment: 'programas-inscritos',
    title: 'Programas Inscritos',
    icon: <AssignmentInd />,

  },
  {
    segment: 'comunicacion',
    title: 'Comunicación', // Título actualizado
    icon: <ChatBubbleIcon />,
    children: [
      {
        segment: 'contacto',
        title: 'Contactar con un administrador',
        icon: <MessageIcon />,
      },
      {
        segment: 'feedback', // Nuevo hijo "Feedback"
        title: 'Feedback',
        icon: <Feedback />, // Puedes cambiar el ícono si lo deseas
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
      {pathname === '/voluntarios/otros-voluntarios' && <OtrosVoluntarios />}
      {pathname === '/programas-inscritos' && <MisProgramas />}
      {pathname === '/configuracion-perfil' && <PerfilUsuario />}
      {pathname === '/comunicacion/contacto' && <Comunicacion />}
      {pathname === '/comunicacion/feedback' && <Calificar />}
      {pathname === '/comunicacion/ver-feedback' && <VerFeedback />}
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