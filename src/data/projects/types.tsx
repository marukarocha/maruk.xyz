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
  deepDive?: {
    headline?: string;
    blocks: Array<{
      title: string;
      summary?: string;
      points: string[];
    }>;
  };
  
  // Visuals
  images: {
    hero: string;
    gallery: string[];
    heroVideo?: string;
    logo?: string;
  };
  videos?: Array<{
    title: string;
    url: string;
  }>;
  
  // Links
  links: {
    live?: string;
    github?: string;
  };
  
  // Next/Previous navigation
  nextProjectId?: string;
}
