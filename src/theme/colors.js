export const colors = {
  primary: '#245C4F',
  primaryDark: '#183F36',
  primaryLight: '#E7EFEB',
  secondary: '#347568',
  danger: '#B4453D',
  warning: '#A97932',
  background: '#F5F3EE',
  card: '#FFFFFF',
  text: '#222D29',
  textMuted: '#66716B',
  border: '#DFE4DE',
};

export const subjectColors = [
  '#245C4F', '#537B92', '#A97932', '#A85D50',
  '#76658A', '#527A70', '#986F79', '#6A7845',
];

export function colorForIndex(index) {
  return subjectColors[index % subjectColors.length];
}
