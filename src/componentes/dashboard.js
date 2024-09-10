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

const NAVIGATION = [
  {
    kind: 'header',
    title: 'Opciones',
  },
  {
    segment: 'dashboard',
    title: 'Centro de control',
    icon: <DashboardIcon />,
  },
    
  {
    segment: 'asignaciones',
    title: 'Asignaciones',
    icon: <People />,
    children: [
      {
        segment: 'asignarprogram',
        title: 'Nuevo Programa',
        icon: <People />,
      },
      {
        segment: 'asignarben',
        title: 'Nuevo beneficiario',
        icon: <VolunteerActivism />,
      },
      {
        segment: 'asigarvol',
        title: 'Nuevo voluntario',
        icon: <EmojiPeople />,
      },
    ],
  },
 
  {
    segment: 'reportes',
    title: 'Reportes',
    icon: <DescriptionIcon />,
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
    title: 'Presupuesto',
    icon: <AttachMoney />,
    children: [
        {
          segment: 'presupuesto/programa',
          title: 'Presupuesto/Programa',
          icon: <AttachMoney />,
        },
        {
          segment: 'presupuesto/becas',
          title: 'Presupuesto/Becas',
          icon: <AttachMoney />,
        },
      
      ],
  },
  {
    segment: 'programas',
    title: 'Actividades',
    icon: <People />,
    children: [
      {
        segment: 'actividades',
        title: 'Actividades disponibles',
        icon: <People />,
      },
      {
        segment: 'act',
        title: 'Actividades totales',
        icon: <People />,
      },
    ]
  },
  {
    segment: 'graficas',
    title: 'Graficas',
    icon: <People />,
    children: [
      {
        segment: 'graficvol',
        title: 'Graficas/Voluntarios',
        icon: <People />,
      },
      {
        segment: 'graficben',
        title: 'Graficas/Beneficiarios',
        icon: <People />,
      },
      {
        segment: 'graficdon',
        title: 'Graficas/Donaciones',
        icon: <People />,
      },
    ]
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