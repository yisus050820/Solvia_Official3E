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
import PaidIcon from '@mui/icons-material/Paid';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import GroupIcon from '@mui/icons-material/Group';
import EventIcon from '@mui/icons-material/Event';

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
    segment: 'donaciones',
    title: 'Donaciones',
    icon: <VolunteerActivismIcon />,
    children: [
      {
        segment: 'donar',
        title: 'Donar',
        icon: <LocalAtmIcon />,
      },
      {
        segment: 'seguimiento',
        title: 'Seguimiento de Donaciones',
        icon: <PaidIcon />,
        children: [
          {
            segment: 'historial',
            title: 'Historial de Donaciones',
            icon: <PaidIcon />,
          },
          {
            segment: 'estado-actual',
            title: 'Estado de Donaciones Actuales',
            icon: <PaidIcon />,
          },
        ],
      },
    ],
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
    segment: 'beneficiarios-programas',
    title: 'Beneficiarios y Programas',
    icon: <GroupIcon />,
    children: [
      {
        segment: 'ver-personas',
        title: 'Ver Personas',
        icon: <PersonIcon />,
      },
      {
        segment: 'ver-programas',
        title: 'Ver Programas',
        icon: <EventIcon />,
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
        title: 'Contactar con un coordinador',
        icon: <ChatBubbleIcon />,
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
