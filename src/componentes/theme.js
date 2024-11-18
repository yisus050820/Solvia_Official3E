import { createTheme } from '@mui/material/styles';

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#0097A7', // Azul oscuro (aqua profundo)
          contrastText: '#383D3B', // Texto oscuro sobre azul
        },
        secondary: {
          main: '#7C7C7C', // Gris para elementos secundarios
          contrastText: '#EEE5E9', // Texto claro sobre gris
        },
        background: {
          default: '#EEE5E9', // Fondo claro
          paper: '#FFFFFF', // Fondo de componentes secundarios
        },
        text: {
          primary: '#383D3B', // Texto principal
          secondary: '#7C7C7C', // Texto secundario
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#0097A7', // Azul oscuro para el modo oscuro
          contrastText: '#EEE5E9', // Texto claro sobre azul
        },
        secondary: {
          main: '#383D3B', // Gris oscuro para botones secundarios
          contrastText: '#EEE5E9', // Texto claro sobre gris oscuro
        },
        background: {
          default: '#383D3B', // Fondo oscuro
          paper: '#7C7C7C', // Fondo de componentes secundarios en modo oscuro
        },
        text: {
          primary: '#EEE5E9', // Texto claro en fondo oscuro
          secondary: '#0097A7', // Texto secundario en modo oscuro
        },
      },
    },
  },
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

export default demoTheme;
