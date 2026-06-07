export type ExperienceId = 'effects' | 'flowers';

export interface ExperienceConfig {
  id: ExperienceId;
  label: string;
  isNew?: boolean;
}

export const EXPERIENCES: ExperienceConfig[] = [
  { id: 'effects', label: 'EFFECTS' },
  { id: 'flowers', label: 'FLOWERS', isNew: true },
];

export function getExperience(id: ExperienceId): ExperienceConfig | undefined {
  return EXPERIENCES.find(e => e.id === id);
}
