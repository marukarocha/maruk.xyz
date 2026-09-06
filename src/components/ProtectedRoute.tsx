import { type ReactNode, useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedPaths?: string[];
}

export const ProtectedRoute = ({
  children,
  allowedPaths = [],
}: ProtectedRouteProps) => {
  const params = useParams();
  const experimentId = params.id;
  const [isAuthenticated, setIsAuthenticated] = useState(() => (
    experimentId ? localStorage.getItem(`lab_auth_${experimentId}`) === 'true' : false
  ));

  const needsProtection = Boolean(experimentId && allowedPaths.includes(experimentId));

  useEffect(() => {
    if (!experimentId) {
      return;
    }

    const storedAuth = localStorage.getItem(`lab_auth_${experimentId}`);
    setIsAuthenticated(storedAuth === 'true');
  }, [experimentId]);

  const handleLogout = () => {
    setIsAuthenticated(false);

    if (experimentId) {
      localStorage.removeItem(`lab_auth_${experimentId}`);
    }
  };

  if (!needsProtection) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/playground/${experimentId}/login`} replace />;
  }

  return (
    <div className="relative">
      <button
        onClick={handleLogout}
        className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-xs font-mono uppercase tracking-wider text-white/60 transition-colors duration-200 hover:border-white/30 hover:text-white/90"
        title="Sair da área protegida"
      >
        <span>SAIR</span>
      </button>

      {children}
    </div>
  );
};
