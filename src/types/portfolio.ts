export type ProjectGalleryImage = {
  src: string;
  caption?: string;
};

export type ProjectCase = {
  id: string;
  name: string;
  category: string;
  role: string;
  summary: string;
  problem?: string;
  steps?: string[];
  result?: string;
  tech: string[];
  gallery: ProjectGalleryImage[];
  url?: string;
  urlLabel?: string;
};
