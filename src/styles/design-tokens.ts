export const DesignTokens = {
  colors: {
    primary: '#363694',
    secondary: '#65697b',
    labels: '#65697b',
    onSurface: '#65697b',
    background: '#fdfbf9',
    surface: '#fff',
    button: {
      primary: '#6a46fe',
      secondary: '#f1f0fe',
      outlined: '#fff'
    }
  },
  
  typography: {
    fontFamily: {
      primary: 'Inter, sans-serif'
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600
    },
    fontSize: {
      largeTitle: '1.75rem',
      title: '1.25rem',
      body: '0.875rem',
      caption: '0.75rem',
      small: '0.688rem'
    }
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  
  components: {
    button: {
      height: '2.5rem',
      borderRadius: '0.5rem',
      padding: '1rem'
    },
    formField: {
      height: '2.5rem'
    },
    tableRow: {
      height: '2.25rem'
    },
    header: {
      height: '4rem'
    },
    card: {
      borderRadius: '0.75rem'
    }
  }
} as const;

export type DesignTokensType = typeof DesignTokens;