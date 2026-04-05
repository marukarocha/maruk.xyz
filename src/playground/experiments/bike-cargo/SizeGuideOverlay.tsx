import { useEffect, useRef } from 'react';
import gsap from 'gsap';

type SizeGuideOverlayProps = {
  active: boolean;
  isDark: boolean;
};

const CAMERA_SETTLE_DELAY = 1.08;
const GUIDE_STROKE_WIDTH = 2.5;
const GUIDE_DASH = '14 10';
const LENGTH_LINE = { x1: 154, y1: 688, x2: 850, y2: 688 };
const WIDTH_LINE = { x1: 232, y1: 184, x2: 232, y2: 556 };
const LENGTH_TICK = {
  start: { x: LENGTH_LINE.x1, y1: LENGTH_LINE.y1 - 38, y2: LENGTH_LINE.y1 + 38 },
  end: { x: LENGTH_LINE.x2, y1: LENGTH_LINE.y1 - 38, y2: LENGTH_LINE.y1 + 38 },
};
const WIDTH_TICK = {
  top: { x1: WIDTH_LINE.x1 - 36, x2: WIDTH_LINE.x1 + 36, y: WIDTH_LINE.y1 },
  bottom: { x1: WIDTH_LINE.x1 - 36, x2: WIDTH_LINE.x1 + 36, y: WIDTH_LINE.y2 },
};
const LENGTH_LABEL = {
  x: (LENGTH_LINE.x1 + LENGTH_LINE.x2) / 2,
  y: LENGTH_LINE.y1 - 2,
  width: 188,
  height: 88,
};
const WIDTH_LABEL = {
  x: WIDTH_LINE.x1 + 138,
  y: (WIDTH_LINE.y1 + WIDTH_LINE.y2) / 2,
  width: 150,
  height: 80,
};

