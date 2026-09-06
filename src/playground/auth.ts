export const PROTECTED_PLAYGROUND_IDS = ['tourism-guide', 'experience-studio', 'eldonita'] as const;

export const PLAYGROUND_PASSWORD = '654321';

export const getExperimentDisplayName = (experimentId?: string) => {
  if (experimentId === 'tourism-guide') {
    return 'Gabe Turismo';
  }

  if (experimentId === 'experience-studio') {
    return 'Lagoa E-Bikes';
  }

  if (experimentId === 'eldonita') {
    return 'Eldonita Inteligência';
  }

  return 'Experiência';
};
