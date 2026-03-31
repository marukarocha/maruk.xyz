import { useEffect, useRef } from 'react';
import gsap from 'gsap';

type SizeGuideOverlayProps = {
  active: boolean;
  isDark: boolean;
};

const CAMERA_SETTLE_DELAY = 1.08;
const LENGTH_PATH = 620;
const WIDTH_PATH = 320;
const LENGTH_LINE = { x1: 204, y1: 682, x2: 810, y2: 682 };
const WIDTH_LINE = { x1: 250, y1: 210, x2: 250, y2: 530 };
const LENGTH_LABEL = {
  x: (LENGTH_LINE.x1 + LENGTH_LINE.x2) / 2,
  y: LENGTH_LINE.y1,
  width: 176,
  height: 86,
};
const WIDTH_LABEL = {
  x: WIDTH_LINE.x1 + 122,
  y: (WIDTH_LINE.y1 + WIDTH_LINE.y2) / 2,
  width: 142,
  height: 78,
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
      gsap.set(lengthLine, { strokeDasharray: LENGTH_PATH, strokeDashoffset: LENGTH_PATH });
      gsap.set(widthLine, { strokeDasharray: WIDTH_PATH, strokeDashoffset: WIDTH_PATH });
      gsap.set([lengthTickStart, lengthTickEnd, widthTickTop, widthTickBottom], { opacity: 0 });
      gsap.set(lengthLabel, { opacity: 0, y: 18 });
      gsap.set(widthLabel, { opacity: 0, y: 18 });

      const timeline = gsap.timeline();
      timeline
        .to(lengthLine, {
          strokeDashoffset: 0,
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
            strokeDashoffset: 0,
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
          strokeDashoffset: WIDTH_PATH,
          duration: 0.24,
          ease: 'power2.in',
        },
        0.04,
      )
      .to(
        lengthLine,
        {
          strokeDashoffset: LENGTH_PATH,
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

  const stroke = isDark ? 'rgba(255,209,163,0.95)' : 'rgba(168,84,22,0.9)';
  const labelFill = isDark ? 'rgba(16,10,7,0.82)' : 'rgba(255,249,242,0.94)';
  const labelStroke = isDark ? 'rgba(255,177,90,0.24)' : 'rgba(216,139,62,0.22)';
  const eyebrowFill = isDark ? 'rgba(255,216,183,0.74)' : 'rgba(124,72,29,0.72)';
  const valueFill = isDark ? '#ffd8b7' : '#7c481d';

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
            strokeWidth="6"
            strokeLinecap="round"
          />
          <line ref={lengthTickStartRef} x1="204" y1="650" x2="204" y2="714" stroke={stroke} strokeWidth="6" strokeLinecap="round" />
          <line ref={lengthTickEndRef} x1="810" y1="650" x2="810" y2="714" stroke={stroke} strokeWidth="6" strokeLinecap="round" />

          <line
            ref={widthLineRef}
            x1={String(WIDTH_LINE.x1)}
            y1={String(WIDTH_LINE.y1)}
            x2={String(WIDTH_LINE.x2)}
            y2={String(WIDTH_LINE.y2)}
            stroke={stroke}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <line ref={widthTickTopRef} x1="220" y1="210" x2="280" y2="210" stroke={stroke} strokeWidth="6" strokeLinecap="round" />
          <line ref={widthTickBottomRef} x1="220" y1="530" x2="280" y2="530" stroke={stroke} strokeWidth="6" strokeLinecap="round" />

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
