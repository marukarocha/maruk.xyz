export interface Experiment {
  id: string;
  title: string;
  description: string;
  tags: string[];
  thumbnail?: string;
  previewVideo?: string;
  date: string;
  status: 'live' | 'wip' | 'concept';
  component: React.LazyExoticComponent<React.ComponentType>;
}
