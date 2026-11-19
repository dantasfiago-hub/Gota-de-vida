export const colors = {
  primary: '#C62828',
  primaryDark: '#8E1B1B',
  primarySoft: '#FCE8E8',
  white: '#FFFFFF',
  gray: '#F5F5F5',
  text: '#333333',
  textMuted: '#6B6B6B',
  border: '#E6E6E6',
  success: '#2E7D32',
  successSoft: '#E6F4E7',
  warning: '#B26A00',
  warningSoft: '#FFF3DC',
  info: '#1565C0',
  infoSoft: '#E3F0FC',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 14, lg: 20, pill: 999 };

export const shadow = {
  shadowColor: '#000',
  shadowOpacity: 0.07,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 3 },
  elevation: 2,
};

export const font = {
  title: { fontSize: 22, fontWeight: '700' as const, color: colors.text },
  h2: { fontSize: 18, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 15, color: colors.text },
  small: { fontSize: 13, color: colors.textMuted },
};
