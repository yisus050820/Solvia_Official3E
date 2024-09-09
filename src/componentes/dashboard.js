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
import AttachMoney from '@mui/icons-material/AttachMoney';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';

const NAVIGATION = [
  {
    kind: 'header',
    title: 'Opciones',
  },
  {
    segment: 'dashboard',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    segment: 'informes',
    title: 'Informes',
    icon: <DescriptionIcon />,
    children: [
      {
        segment: 'informes-generales',
        title: 'Informes Generales',
        icon: <DescriptionIcon />,
      },
      {
        segment: 'informes-impacto',
        title: 'Informes Gde Impacto',
        icon: <DescriptionIcon />,
      },
    ],
  },
  {
    segment: 'seguimiento',
    title: 'Seguimiento de Donaciones',
    icon: <Paid />,
    children: [
      {
        segment: 'historial',
        title: 'Historial de Donaciones',
        icon: <Paid />,
      },
      {
        segment: 'estado-actual',
        title: 'Estado de Donaciones Actuales',
        icon: <Paid />,
      },
    ],
  },
  {
    segment: 'comunicacion',
    title: 'Comunicación con la ONG',
    icon: <ChatBubbleIcon />,
    children: [
      {
        segment: 'contacto',
        title: 'Contactar al Equipo',
        icon: <ChatBubbleIcon />,
      },
      {
        segment: 'preguntas-frecuentes',
        title: 'Preguntas Frecuentes',
        icon: <ChatBubbleIcon />,
      },
      {
        segment: 'actualizaciones',
        title: 'Actualizaciones y Noticias',
        icon: <ChatBubbleIcon />,
      },
    ],
  },
  {
    segment: 'beneficiarios',
    title: 'Beneficiarios',
    icon: <PersonIcon />,
    children: [
      {
        segment: 'ver-beneficiarios',
        title: 'Ver Beneficiarios',
        icon: <PersonIcon />,
      },
      {
        segment: 'historias',
        title: 'Historias de Beneficiarios',
        icon: <PersonIcon />,
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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <Typography>Dashboard content for {pathname}</Typography>
    </Box>
  );
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

function DashboardLayoutBasic(props) {
  const { window } = props;

  const [pathname, setPathname] = React.useState('/dashboard');

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
