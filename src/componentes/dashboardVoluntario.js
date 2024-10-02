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

import UsuariosCrud from './componentesVoluntario/UsuariosCrud';
import TarjetasProgramas from './componentesVoluntario/TarjetasProgramas';
import PerfilUsuario from './componentesVoluntario/ConfigDePerfil';




const NAVIGATION = [
  {
    kind: 'header',
    title: 'Opciones',
  },
  {
    segment: 'perfil',
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
    segment: 'feedback',
    title: 'Feedback',
    icon: <DescriptionIcon />,

  },
  {
    segment: 'programas-inscritos',
    title: 'Programas Inscritos',
    icon: <AssignmentInd />,

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
      {pathname === '/voluntarios/otros-voluntarios' && <UsuariosCrud />}
      {pathname === '/programas-inscritos' && <TarjetasProgramas />}
      {pathname === '/perfil' && <PerfilUsuario />}
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