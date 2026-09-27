// Single theme file: light and dark palettes.
// Every screen reads its colours through useTheme(), so toggling the theme
// re-colours the whole app instantly.

export const lightColors = {
  background: '#FFF8F2',
  surface: '#FFFFFF',
  surfaceAlt: '#F6EDE4',
  text: '#1F1A17',
  textMuted: '#6F655E',
  border: '#E7DBD0',
  primary: '#D9480F',
  primaryText: '#FFFFFF',
  accent: '#F59F00',
  success: '#2B8A3E',
  danger: '#C92A2A',
  disabled: '#BDB5AE',
  chip: '#F1E3D6',
  overlay: 'rgba(0,0,0,0.45)',
};

export const darkColors = {
  background: '#141110',
  surface: '#1F1B19',
  surfaceAlt: '#2A2522',
  text: '#F5EFEA',
  textMuted: '#A99F97',
  border: '#3A3330',
  primary: '#FF7A3D',
  primaryText: '#1A0E07',
  accent: '#FFC247',
  success: '#51CF66',
  danger: '#FF6B6B',
  disabled: '#5B534E',
  chip: '#302925',
  overlay: 'rgba(0,0,0,0.65)',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const radius = { sm: 8, md: 12, lg: 18, pill: 999 };
