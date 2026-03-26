export interface Experiment {
  id: string;
  title: string;
  description: string;
  tags: string[];
  thumbnail?: string;
  date: string;
  status: 'live' | 'wip' | 'concept';
  component: React.LazyExoticComponent<React.ComponentType>;
}
