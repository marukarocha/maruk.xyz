// ── ScenePanels — DoF, Camera, Lights, Character Gizmo, Camera Director ──────
// Rendered inside the advanced controls overlay.

import * as THREE from 'three';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import type { MutableRefObject } from 'react';
import { useState } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  CAMERA_SHOTS,
  CAMERA_ANCHORS,
  DOF_PRESETS,
} from './cameraSystem';
import type { CameraDirectorAPI } from './useCameraDirector';

// ── DoF panel ────────────────────────────────────────────────────────────────
interface DoFPanelProps {
  bokehPassRef: MutableRefObject<BokehPass | null>;
}
export function DoFPanel({ bokehPassRef }: DoFPanelProps) {
  return (
    <div className="flex flex-col gap-1.5 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/5 shrink-0">
      <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest mb-0.5">Depth of Field</p>
      {([
        { label: 'Focus',    key: 'focus',   min: 0.5, max: 20,   step: 0.1,    initial: 7.3    },
        { label: 'Aperture', key: 'aperture',min: 0,   max: 0.01, step: 0.0001, initial: 0.0002 },
        { label: 'Blur',     key: 'maxblur', min: 0,   max: 0.03, step: 0.001,  initial: 0.024  },
      ] as const).map(({ label, key, min, max, step, initial }) => (
        <label key={key} className="flex items-center gap-2 text-[9px] font-mono text-white/40">
          <span className="w-14">{label}</span>
          <input
            type="range" min={min} max={max} step={step} defaultValue={initial}
            className="w-24 h-1 accent-white/50"
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              const bp = bokehPassRef.current;
              if (bp) (bp.uniforms as Record<string, { value: number }>)[key].value = val;
              const span = document.getElementById(`as-dof-${key}`);
              if (span) span.textContent = val.toFixed(step < 0.001 ? 4 : step < 0.01 ? 3 : 1);
            }}
          />
          <span className="w-12 text-right text-white/25" id={`as-dof-${key}`}>{initial}</span>
        </label>
      ))}
    </div>
  );
}

