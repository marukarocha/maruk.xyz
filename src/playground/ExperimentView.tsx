import { useParams, Navigate, Link } from 'react-router-dom';
import { Suspense } from 'react';
import { experiments } from './registry';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { BikeCargoEntry } from './experiments/bike-cargo/BikeCargoEntry';
import { useLanguage } from '../i18n/useLanguage';

interface ViewerCopy {
  loading: string;
  crashTitle: string;
  crashDescription: string;
  reload: string;
  backToPlayground: string;
}

const ExperimentLoader = ({ loading }: { loading: string }) => (
  <div className="flex h-[calc(100vh-3.5rem)] w-full items-center justify-center bg-[#050505]">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="h-px w-28 overflow-hidden bg-white/10">
        <div className="h-full w-1/2 animate-pulse bg-white/55" />
      </div>
      <span className="text-[10px] font-mono uppercase tracking-[0.32em] text-white/38">
        {loading}
      </span>
    </div>
  </div>
);

const ExperimentCrash = ({ copy }: { copy: ViewerCopy }) => (
  <div className="w-full h-[calc(100vh-3.5rem)] flex items-center justify-center bg-[#050505]">
    <div className="flex flex-col items-center gap-4 text-center px-6">
      <div className="w-12 h-12 rounded-full border border-red-500/30 flex items-center justify-center">
        <span className="text-red-400 text-lg">!</span>
      </div>
      <h3 className="text-sm font-mono text-white/60">{copy.crashTitle}</h3>
      <p className="text-xs text-white/30 max-w-xs">
        {copy.crashDescription}
      </p>
      <div className="flex gap-3 mt-2">
        <button
          onClick={() => window.location.reload()}
          className="text-[10px] font-mono text-white/50 border border-white/10 px-4 py-2 rounded hover:border-white/30 hover:text-white/80 transition-colors"
        >
          {copy.reload}
        </button>
        <Link
          to="/playground"
          className="text-[10px] font-mono text-white/50 border border-white/10 px-4 py-2 rounded hover:border-white/30 hover:text-white/80 transition-colors"
        >
          {copy.backToPlayground}
        </Link>
      </div>
    </div>
  </div>
);

export const ExperimentView = () => {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const experiment = experiments.find((e) => e.id === id);

  if (!experiment) {
    return <Navigate to="/playground" replace />;
  }

  const ExperimentComponent = experiment.component;
  const isBikeCargo = experiment.id === 'bike-cargo';

  return (
    <div className="w-full h-[calc(100vh-3.5rem)] relative">
      <ErrorBoundary fallback={<ExperimentCrash copy={t.playground.viewer} />}>
        {isBikeCargo ? (
          <BikeCargoEntry />
        ) : (
          <Suspense fallback={<ExperimentLoader loading={t.playground.viewer.loading} />}>
            <ExperimentComponent />
          </Suspense>
        )}
      </ErrorBoundary>
    </div>
  );
};
