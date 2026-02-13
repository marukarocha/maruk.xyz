import { useSearchParams } from 'react-router-dom';
import { getProjectById } from '../data/projects';
import type { ProjectData } from '../data/projects';

export function useProjectModal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  
  const selectedProject: ProjectData | undefined = projectId 
    ? getProjectById(projectId) 
    : undefined;

  const openProject = (id: string) => {
    setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set('project', id);
        return newParams;
    });
  };

  const closeProject = () => {
    setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('project');
        return newParams;
    });
  };

  return {
    selectedProject,
    openProject,
    closeProject,
    isOpen: !!selectedProject
  };
}
