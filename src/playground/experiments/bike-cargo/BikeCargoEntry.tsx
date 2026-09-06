import { useCallback, useEffect, useMemo, useState } from 'react';
import { ORANGE_CARGO_LOGO_URL } from './config';

type BikeCargoModule = typeof import('./index');
type BikeCargoComponent = BikeCargoModule['default'];

type BootPhase = 'loading' | 'revealing' | 'ready';
type BootAssetCategory = 'images' | '3d' | 'branding';

type BootAsset = {
  category: BootAssetCategory;
  label: string;
  url: string;
};

const BIKE_CARGO_BOOT_ASSETS: BootAsset[] = [
  { category: '3d', label: 'bike.glb', url: '/3d/bike.glb' },
  { category: '3d', label: 'dog-lowpolly.glb', url: '/3d/dog-lowpolly.glb' },
  { category: 'branding', label: 'orangecargo.png', url: ORANGE_CARGO_LOGO_URL },
  { category: 'images', label: 'gallery-01.webp', url: '/lab/bike/gallery/01.webp' },
  { category: 'images', label: 'gallery-02.webp', url: '/lab/bike/gallery/02.webp' },
  { category: 'images', label: 'gallery-03.webp', url: '/lab/bike/gallery/03.webp' },
  { category: 'images', label: 'gallery-04.png', url: '/lab/bike/gallery/04.png' },
  { category: 'images', label: 'gallery-05.png', url: '/lab/bike/gallery/05.png' },
  { category: 'images', label: 'gallery-06.png', url: '/lab/bike/gallery/06.png' },
  { category: 'images', label: 'gallery-07.png', url: '/lab/bike/gallery/07.png' },
];

function formatBootCategories(categories: BootAssetCategory[]) {
  const labels = categories.map((category) => {
    if (category === '3d') return '3d';
    if (category === 'branding') return 'branding';
    return 'images';
  });

  return labels.join(', ');
}

async function preloadBootAsset(
  asset: BootAsset,
  onProgress: (loadedDelta: number, totalDelta: number) => void,
) {
  const response = await fetch(asset.url, { cache: 'force-cache' });
  if (!response.ok) {
    throw new Error(`Nao foi possivel carregar ${asset.label}.`);
  }

  const contentLength = Number(response.headers.get('content-length')) || 0;
  if (contentLength > 0) {
    onProgress(0, contentLength);
  }

  if (!response.body) {
    const blob = await response.blob();
    if (contentLength === 0) {
      onProgress(0, blob.size);
      onProgress(blob.size, 0);
    } else {
      onProgress(blob.size, 0);
    }
    return;
  }

  const reader = response.body.getReader();
  let loaded = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunkLength = value.byteLength;
    loaded += chunkLength;
    onProgress(chunkLength, 0);
  }

  if (contentLength === 0 && loaded > 0) {
    onProgress(0, loaded);
  }
}

