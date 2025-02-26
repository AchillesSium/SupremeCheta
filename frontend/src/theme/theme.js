import { createTheme } from '@mui/material/styles';

const baseTheme = {
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", sans-serif',
    h4: {
      fontSize: '1.75rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
    body1: {
      fontSize: '1rem',
      letterSpacing: '0.01em',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      letterSpacing: '0.01em',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 20px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 8,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
  },
};

const getTheme = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode
          primary: {
            main: '#2563eb', // Modern blue, similar to Shopify
            light: '#3b82f6',
            dark: '#1d4ed8',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#7c3aed', // Modern purple for accents
            light: '#8b5cf6',
            dark: '#6d28d9',
            contrastText: '#ffffff',
          },
          background: {
            default: '#f8fafc', // Very light blue-gray
            paper: '#ffffff',
          },
          text: {
            primary: '#1e293b', // Slate-800
            secondary: '#64748b', // Slate-500
            disabled: '#94a3b8', // Slate-400
          },
          error: {
            main: '#ef4444', // Modern red
            light: '#f87171',
            dark: '#dc2626',
          },
          warning: {
            main: '#f59e0b', // Modern amber
            light: '#fbbf24',
            dark: '#d97706',
          },
          info: {
            main: '#0ea5e9', // Modern sky blue
            light: '#38bdf8',
            dark: '#0284c7',
          },
          success: {
            main: '#10b981', // Modern emerald
            light: '#34d399',
            dark: '#059669',
          },
          divider: 'rgba(0, 0, 0, 0.08)',
        }
      : {
          // Dark mode - keeping as is since you mentioned it's perfect
          primary: {
            main: '#3b82f6',
            light: '#60a5fa',
            dark: '#2563eb',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#8b5cf6',
            light: '#a78bfa',
            dark: '#7c3aed',
            contrastText: '#ffffff',
          },
          background: {
            default: '#0f172a',
            paper: '#1e293b',
          },
          text: {
            primary: '#f8fafc',
            secondary: '#cbd5e1',
            disabled: '#64748b',
          },
          error: {
            main: '#ef4444',
            light: '#f87171',
            dark: '#dc2626',
          },
          warning: {
            main: '#f59e0b',
            light: '#fbbf24',
            dark: '#d97706',
          },
          info: {
            main: '#0ea5e9',
            light: '#38bdf8',
            dark: '#0284c7',
          },
          success: {
            main: '#10b981',
            light: '#34d399',
            dark: '#059669',
          },
          divider: 'rgba(255, 255, 255, 0.08)',
        }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: '2.375rem',
      lineHeight: 1.21,
    },
    h2: {
      fontWeight: 600,
      fontSize: '1.875rem',
      lineHeight: 1.27,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.33,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '0.875rem',
      lineHeight: 1.57,
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.57,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.75rem',
      lineHeight: 1.66,
      letterSpacing: '0.00938em',
    },
    subtitle1: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.57,
    },
    subtitle2: {
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.66,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.05)',
    '0px 4px 8px rgba(0, 0, 0, 0.05)',
    '0px 8px 16px rgba(0, 0, 0, 0.05)',
    '0px 12px 24px rgba(0, 0, 0, 0.05)',
    '0px 16px 32px rgba(0, 0, 0, 0.05)',
    '0px 20px 40px rgba(0, 0, 0, 0.05)',
    ...Array(17).fill('none'), // Fill remaining shadows
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

const theme = (mode) => createTheme({ ...baseTheme, ...getTheme(mode) });

// Light theme
const lightTheme = theme('light');

// Dark theme
const darkTheme = theme('dark');

export { lightTheme, darkTheme };