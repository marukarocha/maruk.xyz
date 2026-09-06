import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { experiments } from './registry';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../i18n/useLanguage';

const statusColors = {
  live: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  wip: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  concept: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export const PlaygroundIndex = () => {
  const { t } = useLanguage();
  const localizedExperiments = t.playground.experiments;
  const webExperimentIds = experiments
    .filter((exp) => exp.tags.includes('landing-page'))
    .map((exp) => exp.id);
  const featuredExperiments = experiments.filter((exp) => !webExperimentIds.includes(exp.id));
  const webExperiments = experiments.filter((exp) => webExperimentIds.includes(exp.id));
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredSlideId, setHoveredSlideId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [videoReadyMap, setVideoReadyMap] = useState<Record<string, boolean>>({});
  const sliderSectionRef = useRef<HTMLDivElement | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const slideRefs = useRef<Array<HTMLElement | null>>([]);
  const wheelLockTimeoutRef = useRef<number | null>(null);
  const justDraggedRef = useRef(false);
  const dragStateRef = useRef({
    isPointerDown: false,
    startX: 0,
    startScrollLeft: 0,
    hasDragged: false,
  });
  const totalSlides = featuredExperiments.length + 1;

  const getNearestSlideIndex = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider) return 0;

    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    const sliderCenter = slider.scrollLeft + slider.clientWidth / 2;

    slideRefs.current.forEach((slide, index) => {
      if (!slide) return;
      const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
      const distance = Math.abs(slideCenter - sliderCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    return nearestIndex;
  }, []);

  const goToSlide = useCallback((index: number) => {
    const slider = sliderRef.current;
    const clamped = Math.min(Math.max(index, 0), totalSlides - 1);
    const node = slideRefs.current[clamped];
    if (!slider || !node) return;

    // Horizontal-only centering to avoid any vertical page jump/flicker.
    const targetLeft = node.offsetLeft + node.clientWidth / 2 - slider.clientWidth / 2;
    const maxLeft = Math.max(0, slider.scrollWidth - slider.clientWidth);
    const safeLeft = Math.min(Math.max(targetLeft, 0), maxLeft);

    slider.scrollTo({ left: safeLeft, behavior: 'smooth' });
    setActiveIndex(clamped);
  }, [totalSlides]);

  const handleSliderScroll = useCallback(() => {
    setActiveIndex(getNearestSlideIndex());
  }, [getNearestSlideIndex]);

  useEffect(() => {
    const handleWindowWheel = (event: WheelEvent) => {
      const sliderSection = sliderSectionRef.current;
      if (!sliderSection) return;

      const dominantDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(dominantDelta) < 8) return;

      const rect = sliderSection.getBoundingClientRect();
      const lockLineY = Math.max(96, Math.min(180, window.innerHeight * 0.18));
      const sectionAtFocusPosition = rect.top <= lockLineY && rect.bottom >= lockLineY;
      if (!sectionAtFocusPosition) return;

      const direction = dominantDelta > 0 ? 1 : -1;
      const nextIndex = activeIndex + direction;
      const canNavigateSlides = nextIndex >= 0 && nextIndex <= totalSlides - 1;

      // While there are slides to consume in this direction, keep page position and move slides.
      if (!canNavigateSlides) return;

      event.preventDefault();
      if (wheelLockTimeoutRef.current !== null) return;

      goToSlide(nextIndex);

      wheelLockTimeoutRef.current = window.setTimeout(() => {
        wheelLockTimeoutRef.current = null;
      }, 360);
    };

    window.addEventListener('wheel', handleWindowWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWindowWheel);
      if (wheelLockTimeoutRef.current !== null) {
        window.clearTimeout(wheelLockTimeoutRef.current);
        wheelLockTimeoutRef.current = null;
      }
    };
  }, [activeIndex, goToSlide, totalSlides]);

  useEffect(() => {
    featuredExperiments.forEach((exp, index) => {
      if (!exp.previewVideo) return;
      const video = videoRefs.current[exp.id];
      if (!video) return;

      const shouldPlay = hoveredSlideId === exp.id || activeIndex === index;
      if (!shouldPlay) {
        video.pause();
        return;
      }

      const playPromise = video.play();
      if (playPromise) {
        playPromise.catch(() => {
          // autoplay can be blocked temporarily; keep image fallback visible
        });
      }
    });
  }, [activeIndex, featuredExperiments, hoveredSlideId]);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const slider = sliderRef.current;
    if (!slider) return;

    dragStateRef.current.isPointerDown = true;
    dragStateRef.current.startX = event.clientX;
    dragStateRef.current.startScrollLeft = slider.scrollLeft;
    dragStateRef.current.hasDragged = false;
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.isPointerDown) return;
    const slider = sliderRef.current;
    if (!slider) return;

    const deltaX = event.clientX - dragStateRef.current.startX;
    if (Math.abs(deltaX) > 6) {
      dragStateRef.current.hasDragged = true;
    }

    slider.scrollLeft = dragStateRef.current.startScrollLeft - deltaX;
  }, []);

  const handlePointerEnd = useCallback(() => {
    if (!dragStateRef.current.isPointerDown) return;
    dragStateRef.current.isPointerDown = false;
    setIsDragging(false);

    if (dragStateRef.current.hasDragged) {
      justDraggedRef.current = true;
      window.setTimeout(() => {
        justDraggedRef.current = false;
      }, 240);
      goToSlide(getNearestSlideIndex());
    }
  }, [getNearestSlideIndex, goToSlide]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      {/* Header */}
      <div className="mb-16">
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-white/30 mb-4">
          {t.playground.index.kicker}
        </p>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white/90 mb-4">
          {t.playground.index.title}
        </h1>
        <p className="text-lg text-white/40 max-w-xl leading-relaxed font-light">
          {t.playground.index.description}
        </p>
      </div>

      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
        <div className="px-6 md:px-10 lg:px-16">
          {/* Slider controls */}
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/35">
              {t.playground.index.slideLabel} {activeIndex + 1}/{totalSlides}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToSlide(activeIndex - 1)}
                disabled={activeIndex === 0}
                aria-label={t.playground.index.previous}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/65 transition-colors hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => goToSlide(activeIndex + 1)}
                disabled={activeIndex === totalSlides - 1}
                aria-label={t.playground.index.next}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/65 transition-colors hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Experiment slider */}
          <div ref={sliderSectionRef} className="relative">
            <button
              type="button"
              onClick={() => goToSlide(activeIndex - 1)}
              className="absolute left-0 top-0 z-20 h-full w-14 md:w-24 bg-gradient-to-r from-black/45 to-transparent transition-opacity hover:opacity-90"
              aria-label={t.playground.index.previous}
            />
            <button
              type="button"
              onClick={() => goToSlide(activeIndex + 1)}
              className="absolute right-0 top-0 z-20 h-full w-14 md:w-24 bg-gradient-to-l from-black/45 to-transparent transition-opacity hover:opacity-90"
              aria-label={t.playground.index.next}
            />
            <div
              ref={sliderRef}
              onScroll={handleSliderScroll}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
              className={`flex snap-x snap-mandatory gap-5 overflow-x-auto py-2 scroll-smooth select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              style={{ touchAction: 'pan-y' }}
            >
              {featuredExperiments.map((exp, index) => {
                const localized = localizedExperiments[exp.id as keyof typeof localizedExperiments];
                const title = localized?.title ?? exp.title;
                const description = localized?.description ?? exp.description;
                const shouldPlayPreview = hoveredSlideId === exp.id || activeIndex === index;
                const isVideoReady = Boolean(videoReadyMap[exp.id]);
                const showVideoPreview = Boolean(exp.previewVideo && shouldPlayPreview && isVideoReady);
                const distanceFromActive = Math.abs(index - activeIndex);
                const emphasisClass =
                  distanceFromActive === 0
                    ? 'z-10 opacity-100 scale-[1.03]'
                    : distanceFromActive === 1
                      ? 'z-0 opacity-38 scale-[0.86]'
                      : 'z-0 opacity-16 scale-[0.74]';

                return (
                  <Link
                    key={exp.id}
                    ref={(node) => { slideRefs.current[index] = node; }}
                    to={`/playground/${exp.id}`}
                    onClickCapture={(event) => {
                      if (!justDraggedRef.current) return;
                      event.preventDefault();
                      event.stopPropagation();
                      justDraggedRef.current = false;
                    }}
                    onMouseEnter={() => setHoveredSlideId(exp.id)}
                    onMouseLeave={() => setHoveredSlideId((current) => (current === exp.id ? null : current))}
                    onFocus={() => setHoveredSlideId(exp.id)}
                    onBlur={() => setHoveredSlideId((current) => (current === exp.id ? null : current))}
                    className={`group relative h-[620px] md:h-[560px] lg:h-[640px] w-[90%] md:w-[84%] lg:w-[80%] shrink-0 snap-center overflow-hidden rounded-2xl border border-white/[0.1] bg-black/40 transform-gpu transition-all duration-500 hover:border-white/[0.22] ${emphasisClass}`}
                  >
                    {(exp.thumbnail || exp.previewVideo) && (
                      <div className="relative h-[420px] md:absolute md:inset-0 md:h-full">
                        {exp.thumbnail && (
                          <img
                            src={exp.thumbnail}
                            alt={title}
                            className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ${showVideoPreview ? 'opacity-0' : 'opacity-100'} md:group-hover:scale-[1.03]`}
                            loading="lazy"
                          />
                        )}
                        {exp.previewVideo && (
                          <video
                            ref={(node) => {
                              videoRefs.current[exp.id] = node;
                            }}
                            src={exp.previewVideo}
                            muted
                            loop
                            playsInline
                            preload="auto"
                            onLoadedData={() => {
                              setVideoReadyMap((prev) => (prev[exp.id] ? prev : { ...prev, [exp.id]: true }));
                            }}
                            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${showVideoPreview ? 'opacity-100' : 'opacity-0'} pointer-events-none`}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:hidden" />
                      </div>
                    )}
                    <div className="absolute inset-0 hidden bg-gradient-to-r from-black/68 via-black/20 to-transparent md:block" />
                    <div className="absolute inset-0 hidden bg-gradient-to-t from-black/55 via-transparent to-transparent md:block" />

                    <div className="relative z-10 border-t border-white/10 bg-[#080808]/95 p-5 md:hidden">
                      <div className="mb-4 flex items-center">
                        <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusColors[exp.status]}`}>
                          {t.playground.statusLabels[exp.status]}
                        </span>
                      </div>
                      <h3 className="mb-2 flex items-center gap-2 text-xl font-semibold text-white/90">
                        {title}
                        <ArrowUpRight size={16} className="translate-x-0.5 -translate-y-0.5 opacity-70" />
                      </h3>
                      <p className="mb-4 text-[15px] leading-relaxed text-white/72">
                        {description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {exp.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-white/[0.08] px-2 py-0.5 text-[10px] font-mono text-white/62"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 hidden h-[48%] border-t border-white/10 bg-black/55 p-5 backdrop-blur-sm md:inset-y-0 md:left-auto md:right-0 md:block md:h-full md:w-1/3 md:border-l md:border-t-0 md:p-7">
                      {/* Status badge */}
                      <div className="mb-4 flex items-center">
                        <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusColors[exp.status]}`}>
                          {t.playground.statusLabels[exp.status]}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="mb-2 flex items-center gap-2 text-xl font-semibold text-white/90 transition-colors group-hover:text-white md:text-2xl">
                        {title}
                        <ArrowUpRight
                          size={16}
                          className="translate-x-0.5 -translate-y-0.5 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
                        />
                      </h3>

                      {/* Description */}
                      <p className="mb-4 text-sm leading-relaxed text-white/70 md:text-[15px]">
                        {description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {exp.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-white/[0.08] px-2 py-0.5 text-[10px] font-mono text-white/62"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Hover glow */}
                    <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </Link>
                );
              })}

              {/* Placeholder card for future experiments */}
                <div
                  ref={(node) => { slideRefs.current[featuredExperiments.length] = node; }}
                  className={`h-[620px] md:h-[560px] lg:h-[640px] w-[90%] md:w-[84%] lg:w-[80%] shrink-0 snap-center rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.02] p-6 flex flex-col items-center justify-center transform-gpu transition-all duration-500 ${activeIndex === featuredExperiments.length ? 'z-10 opacity-100 scale-[1.03]' : 'z-0 opacity-22 scale-[0.82]'}`}
                >
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center mb-3">
                  <span className="text-white/20 text-lg">+</span>
                </div>
                <p className="text-xs font-mono text-white/15 uppercase tracking-widest">
                  {t.playground.index.comingSoon}
                </p>
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={`slide-dot-${index}`}
                type="button"
                onClick={() => goToSlide(index)}
                aria-label={`${t.playground.index.slideLabel} ${index + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-7 bg-white/80' : 'w-3 bg-white/24 hover:bg-white/45'}`}
              />
            ))}
          </div>

          {webExperiments.length > 0 && (
            <div className="mt-20 border-t border-white/10 pt-10">
              <div className="mb-6 max-w-2xl">
                <p className="text-[10px] font-mono uppercase tracking-[0.32em] text-white/28">
                  {t.playground.index.webListKicker}
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white/88 md:text-3xl">
                  {t.playground.index.webListTitle}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/42 md:text-[15px]">
                  {t.playground.index.webListDescription}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {webExperiments.map((exp) => {
                  const localized = localizedExperiments[exp.id as keyof typeof localizedExperiments];
                  const title = localized?.title ?? exp.title;
                  const description = localized?.description ?? exp.description;

                  return (
                    <Link
                      key={exp.id}
                      to={`/playground/${exp.id}`}
                      className="group flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 transition-colors hover:border-white/25 hover:bg-white/[0.04]"
                    >
                      <div>
                        <div className="mb-3 flex items-center gap-3">
                          <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusColors[exp.status]}`}>
                            {t.playground.statusLabels[exp.status]}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-white/88 transition-colors group-hover:text-white">
                          {title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-white/56">
                          {description}
                        </p>
                      </div>
                      <ArrowUpRight size={18} className="mt-1 shrink-0 text-white/46 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white/80" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