function BikeCargoBootLoader({
  activeLabel,
  categoriesLabel,
  phase,
  progress,
}: {
  activeLabel: string;
  categoriesLabel: string;
  phase: BootPhase;
  progress: number;
}) {
  const isRevealing = phase === 'revealing';

  return (
    <div className="pointer-events-none fixed inset-0 z-[120] overflow-hidden">
      <div
        className={`absolute inset-x-0 top-0 h-1/2 bg-[#f0dfca] transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isRevealing ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="absolute bottom-0 left-0 h-px w-full bg-[#efb47d]/42" />
      </div>
      <div
        className={`absolute inset-x-0 bottom-0 h-1/2 bg-[#f0dfca] transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isRevealing ? 'translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="absolute left-0 top-0 h-px w-full bg-[#efb47d]/42" />
      </div>

      <div className="absolute left-0 top-1/2 h-[3px] w-full -translate-y-1/2 bg-[#efb47d]/42" />
      <div
        className={`absolute left-0 top-1/2 h-[3px] -translate-y-1/2 bg-[#ff7a00] shadow-[0_0_22px_rgba(255,122,0,0.35)] transition-[width,opacity] duration-300 ease-out ${
          isRevealing ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ width: `${progress}%` }}
      />

      <div
        className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 translate-y-8 flex-col items-center text-center transition-all duration-500 ease-out sm:translate-y-10 ${
          isRevealing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <span className="text-[clamp(2rem,7vw,4.35rem)] font-medium leading-none tracking-[-0.08em] text-[#eb6b00]">
          {progress}%
        </span>
        <span className="mt-5 text-[11px] font-mono uppercase tracking-[0.34em] text-[#b56932]">
          Loading files, {categoriesLabel}
        </span>
        <span className="mt-2 max-w-[18rem] text-[10px] font-mono uppercase tracking-[0.24em] text-[#b56932]/78">
          {activeLabel}
        </span>
      </div>
    </div>
  );
}

export function BikeCargoEntry() {
  const [phase, setPhase] = useState<BootPhase>('loading');
  const [progress, setProgress] = useState(0);
  const [activeLabel, setActiveLabel] = useState('starting experience');
  const [bootReady, setBootReady] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [Component, setComponent] = useState<BikeCargoComponent | null>(null);
  const handleSceneReady = useCallback(() => {
    setSceneReady(true);
  }, []);

  const categoriesLabel = useMemo(
    () => formatBootCategories(Array.from(new Set(BIKE_CARGO_BOOT_ASSETS.map((asset) => asset.category)))),
    [],
  );

  useEffect(() => {
    let mounted = true;
    let loadedBytes = 0;
    let totalBytes = 0;
    let bootFailSafeTimer = 0;

    const updateProgress = (loadedDelta: number, totalDelta: number) => {
      loadedBytes += loadedDelta;
      totalBytes += totalDelta;
      if (!mounted) return;

      if (totalBytes <= 0) return;
      setProgress(Math.max(0, Math.min(100, Math.round((loadedBytes / totalBytes) * 100))));
    };

    const load = async () => {
      try {
        const componentPromise = import('./index').then((module) => {
          if (mounted) setComponent(() => module.default);
          return module;
        });

        await Promise.all(
          BIKE_CARGO_BOOT_ASSETS.map(async (asset) => {
            if (!mounted) return;
            setActiveLabel(asset.label);
            await preloadBootAsset(asset, updateProgress);
          }),
        );

        await componentPromise;
        if (!mounted) return;
        setActiveLabel('launching scene');
        setProgress(100);
        setBootReady(true);
      } catch {
        if (!mounted) return;
        setActiveLabel('launching scene');
        setProgress(100);
        setBootReady(true);
      }
    };

    bootFailSafeTimer = window.setTimeout(() => {
      if (!mounted) return;
      setActiveLabel('launching scene');
      setProgress(100);
      setBootReady(true);
    }, 4500);

    void load();

    return () => {
      mounted = false;
      window.clearTimeout(bootFailSafeTimer);
    };
  }, []);

  useEffect(() => {
    if (!bootReady || sceneReady) return;

    setActiveLabel('rendering 3d scene');

    const sceneFailSafeTimer = window.setTimeout(() => {
      setActiveLabel('launching scene');
      setSceneReady(true);
    }, 12000);

    return () => {
      window.clearTimeout(sceneFailSafeTimer);
    };
  }, [bootReady, sceneReady]);

  useEffect(() => {
    if (!bootReady || !sceneReady || phase !== 'loading') return;

    const revealTimer = window.setTimeout(() => {
      setPhase('revealing');
    }, 120);

    const readyTimer = window.setTimeout(() => {
      setPhase('ready');
    }, 1180);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(readyTimer);
    };
  }, [bootReady, phase, sceneReady]);

  return (
    <div className="relative h-full min-h-screen w-full overflow-hidden bg-transparent">
      {Component ? (
        <div
          className={`relative z-[1] h-full w-full isolate transition-opacity duration-500 ${
            phase === 'loading' ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <Component externalLoader onSceneReady={handleSceneReady} />
        </div>
      ) : null}
      {phase !== 'ready' && (
        <BikeCargoBootLoader
          activeLabel={activeLabel}
          categoriesLabel={categoriesLabel}
          phase={phase}
          progress={progress}
        />
      )}
    </div>
  );
}
