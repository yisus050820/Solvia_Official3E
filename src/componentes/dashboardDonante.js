import React, { useState } from 'react';
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

const dashboardDonante = () => {
  const [selectedSegment, setSelectedSegment] = (''); // Controla la navegación

  const handleNavigationChange = (segment) => {
    setSelectedSegment(segment);
  };

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
              segment: 'estado-actual',
              title: 'Estado de Donaciones Actuales',
              icon: <PaidIcon />,
            },
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
          title: 'Informes de Impacto',
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
      title: 'Comunicación', // Título actualizado
      icon: <ChatBubbleIcon />,
      children: [
        {
          segment: 'contacto',
          title: 'Contactar con un coordinador',
          icon: <ChatBubbleIcon />,
        },
        {
          segment: 'feedback', // Nuevo hijo "Feedback"
          title: 'Feedback',
          icon: <ChatBubbleIcon />, // Puedes cambiar el ícono si lo deseas
        },
      ],
    },
  ];

  const router = {
    pathname: selectedSegment,
    searchParams: new URLSearchParams(),
    navigate: (path) => handleNavigationChange(path),
  };

  return (
    <AppProvider navigation={NAVIGATION} router={router}>
      <DashboardLayout>
        {/* Renderizado condicional basado en la navegación */}
        {selectedSegment === '/dashboard' && <p>Contenido del Dashboard</p>}
        {/* Puedes añadir más secciones de contenido según las rutas */}
      </DashboardLayout>
    </AppProvider>
  );
};

export default dashboardDonante;