// ── Camera panel ─────────────────────────────────────────────────────────────
interface CameraPanelProps {
  cameraRef:   MutableRefObject<THREE.PerspectiveCamera | null>;
  rendererRef: MutableRefObject<THREE.WebGLRenderer | null>;
  controlsRef: MutableRefObject<OrbitControls | null>;
}
export function CameraPanel({ cameraRef, rendererRef, controlsRef }: CameraPanelProps) {
  return (
    <div className="flex flex-col gap-1.5 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/5 shrink-0">
      <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest mb-0.5">Camera</p>
      {([
        { label: 'FOV',      key: 'fov',      min: 10, max: 90, step: 1,    initial: 22  },
        { label: 'Exposure', key: 'exposure', min: 0.2,max: 3,  step: 0.05, initial: 1.6 },
      ] as const).map(({ label, key, min, max, step, initial }) => (
        <label key={key} className="flex items-center gap-2 text-[9px] font-mono text-white/40">
          <span className="w-14">{label}</span>
          <input
            type="range" min={min} max={max} step={step} defaultValue={initial}
            className="w-24 h-1 accent-white/50"
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (key === 'fov' && cameraRef.current) {
                cameraRef.current.fov = val;
                cameraRef.current.updateProjectionMatrix();
              } else if (key === 'exposure' && rendererRef.current) {
                rendererRef.current.toneMappingExposure = val;
              }
              const span = document.getElementById(`as-cam-${key}`);
              if (span) span.textContent = val.toFixed(step < 0.1 ? 2 : step < 1 ? 1 : 0);
            }}
          />
          <span className="w-12 text-right text-white/25" id={`as-cam-${key}`}>{initial}</span>
        </label>
      ))}

      <div className="h-px w-full bg-white/5 my-1" />
      <p className="text-[7px] font-mono text-white/20 uppercase tracking-widest">Position</p>
      {([
        { label: 'Pos X', key: 'cam-x', min: -10, max: 10, step: 0.1, initial: 1.27 },
        { label: 'Pos Y', key: 'cam-y', min: -5,  max: 10, step: 0.1, initial: 1.46 },
        { label: 'Pos Z', key: 'cam-z', min: -15, max: 15, step: 0.1, initial: 7.00 },
      ] as const).map(({ label, key, min, max, step, initial }) => (
        <label key={key} className="flex items-center gap-2 text-[9px] font-mono text-white/40">
          <span className="w-14">{label}</span>
          <input
            type="range" min={min} max={max} step={step} defaultValue={initial}
            className="w-24 h-1 accent-white/50"
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              const cam = cameraRef.current;
              if (!cam) return;
              if      (key === 'cam-x') cam.position.x = val;
              else if (key === 'cam-y') cam.position.y = val;
              else if (key === 'cam-z') cam.position.z = val;
              controlsRef.current?.update();
              const span = document.getElementById(`as-${key}`);
              if (span) span.textContent = val.toFixed(1);
            }}
          />
          <span className="w-12 text-right text-white/25" id={`as-${key}`}>{initial}</span>
        </label>
      ))}

      <div className="h-px w-full bg-white/5 my-1" />
      <p className="text-[7px] font-mono text-white/20 uppercase tracking-widest">Live Readout</p>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1 text-[8px] font-mono text-white/30">
          <span className="w-8 text-white/20">Pos</span>
          <span className="text-cyan-400/60"   id="as-live-cam-x">1.27</span>
          <span className="text-green-400/60"  id="as-live-cam-y">1.46</span>
          <span className="text-orange-400/60" id="as-live-cam-z">7.00</span>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-mono text-white/30">
          <span className="w-8 text-white/20">Tgt</span>
          <span className="text-cyan-400/40"   id="as-live-tgt-x">0.08</span>
          <span className="text-green-400/40"  id="as-live-tgt-y">1.01</span>
          <span className="text-orange-400/40" id="as-live-tgt-z">0.00</span>
        </div>
      </div>
    </div>
  );
}

// ── Lights panel ─────────────────────────────────────────────────────────────
interface LightsPanelProps {
  spotLightRef:    MutableRefObject<THREE.SpotLight | null>;
  ambientLightRef: MutableRefObject<THREE.AmbientLight | null>;
  backLightRef:    MutableRefObject<THREE.DirectionalLight | null>;
}
export function LightsPanel({ spotLightRef, ambientLightRef, backLightRef }: LightsPanelProps) {
  return (
    <div className="flex flex-col gap-1.5 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/5 shrink-0 max-h-[60vh] overflow-y-auto">
      <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest mb-0.5">Lights</p>
      <p className="text-[7px] font-mono text-white/20 uppercase tracking-widest">Spot</p>
      {([
        { label: 'Intensity', key: 'spot-int',   min: 0, max: 40,  step: 0.5,  initial: 9    },
        { label: 'Angle',     key: 'spot-angle', min: 0.1, max: 1.5, step: 0.05, initial: 0.35 },
      ] as const).map(({ label, key, min, max, step, initial }) => (
        <label key={key} className="flex items-center gap-2 text-[9px] font-mono text-white/40">
          <span className="w-14">{label}</span>
          <input
            type="range" min={min} max={max} step={step} defaultValue={initial}
            className="w-24 h-1 accent-white/50"
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              const s = spotLightRef.current;
              if (!s) return;
              if      (key === 'spot-int')   s.intensity = val;
              else if (key === 'spot-angle') s.angle = val;
              const span = document.getElementById(`as-lit-${key}`);
              if (span) span.textContent = val.toFixed(step < 0.1 ? 2 : 1);
            }}
          />
          <span className="w-12 text-right text-white/25" id={`as-lit-${key}`}>{initial}</span>
        </label>
      ))}
      <label className="flex items-center gap-2 text-[9px] font-mono text-white/40">
        <span className="w-14">Color</span>
        <input type="color" defaultValue="#fff5e8" className="w-6 h-4 border-0 bg-transparent cursor-pointer"
          onChange={(e) => { const s = spotLightRef.current; if (s) s.color.set(e.target.value); }} />
      </label>

      <div className="h-px w-full bg-white/5 my-1" />
      <p className="text-[7px] font-mono text-white/20 uppercase tracking-widest">Ambient</p>
      <label className="flex items-center gap-2 text-[9px] font-mono text-white/40">
        <span className="w-14">Intensity</span>
        <input type="range" min={0} max={2} step={0.01} defaultValue={0.3} className="w-24 h-1 accent-white/50"
          onChange={(e) => { const a = ambientLightRef.current; if (a) a.intensity = parseFloat(e.target.value); }} />
      </label>

      <div className="h-px w-full bg-white/5 my-1" />
      <p className="text-[7px] font-mono text-white/20 uppercase tracking-widest">Rim</p>
      <label className="flex items-center gap-2 text-[9px] font-mono text-white/40">
        <span className="w-14">Intensity</span>
        <input type="range" min={0} max={3} step={0.05} defaultValue={0.5} className="w-24 h-1 accent-white/50"
          onChange={(e) => { const b = backLightRef.current; if (b) b.intensity = parseFloat(e.target.value); }} />
      </label>
      <label className="flex items-center gap-2 text-[9px] font-mono text-white/40">
        <span className="w-14">Color</span>
        <input type="color" defaultValue="#6688ff" className="w-6 h-4 border-0 bg-transparent cursor-pointer"
          onChange={(e) => { const b = backLightRef.current; if (b) b.color.set(e.target.value); }} />
      </label>
    </div>
  );
}

