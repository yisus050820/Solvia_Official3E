import React from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import PaidIcon from '@mui/icons-material/Paid';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import GroupIcon from '@mui/icons-material/Group';
import EventIcon from '@mui/icons-material/Event';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import MessageIcon from '@mui/icons-material/Message';
import { createTheme } from '@mui/material/styles';
import { Feedback } from '@mui/icons-material';


import Donar from './componentesDonador/Donar';
import HistorialDonaciones from './componentesDonador/HistorialDonaciones';
import VerPersonas from './componentesVol/OtrosVol';
import PerfilUsuario from './componentesAdmin/ConfigDePerfil';
import ReportesDonaciones from './componentesAdmin/ReportesDonaciones';
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
      title: 'Mi perfil',
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
          ],
        },
      ],
    },
    {
      segment: 'informes-generales',
      title: 'Reporte General',
      icon: <DescriptionIcon />,
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
          px: 6,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          textAlign: 'left',
          width: '100%',
        }}
      >
        {pathname === '/configuracion-perfil' && <PerfilUsuario />}
        {pathname === '/donaciones/donar' && <Donar />}
        {pathname === '/donaciones/seguimiento/historial' && <HistorialDonaciones />}
        {pathname === '/informes-generales' && <ReportesDonaciones />}
        {pathname === '/beneficiarios-programas/ver-personas' && <VerPersonas />}
        {pathname === '/comunicacion/feedback' && <Calificar />}
        {pathname === '/comunicacion/contacto' && <Comunicacion />}
        {pathname === '/comunicacion/ver-feedback' && <VerFeedback />}
      </Box>
    );
  }
  
  
  
  
  
  
  DemoPageContent.propTypes = {
    pathname: PropTypes.string.isRequired,
  };
  
  function DashboardDonante(props) {
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
  
  DashboardDonante.propTypes = {
    /**
     * Injected by the documentation to work in an iframe.
     * Remove this when copying and pasting into your project.
     */
    window: PropTypes.func,
  };

export default DashboardDonante;
