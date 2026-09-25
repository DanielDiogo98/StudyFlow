export const colors = {
  primary: '#5B5FEF',
  primaryDark: '#4347C4',
  primaryLight: '#EEF0FF',
  secondary: '#22C3A6',
  danger: '#EF5B5B',
  warning: '#F5A623',
  background: '#F7F8FC',
  card: '#FFFFFF',
  text: '#1C1D2B',
  textMuted: '#6B6E85',
  border: '#E5E7F0',
};

export const subjectColors = [
  '#5B5FEF',
  '#22C3A6',
  '#F5A623',
  '#EF5B5B',
  '#9B59F6',
  '#2FA8E8',
  '#EF7BB0',
  '#4CAF50',
];

export function colorForIndex(index) {
  return subjectColors[index % subjectColors.length];
}