// ── Character gizmo panel ─────────────────────────────────────────────────────
interface CharacterGizmoPanelProps {
  charModelRef:    MutableRefObject<THREE.Object3D | null>;
  showCharGizmo:   boolean;
  setShowCharGizmo:(v: boolean | ((prev: boolean) => boolean)) => void;
  charPos:         { x: number; y: number; z: number };
  setCharPos:      (v: { x: number; y: number; z: number }) => void;
  charScale:       number;
  setCharScale:    (v: number) => void;
  charGizmoMode:   'translate' | 'rotate' | 'scale';
  setCharGizmoMode:(v: 'translate' | 'rotate' | 'scale') => void;
  copyCharValues:  () => void;
}
export function CharacterGizmoPanel({
  charModelRef,
  showCharGizmo,
  setShowCharGizmo,
  charPos,
  setCharPos,
  charScale,
  setCharScale,
  charGizmoMode,
  setCharGizmoMode,
  copyCharValues,
}: CharacterGizmoPanelProps) {
  return (
    <div className="flex flex-col gap-1.5 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 border border-violet-400/20 shrink-0 min-w-[220px]">
      <div className="flex items-center justify-between mb-0.5">
        <p className="text-[8px] font-mono text-violet-300/60 uppercase tracking-widest">Character</p>
        <div className="flex items-center gap-1">
          {(['translate', 'rotate', 'scale'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setCharGizmoMode(mode)}
              className={`px-1.5 py-0.5 rounded text-[7px] font-mono uppercase transition-all border ${
                charGizmoMode === mode
                  ? 'bg-violet-500/20 text-violet-300 border-violet-400/30'
                  : 'text-white/25 border-white/10 hover:text-white/50 hover:border-white/20'
              }`}
            >
              {mode === 'translate' ? '↔' : mode === 'rotate' ? '↺' : '⊡'}
            </button>
          ))}
          <button
            onClick={() => setShowCharGizmo(v => !v)}
            className={`ml-1 px-2 py-0.5 rounded text-[7px] font-mono uppercase tracking-wider transition-all border ${
              showCharGizmo
                ? 'bg-violet-500/25 text-violet-200 border-violet-400/40 shadow-[0_0_8px_rgba(139,92,246,0.3)]'
                : 'text-white/30 border-white/10 hover:text-white/60 hover:border-white/20'
            }`}
          >
            {showCharGizmo ? 'Gizmo ON' : 'Gizmo OFF'}
          </button>
        </div>
      </div>

      <p className="text-[7px] font-mono text-white/20 uppercase tracking-widest">Position</p>
      {([
        { label: 'X', color: 'text-red-400/70',   axis: 'x' as const, min: -5, max: 5 },
        { label: 'Y', color: 'text-green-400/70', axis: 'y' as const, min: -2, max: 5 },
        { label: 'Z', color: 'text-blue-400/70',  axis: 'z' as const, min: -5, max: 5 },
      ]).map(({ label, color, axis, min, max }) => (
        <label key={axis} className="flex items-center gap-2 text-[9px] font-mono text-white/40">
          <span className={`w-4 font-bold ${color}`}>{label}</span>
          <input
            type="range" min={min} max={max} step={0.001}
            value={charPos[axis]}
            className="w-28 h-1 accent-violet-400/70"
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              const char = charModelRef.current;
              if (!char) return;
              char.position[axis] = val;
              setCharPos({ ...charPos, [axis]: val });
            }}
          />
          <span className={`w-14 text-right font-mono text-[8px] ${color} opacity-80`}>
            {charPos[axis].toFixed(3)}
          </span>
        </label>
      ))}

      <div className="h-px w-full bg-white/5 my-1" />
      <p className="text-[7px] font-mono text-white/20 uppercase tracking-widest">Scale</p>
      <label className="flex items-center gap-2 text-[9px] font-mono text-white/40">
        <span className="w-4 font-bold text-yellow-400/70">S</span>
        <input
          type="range" min={0.0001} max={0.05} step={0.0001}
          value={charScale}
          className="w-28 h-1 accent-yellow-400/70"
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            const char = charModelRef.current;
            if (!char) return;
            char.scale.setScalar(val);
            setCharScale(val);
          }}
        />
        <span className="w-14 text-right font-mono text-[8px] text-yellow-400/70">
          {charScale.toFixed(4)}
        </span>
      </label>

      <div className="h-px w-full bg-white/5 my-1" />
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1 text-[8px] font-mono">
          <span className="text-white/20 w-5">pos</span>
          <span className="text-red-400/60"   id="as-char-pos-x">{charPos.x.toFixed(3)}</span>
          <span className="text-green-400/60" id="as-char-pos-y">{charPos.y.toFixed(3)}</span>
          <span className="text-blue-400/60"  id="as-char-pos-z">{charPos.z.toFixed(3)}</span>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-mono">
          <span className="text-white/20 w-5">scl</span>
          <span className="text-yellow-400/60" id="as-char-scale">{charScale.toFixed(4)}</span>
        </div>
      </div>

      <button
        onClick={copyCharValues}
        className="mt-1 w-full py-1 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-400/20 hover:border-violet-400/35 text-[8px] font-mono text-violet-300/60 hover:text-violet-200 transition-all uppercase tracking-wider active:scale-95"
      >
        📋 Copy Values
      </button>
    </div>
  );
}