const SizeGuideOverlay = ({ active, isDark }: SizeGuideOverlayProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const lengthLineRef = useRef<SVGLineElement | null>(null);
  const lengthTickStartRef = useRef<SVGLineElement | null>(null);
  const lengthTickEndRef = useRef<SVGLineElement | null>(null);
  const widthLineRef = useRef<SVGLineElement | null>(null);
  const widthTickTopRef = useRef<SVGLineElement | null>(null);
  const widthTickBottomRef = useRef<SVGLineElement | null>(null);
  const lengthLabelRef = useRef<SVGGElement | null>(null);
  const widthLabelRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const lengthLine = lengthLineRef.current;
    const lengthTickStart = lengthTickStartRef.current;
    const lengthTickEnd = lengthTickEndRef.current;
    const widthLine = widthLineRef.current;
    const widthTickTop = widthTickTopRef.current;
    const widthTickBottom = widthTickBottomRef.current;
    const lengthLabel = lengthLabelRef.current;
    const widthLabel = widthLabelRef.current;

    if (
      !root ||
      !lengthLine ||
      !lengthTickStart ||
      !lengthTickEnd ||
      !widthLine ||
      !widthTickTop ||
      !widthTickBottom ||
      !lengthLabel ||
      !widthLabel
    ) {
      return;
    }

    gsap.killTweensOf([
      root,
      lengthLine,
      lengthTickStart,
      lengthTickEnd,
      widthLine,
      widthTickTop,
      widthTickBottom,
      lengthLabel,
      widthLabel,
    ]);

    if (active) {
      gsap.set(root, { opacity: 1 });
      gsap.set(lengthLine, {
        attr: { x1: LENGTH_LINE.x1, y1: LENGTH_LINE.y1, x2: LENGTH_LINE.x1, y2: LENGTH_LINE.y1 },
      });
      gsap.set(widthLine, {
        attr: { x1: WIDTH_LINE.x1, y1: WIDTH_LINE.y1, x2: WIDTH_LINE.x1, y2: WIDTH_LINE.y1 },
      });
      gsap.set([lengthTickStart, lengthTickEnd, widthTickTop, widthTickBottom], { opacity: 0 });
      gsap.set(lengthLabel, { opacity: 0, y: 18 });
      gsap.set(widthLabel, { opacity: 0, y: 18 });

      const timeline = gsap.timeline();
      timeline
        .to(lengthLine, {
          attr: { x2: LENGTH_LINE.x2, y2: LENGTH_LINE.y2 },
          duration: 0.52,
          ease: 'power3.out',
          delay: CAMERA_SETTLE_DELAY,
        })
        .to(
          [lengthTickStart, lengthTickEnd],
          {
            opacity: 1,
            duration: 0.1,
            stagger: 0.06,
            ease: 'power2.out',
          },
          '+=0.02',
        )
        .to(
          lengthLabel,
          {
            opacity: 1,
            y: 0,
            duration: 0.24,
            ease: 'power3.out',
          },
          '-=0.04',
        )
        .to(
          widthLine,
          {
            attr: { x2: WIDTH_LINE.x2, y2: WIDTH_LINE.y2 },
            duration: 0.44,
            ease: 'power3.out',
          },
          '-=0.02',
        )
        .to(
          [widthTickTop, widthTickBottom],
          {
            opacity: 1,
            duration: 0.1,
            stagger: 0.06,
            ease: 'power2.out',
          },
          '+=0.02',
        )
        .to(
          widthLabel,
          {
            opacity: 1,
            y: 0,
            duration: 0.22,
            ease: 'power3.out',
          },
          '-=0.04',
        );

      return () => {
        timeline.kill();
      };
    }

    const exit = gsap.timeline();
    exit
      .to([widthLabel, lengthLabel], {
        opacity: 0,
        duration: 0.18,
        ease: 'power2.in',
        stagger: 0.04,
      })
      .to(
        [widthTickTop, widthTickBottom, lengthTickStart, lengthTickEnd],
        {
          opacity: 0,
          duration: 0.16,
          ease: 'power2.in',
          stagger: 0.02,
        },
        0,
      )
      .to(
        widthLine,
        {
          attr: { x2: WIDTH_LINE.x1, y2: WIDTH_LINE.y1 },
          duration: 0.24,
          ease: 'power2.in',
        },
        0.04,
      )
      .to(
        lengthLine,
        {
          attr: { x2: LENGTH_LINE.x1, y2: LENGTH_LINE.y1 },
          duration: 0.24,
          ease: 'power2.in',
        },
        0.08,
      )
      .to(
        root,
        {
          opacity: 0,
          duration: 0.18,
          ease: 'power2.out',
        },
        0.14,
      );

    return () => {
      exit.kill();
    };
  }, [active]);

  const stroke = isDark ? 'rgba(166,221,255,0.98)' : 'rgba(72,136,198,0.92)';
  const labelFill = isDark ? 'rgba(7,18,31,0.84)' : 'rgba(244,250,255,0.95)';
  const labelStroke = isDark ? 'rgba(138,204,255,0.28)' : 'rgba(113,172,226,0.26)';
  const eyebrowFill = isDark ? 'rgba(188,225,255,0.72)' : 'rgba(82,131,181,0.72)';
  const valueFill = isDark ? '#f5fbff' : '#28588c';

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 z-[52] flex items-center justify-center opacity-0">
      <div className="relative h-[min(82vh,760px)] w-[min(78vw,980px)]">
        <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 980 760" fill="none" aria-hidden="true">
          <line
            ref={lengthLineRef}
            x1={String(LENGTH_LINE.x1)}
            y1={String(LENGTH_LINE.y1)}
            x2={String(LENGTH_LINE.x2)}
            y2={String(LENGTH_LINE.y2)}
            stroke={stroke}
            strokeWidth={String(GUIDE_STROKE_WIDTH)}
            strokeLinecap="round"
            strokeDasharray={GUIDE_DASH}
          />
          <line
            ref={lengthTickStartRef}
            x1={String(LENGTH_TICK.start.x)}
            y1={String(LENGTH_TICK.start.y1)}
            x2={String(LENGTH_TICK.start.x)}
            y2={String(LENGTH_TICK.start.y2)}
            stroke={stroke}
            strokeWidth={String(GUIDE_STROKE_WIDTH)}
            strokeLinecap="round"
            strokeDasharray={GUIDE_DASH}
          />
          <line
            ref={lengthTickEndRef}
            x1={String(LENGTH_TICK.end.x)}
            y1={String(LENGTH_TICK.end.y1)}
            x2={String(LENGTH_TICK.end.x)}
            y2={String(LENGTH_TICK.end.y2)}
            stroke={stroke}
            strokeWidth={String(GUIDE_STROKE_WIDTH)}
            strokeLinecap="round"
            strokeDasharray={GUIDE_DASH}
          />

          <line
            ref={widthLineRef}
            x1={String(WIDTH_LINE.x1)}
            y1={String(WIDTH_LINE.y1)}
            x2={String(WIDTH_LINE.x2)}
            y2={String(WIDTH_LINE.y2)}
            stroke={stroke}
            strokeWidth={String(GUIDE_STROKE_WIDTH)}
            strokeLinecap="round"
            strokeDasharray={GUIDE_DASH}
          />
          <line
            ref={widthTickTopRef}
            x1={String(WIDTH_TICK.top.x1)}
            y1={String(WIDTH_TICK.top.y)}
            x2={String(WIDTH_TICK.top.x2)}
            y2={String(WIDTH_TICK.top.y)}
            stroke={stroke}
            strokeWidth={String(GUIDE_STROKE_WIDTH)}
            strokeLinecap="round"
            strokeDasharray={GUIDE_DASH}
          />
          <line
            ref={widthTickBottomRef}
            x1={String(WIDTH_TICK.bottom.x1)}
            y1={String(WIDTH_TICK.bottom.y)}
            x2={String(WIDTH_TICK.bottom.x2)}
            y2={String(WIDTH_TICK.bottom.y)}
            stroke={stroke}
            strokeWidth={String(GUIDE_STROKE_WIDTH)}
            strokeLinecap="round"
            strokeDasharray={GUIDE_DASH}
          />

          <g transform={`translate(${LENGTH_LABEL.x} ${LENGTH_LABEL.y})`}>
            <g ref={lengthLabelRef}>
              <rect
                x={String(-LENGTH_LABEL.width / 2)}
                y={String(-LENGTH_LABEL.height / 2)}
                width={String(LENGTH_LABEL.width)}
                height={String(LENGTH_LABEL.height)}
                rx="26"
                fill={labelFill}
                stroke={labelStroke}
                strokeWidth="1.5"
              />
              <text
                x="0"
                y="-10"
                fill={eyebrowFill}
                textAnchor="middle"
                fontSize="10"
                letterSpacing="3.2"
                style={{ textTransform: 'uppercase' }}
              >
                COMPRIMENTO
              </text>
              <text x="0" y="27" fill={valueFill} textAnchor="middle" fontSize="28" fontWeight="900">
                2,60 m
              </text>
            </g>
          </g>

          <g transform={`translate(${WIDTH_LABEL.x} ${WIDTH_LABEL.y})`}>
            <g ref={widthLabelRef}>
              <rect
                x={String(-WIDTH_LABEL.width / 2)}
                y={String(-WIDTH_LABEL.height / 2)}
                width={String(WIDTH_LABEL.width)}
                height={String(WIDTH_LABEL.height)}
                rx="24"
                fill={labelFill}
                stroke={labelStroke}
                strokeWidth="1.5"
              />
              <text
                x="0"
                y="-8"
                fill={eyebrowFill}
                textAnchor="middle"
                fontSize="10"
                letterSpacing="3.2"
                style={{ textTransform: 'uppercase' }}
              >
                LARGURA
              </text>
              <text x="0" y="23" fill={valueFill} textAnchor="middle" fontSize="22" fontWeight="900">
                0,70 m
              </text>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default SizeGuideOverlay;
