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
import RateReviewIcon from '@mui/icons-material/RateReview';
import { FaIconName } from 'react-icons/fa';
import { Feedback } from '@mui/icons-material';
import PerfilUsuario from './componentesAdmin/ConfigDePerfil';
import TarjetasProgramas from './componentesAdmin/TarjetasProgramas';
import MisProgramas from './componentesBeneficiario/MisProgramas';
import AyudaRecibida from './componentesBeneficiario/AyudaRecibida';
import Calificar from './componentesBeneficiario/Feedback';





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
    title: 'Ayuda recibida',
    icon: <VolunteerActivism />,
    
  },
  {
    segment: 'feedback',
    title: 'Feedback de actividades',
    icon: <Feedback />,
   
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
    
    {pathname === '/configuracion-perfil' && <PerfilUsuario />}
    {pathname === '/programas/disponibles' && <TarjetasProgramas />}
    {pathname === '/programas/actuales' && <MisProgramas />}
    {pathname === '/ayuda' && <AyudaRecibida />}
    {pathname === '/feedback' && <Calificar />}
    
      
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