// ── Camera Director Panel ─────────────────────────────────────────────────────
interface CameraDirectorPanelProps {
  director:    CameraDirectorAPI;
  bokehPassRef: MutableRefObject<BokehPass | null>;
  cameraRef:   MutableRefObject<THREE.PerspectiveCamera | null>;
  controlsRef: MutableRefObject<OrbitControls | null>;
  audioTime:   number;   // current audio time (passed down for shot highlight)
}

export function CameraDirectorPanel({
  director,
  bokehPassRef,
  cameraRef,
  controlsRef,
  audioTime,
}: CameraDirectorPanelProps) {
  const [tab, setTab] = useState<'shots' | 'anchors' | 'dof'>('shots');
  const [expandedShot, setExpandedShot] = useState<string | null>(null);

  // ── Aplica um anchor diretamente na câmera ─────────────────────────────
  const applyAnchor = (name: string) => {
    const a = CAMERA_ANCHORS[name];
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;
    if (!a || !cam || !ctrl) return;
    cam.position.set(a.position.x, a.position.y, a.position.z);
    ctrl.target.set(a.target.x, a.target.y, a.target.z);
    if (a.fov) { cam.fov = a.fov; cam.updateProjectionMatrix(); }
    if (a.dof) {
      const bp = bokehPassRef.current;
      if (bp) {
        const u = bp.uniforms as Record<string, { value: number }>;
        u.focus.value    = a.dof.focus;
        u.aperture.value = a.dof.aperture;
        u.maxblur.value  = a.dof.maxblur;
      }
    }
    ctrl.update();
  };

  // ── Formata segundos → M:SS ────────────────────────────────────────────
  const fmt = (s: number) => s === Infinity ? '∞' : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  // ── Qual shot está ativo agora ─────────────────────────────────────────
  const activeShotId = CAMERA_SHOTS.find(s => audioTime >= s.from && audioTime < s.to)?.id ?? null;

  return (
    <div className="flex flex-col gap-1.5 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 border border-cyan-400/15 shrink-0 min-w-[260px] max-h-[70vh] overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between mb-0.5">
        <p className="text-[8px] font-mono text-cyan-300/60 uppercase tracking-widest">Camera Director</p>
        <div className="flex items-center gap-1">
          {(['shots', 'anchors', 'dof'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-1.5 py-0.5 rounded text-[7px] font-mono uppercase tracking-wider transition-all border ${
                tab === t
                  ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30'
                  : 'text-white/25 border-white/10 hover:text-white/50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB: SHOTS ── */}
      {tab === 'shots' && (
        <div className="flex flex-col gap-1 overflow-y-auto pr-1 max-h-[55vh]" style={{ scrollbarWidth: 'thin' }}>
          <p className="text-[7px] font-mono text-white/20 uppercase tracking-widest mb-0.5">Timeline de shots ({CAMERA_SHOTS.length})</p>

          {/* Progress bar */}
          {(() => {
            const lastFinite = CAMERA_SHOTS.filter(s => s.to !== Infinity);
            const totalDuration = lastFinite.length > 0
              ? Math.max(...lastFinite.map(s => s.to))
              : 83;
            return (
              <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden mb-1">
                {CAMERA_SHOTS.filter(s => s.to !== Infinity).map(shot => (
                  <div
                    key={shot.id}
                    className={`absolute h-full transition-all duration-200 ${
                      shot.id === activeShotId ? 'bg-cyan-400/70' : 'bg-white/15'
                    }`}
                    style={{
                      left:  `${(shot.from / totalDuration) * 100}%`,
                      width: `${((shot.to - shot.from) / totalDuration) * 100}%`,
                    }}
                  />
                ))}
                {/* playhead */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-white/60 z-10"
                  style={{ left: `${Math.min((audioTime / totalDuration) * 100, 100)}%` }}
                />
              </div>
            );
          })()}

          {/* Shot list */}
          {CAMERA_SHOTS.map((shot) => {
            const isActive  = shot.id === activeShotId;
            const isExpanded = expandedShot === shot.id;
            return (
              <div
                key={shot.id}
                className={`rounded-lg border transition-all duration-150 overflow-hidden ${
                  isActive
                    ? 'border-cyan-400/35 bg-cyan-500/10'
                    : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
              >
                {/* Shot header row */}
                <div className="flex items-center gap-2 px-2 py-1.5">
                  {/* Active indicator */}
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-cyan-400 shadow-[0_0_4px_rgba(34,211,238,0.8)]' : 'bg-white/10'}`} />

                  {/* Label + time */}
                  <div className="flex-1 min-w-0">
                    <span className={`text-[9px] font-mono font-medium ${isActive ? 'text-cyan-200' : 'text-white/50'}`}>
                      {shot.label ?? shot.id}
                    </span>
                    <span className="text-[7px] font-mono text-white/25 ml-1.5">
                      {fmt(shot.from)} → {fmt(shot.to)}
                    </span>
                  </div>

                  {/* Transition badge */}
                  {shot.transition && (
                    <span className={`text-[6px] font-mono uppercase tracking-wider px-1 py-0.5 rounded border ${
                      shot.transition.kind === 'cut'      ? 'text-red-300/50 border-red-400/20' :
                      shot.transition.kind === 'snap'     ? 'text-orange-300/50 border-orange-400/20' :
                      shot.transition.kind === 'cinematic'? 'text-purple-300/50 border-purple-400/20' :
                                                            'text-white/25 border-white/10'
                    }`}>
                      {shot.transition.kind}
                    </span>
                  )}

                  {/* Jump button */}
                  <button
                    onClick={() => director.jumpTo(shot.id)}
                    className="w-6 h-6 rounded flex items-center justify-center text-white/25 hover:text-cyan-300 hover:bg-cyan-500/15 border border-white/5 hover:border-cyan-400/25 transition-all flex-shrink-0"
                    title={`Jump to "${shot.label ?? shot.id}"`}
                  >
                    ▶
                  </button>

                  {/* Expand toggle */}
                  <button
                    onClick={() => setExpandedShot(isExpanded ? null : shot.id)}
                    className="text-white/20 hover:text-white/50 transition-colors text-[10px] flex-shrink-0 w-4"
                  >
                    {isExpanded ? '▲' : '▼'}
                  </button>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-2 pb-2 pt-0.5 border-t border-white/5 flex flex-col gap-1">
                    {/* Anchor / position */}
                    <div className="text-[7px] font-mono text-white/30">
                      <span className="text-white/20">pos  </span>
                      {typeof shot.position === 'string' ? (
                        <span className="text-cyan-300/60">anchor:{shot.position}</span>
                      ) : (
                        <span className="text-white/40">{shot.position.x.toFixed(2)}, {shot.position.y.toFixed(2)}, {shot.position.z.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="text-[7px] font-mono text-white/30">
                      <span className="text-white/20">tgt  </span>
                      {typeof shot.target === 'string' ? (
                        <span className="text-cyan-300/50">anchor:{shot.target}</span>
                      ) : (
                        <span className="text-white/40">{shot.target.x.toFixed(2)}, {shot.target.y.toFixed(2)}, {shot.target.z.toFixed(2)}</span>
                      )}
                    </div>

                    {shot.fov && (
                      <div className="text-[7px] font-mono text-white/30">
                        <span className="text-white/20">fov  </span>
                        <span className="text-yellow-300/60">{shot.fov}°</span>
                      </div>
                    )}
                    {shot.dof && (
                      <div className="text-[7px] font-mono text-white/30">
                        <span className="text-white/20">dof  </span>
                        <span className="text-green-300/60">focus:{shot.dof.focus} apt:{shot.dof.aperture.toFixed(4)}</span>
                      </div>
                    )}
                    {shot.shake && (
                      <div className="text-[7px] font-mono text-white/30">
                        <span className="text-white/20">shk  </span>
                        <span className="text-red-300/60">int:{shot.shake.intensity} dec:{shot.shake.decay}</span>
                      </div>
                    )}
                    {shot.drift && (
                      <div className="text-[7px] font-mono text-white/30">
                        <span className="text-white/20">drift</span>
                        <span className="text-blue-300/60"> h:{shot.drift.horizontal} v:{shot.drift.vertical} spd:{shot.drift.speed}</span>
                      </div>
                    )}
                    {shot.zoom && (
                      <div className="text-[7px] font-mono text-white/30">
                        <span className="text-white/20">zoom </span>
                        <span className="text-orange-300/60">{shot.zoom.from}→{shot.zoom.to} in {shot.zoom.duration}s</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB: ANCHORS ── */}
      {tab === 'anchors' && (
        <div className="flex flex-col gap-1 overflow-y-auto pr-1 max-h-[55vh]" style={{ scrollbarWidth: 'thin' }}>
          <p className="text-[7px] font-mono text-white/20 uppercase tracking-widest mb-0.5">Pontos de ancoragem ({Object.keys(CAMERA_ANCHORS).length})</p>
          {Object.entries(CAMERA_ANCHORS).map(([name, anchor]) => (
            <div
              key={name}
              className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] px-2 py-1.5 transition-all"
            >
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <span className="text-[9px] font-mono text-cyan-200/70">{name}</span>
                <span className="text-[6px] font-mono text-white/20">
                  {anchor.position.x.toFixed(2)}, {anchor.position.y.toFixed(2)}, {anchor.position.z.toFixed(2)}
                  {anchor.fov && <span className="ml-1.5 text-yellow-300/40">fov:{anchor.fov}°</span>}
                </span>
              </div>
              <button
                onClick={() => applyAnchor(name)}
                className="ml-2 px-2 py-0.5 rounded text-[7px] font-mono text-white/30 hover:text-cyan-200 bg-white/5 hover:bg-cyan-500/15 border border-white/5 hover:border-cyan-400/25 transition-all flex-shrink-0"
              >
                Go
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB: DOF ── */}
      {tab === 'dof' && (
        <div className="flex flex-col gap-2">
          <p className="text-[7px] font-mono text-white/20 uppercase tracking-widest">Presets</p>
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(DOF_PRESETS).map(([name, preset]) => (
              <button
                key={name}
                onClick={() => {
                  const bp = bokehPassRef.current;
                  if (!bp) return;
                  const u = bp.uniforms as Record<string, { value: number }>;
                  u.focus.value    = preset.focus;
                  u.aperture.value = preset.aperture;
                  u.maxblur.value  = preset.maxblur;
                }}
                className="px-2 py-1 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-[8px] font-mono text-white/40 hover:text-white/70 transition-all capitalize"
              >
                {name}
              </button>
            ))}
          </div>

          <div className="h-px w-full bg-white/5 my-0.5" />
          <p className="text-[7px] font-mono text-white/20 uppercase tracking-widest">Manual</p>
          {([
            { label: 'Focus',    key: 'focus',   min: 0.5, max: 20,   step: 0.1,    initial: 7.3    },
            { label: 'Aperture', key: 'aperture',min: 0,   max: 0.01, step: 0.0001, initial: 0.0002 },
            { label: 'Blur',     key: 'maxblur', min: 0,   max: 0.05, step: 0.001,  initial: 0.024  },
          ] as const).map(({ label, key, min, max, step, initial }) => (
            <label key={key} className="flex items-center gap-2 text-[9px] font-mono text-white/40">
              <span className="w-14">{label}</span>
              <input
                type="range" min={min} max={max} step={step} defaultValue={initial}
                className="w-24 h-1 accent-cyan-400/60"
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  const bp = bokehPassRef.current;
                  if (bp) (bp.uniforms as Record<string, { value: number }>)[key].value = val;
                  const span = document.getElementById(`as-cd-dof-${key}`);
                  if (span) span.textContent = val.toFixed(step < 0.001 ? 4 : step < 0.01 ? 3 : 1);
                }}
              />
              <span className="w-12 text-right text-white/25" id={`as-cd-dof-${key}`}>{initial}</span>
            </label>
          ))}

          <div className="h-px w-full bg-white/5 my-0.5" />
          {/* Manual shake trigger */}
          <p className="text-[7px] font-mono text-white/20 uppercase tracking-widest">Shake</p>
          <div className="flex gap-1 flex-wrap">
            {[0.01, 0.03, 0.06, 0.10].map(v => (
              <button
                key={v}
                onClick={() => director.triggerShake(v)}
                className="px-2 py-0.5 rounded text-[7px] font-mono text-white/30 hover:text-red-200 bg-white/5 hover:bg-red-500/15 border border-white/5 hover:border-red-400/25 transition-all"
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
