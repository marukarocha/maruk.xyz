import { motodiario } from './motodiario';
import { motionPortfolio } from './motion-portfolio';
import { pdvShowcase } from './pdv-showcase';
import type { ProjectData } from './types';

// Central registry of all projects
export const projects: ProjectData[] = [
  motodiario,
  motionPortfolio,
  pdvShowcase,
  // Add other projects here
];

export const getProjectById = (id: string): ProjectData | undefined => {
  return projects.find(p => p.id === id);
};

export type { ProjectData } from './types';
