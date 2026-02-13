import { motodiario } from './motodiario';
import type { ProjectData } from './types';

// Central registry of all projects
export const projects: ProjectData[] = [
  motodiario,
  // Add other projects here
];

export const getProjectById = (id: string): ProjectData | undefined => {
  return projects.find(p => p.id === id);
};

export * from './types';
