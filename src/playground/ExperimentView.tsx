import { useParams, Navigate, Link } from 'react-router-dom';
import { Suspense } from 'react';
import { experiments } from './registry';
import { ErrorBoundary } from '../components/ErrorBoundary';

const ExperimentLoader = () => (
  <div className="w-full h-[calc(100vh-3.5rem)] flex items-center justify-center bg-[#050505]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-5 h-5 border border-white/20 rounded-full animate-spin border-t-white/60" />
      <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
        Loading experiment...
      </span>
    </div>
  </div>
);

const ExperimentCrash = () => (
  <div className="w-full h-[calc(100vh-3.5rem)] flex items-center justify-center bg-[#050505]">
    <div className="flex flex-col items-center gap-4 text-center px-6">
      <div className="w-12 h-12 rounded-full border border-red-500/30 flex items-center justify-center">
        <span className="text-red-400 text-lg">!</span>
      </div>
      <h3 className="text-sm font-mono text-white/60">Experiment crashed</h3>
      <p className="text-xs text-white/30 max-w-xs">
        O WebGL pode ter ficado sem memória. Tente recarregar.
      </p>
      <div className="flex gap-3 mt-2">
        <button
          onClick={() => window.location.reload()}
          className="text-[10px] font-mono text-white/50 border border-white/10 px-4 py-2 rounded hover:border-white/30 hover:text-white/80 transition-colors"
        >
          Reload
        </button>
        <Link
          to="/playground"
          className="text-[10px] font-mono text-white/50 border border-white/10 px-4 py-2 rounded hover:border-white/30 hover:text-white/80 transition-colors"
        >
          Back to Playground
        </Link>
      </div>
    </div>
  </div>
);

export const ExperimentView = () => {
  const { id } = useParams<{ id: string }>();
  const experiment = experiments.find((e) => e.id === id);

  if (!experiment) {
    return <Navigate to="/playground" replace />;
  }

  const ExperimentComponent = experiment.component;

  return (
    <div className="w-full h-[calc(100vh-3.5rem)] relative">
      <ErrorBoundary fallback={<ExperimentCrash />}>
        <Suspense fallback={<ExperimentLoader />}>
          <ExperimentComponent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};
