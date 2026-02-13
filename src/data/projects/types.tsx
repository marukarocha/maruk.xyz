export interface ProjectData {
  id: string;
  title: string;
  shortDescription: string;
  role: string;
  tags: string[];
  
  // The value proposition
  problem: string;
  solution: string;
  
  // Technical deep-dive
  challenges: string[];
  features: string[];
  techStack: string[];
  
  // Visuals
  images: {
    hero: string;
    gallery: string[];
  };
  
  // Links
  links: {
    live?: string;
    github?: string;
  };
  
  // Next/Previous navigation
  nextProjectId?: string;
}
