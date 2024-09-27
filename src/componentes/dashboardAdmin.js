import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { createTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import PersonIcon from '@mui/icons-material/Person';
<<<<<<< HEAD:src/componentes/dashboard.js
import PaidIcon from '@mui/icons-material/Paid';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import GroupIcon from '@mui/icons-material/Group';
import EventIcon from '@mui/icons-material/Event';
=======
import People from '@mui/icons-material/People';
import AssignmentInd from '@mui/icons-material/AssignmentInd';
import Paid from '@mui/icons-material/Paid';
import Event from '@mui/icons-material/Event';
import VolunteerActivism from '@mui/icons-material/VolunteerActivism';
import EmojiPeople from '@mui/icons-material/EmojiPeople';
import AttachMoney from '@mui/icons-material/AttachMoney';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount'

// Importaciones de los formularios hijos
import ProgramasCrud from './componentesAdmin/ProgramasCrud';
import ReportesDonaciones from './componentesAdmin/ReportesDonaciones';
import ReportesProgramasAyuda from './componentesAdmin/ReportesProgramasAyuda';
import ReportesUsuarios from './componentesAdmin/ReportesUsuarios';
import TarjetasProgramas from './componentesAdmin/TarjetasProgramas';
import UsuariosCrud from './componentesAdmin/UsuariosCrud';
import AsignacionesBen_Pro from './componentesAdmin/AsignacionesBen_Pro';
import AsignacionesVol_Pro from './componentesAdmin/AsignacionesVol_Pro';
import AsignacionesCoord_Pro from './componentesAdmin/AsignacionesCoord_Pro';
import AsignacionPresupuesto_Pro from './componentesAdmin/AsignacionesPresupuesto_Pro';
import PerfilUsuario from './componentesAdmin/ConfigDePerfil';

>>>>>>> 5dab1b3b9d67a8323bf26069badd304ea925ea9f:src/componentes/dashboardAdmin.js

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
<<<<<<< HEAD:src/componentes/dashboard.js
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
=======
    segment: 'users',
    title: 'Usuarios',
    icon: <People />,
  },
  {
    segment: 'programas',
    title: 'Programas',
    icon: <Event />,
    children: [
      {
        segment: 'gestionar-programas',
        title: 'Gestionar programas',
        icon: <SettingsIcon />,
      },
      {
        segment: 'todos-programas',
        title: 'Todos los programas',
        icon: <Event />,
      }
    ],
  },  
  
  {
    segment: 'reportes',
    title: 'Reportes',
    icon: <BarChartIcon />,
>>>>>>> 5dab1b3b9d67a8323bf26069badd304ea925ea9f:src/componentes/dashboardAdmin.js
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
<<<<<<< HEAD:src/componentes/dashboard.js
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
=======
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
          segment: 'coordinador-programa',
          title: 'Coordinador/Programa',
          icon: <SupervisorAccountIcon />,
        },
        {
          segment: 'presupuesto-programa',
          title: 'Presupuesto/Programa',
          icon: <AttachMoney />,
        },
      
      ],
>>>>>>> 5dab1b3b9d67a8323bf26069badd304ea925ea9f:src/componentes/dashboardAdmin.js
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
      {pathname === '/users' && <UsuariosCrud />}
      {pathname === '/programas/gestionar-programas' && <ProgramasCrud />}
      {pathname === '/reportes/usuarios' && <ReportesUsuarios />}
      {pathname === '/reportes/donaciones' && <ReportesDonaciones />}
      {pathname === '/reportes/programas' && <ReportesProgramasAyuda />}
      {pathname === '/programas/todos-programas' && <TarjetasProgramas />}
      {pathname === '/asignaciones/beneficiario-programa' && <AsignacionesBen_Pro />}
      {pathname === '/asignaciones/voluntarios-programas' && <AsignacionesVol_Pro />}
      {pathname === '/asignaciones/coordinador-programa' && <AsignacionesCoord_Pro />}
      {pathname === '/asignaciones/presupuesto-programa' && <AsignacionPresupuesto_Pro />}
      {pathname === '/configuracion-perfil' && <PerfilUsuario />}   
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
