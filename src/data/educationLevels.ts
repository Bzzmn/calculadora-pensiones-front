export const educationLevels = [
  'Básica',
  'Media',
  'Técnica',
  'Universitaria incompleta',
  'Universitaria completa',
  'Postgrado'
] as const;

export type EducationLevel = typeof educationLevels[number];