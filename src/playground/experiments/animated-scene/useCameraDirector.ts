/**
 * useCameraDirector.ts — Hook de direção de câmera
 * ─────────────────────────────────────────────────────────────────────────────
 * Responsabilidade única: ler o audioTime a cada frame, detectar mudança de
 * shot, disparar transições GSAP e aplicar drift/shake/zoom continuamente.
 *
 * O componente principal (index.tsx) apenas chama:
 *   const director = useCameraDirector({ cameraRef, controlsRef, bokehPassRef });
 *   // no loop: director.tick(audioTime, delta, elapsedTime);
 *   // no startExperience: director.playIntro();
 *   // no endExperience: director.playOutro();
 */

import { useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import gsap from 'gsap';
import {
  CAMERA_SHOTS,
  CAMERA_ANCHORS,
  getShotAt,
  resolvePosition,
  resolveTarget,
  resolveDoF,
  toThree,
  type CameraShot,
  type DoFConfig,
} from './cameraSystem';

// ─────────────────────────────────────────────────────────────────────────────

interface UseCameraDirectorOptions {
  cameraRef:   React.MutableRefObject<THREE.PerspectiveCamera | null>;
  controlsRef: React.MutableRefObject<OrbitControls | null>;
  bokehPassRef: React.MutableRefObject<BokehPass | null>;
}

export interface CameraDirectorAPI {
  /** Deve ser chamado a cada frame no loop de animação */
  tick: (audioTime: number, delta: number, elapsedTime: number) => void;
  /** Anima a câmera do intro (zoom out cinematic) */
  playIntro: () => void;
  /** Anima saída final (zoom out + fade — apenas câmera) */
  playOutro: () => void;
  /** Reseta para o primeiro shot (para replay) */
  reset: () => void;
  /** Força a transição imediata para um shot pelo ID */
  jumpTo: (shotId: string) => void;
  /** Shot ativo no momento */
  currentShotId: React.MutableRefObject<string | null>;
  /** Shake manual — pode ser disparado por eventos externos */
  triggerShake: (intensity: number, decay?: number) => void;
}

// ─────────────────────────────────────────────────────────────────────────────

export function useCameraDirector({
  cameraRef,
  controlsRef,
  bokehPassRef,
}: UseCameraDirectorOptions): CameraDirectorAPI {

  // Estado interno do diretor (tudo em refs para evitar re-renders)
  const currentShotId   = useRef<string | null>(null);
  const activeTransition = useRef(false);

  // Drift state (non-cumulative — armazena offset anterior para calcular delta)
  const driftPrev = useRef({ x: 0, y: 0, z: 0 });

  // Shake state
  const shake = useRef({ active: false, intensity: 0, decay: 0.92 });

  // Zoom tween state
  const zoomTween = useRef<gsap.core.Tween | null>(null);

  // ── helpers ──────────────────────────────────────────────────────────────

  const applyDoF = useCallback((dof: DoFConfig) => {
    const bp = bokehPassRef.current;
    if (!bp) return;
    const u = bp.uniforms as Record<string, { value: number }>;
    gsap.to(u.focus,    { value: dof.focus,    duration: 0.8, ease: 'power2.out', overwrite: true });
    gsap.to(u.aperture, { value: dof.aperture, duration: 0.8, ease: 'power2.out', overwrite: true });
    gsap.to(u.maxblur,  { value: dof.maxblur,  duration: 0.8, ease: 'power2.out', overwrite: true });
  }, [bokehPassRef]);

  const applyShotImmediate = useCallback((shot: CameraShot) => {
    const cam  = cameraRef.current;
    const ctrl = controlsRef.current;
    if (!cam || !ctrl) return;

    const pos = toThree(resolvePosition(shot.position));
    const tgt = toThree(resolveTarget(shot.target));
    const dof = resolveDoF(undefined, shot);
    const fov = shot.fov ?? (() => {
      const a = typeof shot.position === 'string' ? CAMERA_ANCHORS[shot.position] : null;
      return a?.fov ?? 22;
    })();

    cam.position.copy(pos);
    ctrl.target.copy(tgt);
    cam.fov = fov;
    cam.updateProjectionMatrix();
    ctrl.update();
    applyDoF(dof);
  }, [cameraRef, controlsRef, applyDoF]);

  // ─────────────────────────────────────────────────────────────────────────
  // Transição suave entre shots
  // ─────────────────────────────────────────────────────────────────────────

  const transitionToShot = useCallback((shot: CameraShot) => {
    const cam  = cameraRef.current;
    const ctrl = controlsRef.current;
    if (!cam || !ctrl) return;

    const pos     = toThree(resolvePosition(shot.position));
    const tgt     = toThree(resolveTarget(shot.target));
    const dof     = resolveDoF(undefined, shot);
    const fov     = shot.fov ?? (() => {
      const a = typeof shot.position === 'string' ? CAMERA_ANCHORS[shot.position] : null;
      return a?.fov ?? 22;
    })();
    const kind     = shot.transition?.kind     ?? 'ease';
    const duration = shot.transition?.duration ?? 1.0;
    const easing   = shot.transition?.easing   ?? 'power2.inOut';

    // Aplica DoF com ramp
    applyDoF(dof);

    if (kind === 'cut' || duration <= 0) {
      applyShotImmediate(shot);
      return;
    }

    activeTransition.current = true;

    // Cancela zoom anterior se houver
    zoomTween.current?.kill();
    zoomTween.current = null;

    const timeline = gsap.timeline({
      onComplete: () => { activeTransition.current = false; },
    });

    // Posição da câmera
    timeline.to(cam.position, {
      x: pos.x, y: pos.y, z: pos.z,
      duration,
      ease: easing,
      onUpdate: () => { ctrl.update(); },
    }, 0);

    // Target dos controles
    timeline.to(ctrl.target, {
      x: tgt.x, y: tgt.y, z: tgt.z,
      duration,
      ease: easing,
    }, 0);

    // FOV
    const fovProxy = { fov: cam.fov };
    timeline.to(fovProxy, {
      fov,
      duration: duration * 0.8,
      ease: easing,
      onUpdate: () => {
        if (cam) {
          cam.fov = fovProxy.fov;
          cam.updateProjectionMatrix();
        }
      },
    }, 0);

    // Zoom automático se configurado
    if (shot.zoom) {
      const z = shot.zoom;
      const zProxy = { dist: z.from };
      const dir = new THREE.Vector3()
        .subVectors(cam.position, ctrl.target)
        .normalize();

      zoomTween.current = gsap.to(zProxy, {
        dist: z.to,
        duration: z.duration,
        ease: z.easing ?? 'power2.out',
        delay: duration * 0.3,
        onUpdate: () => {
          const c = cameraRef.current;
          const ct = controlsRef.current;
          if (c && ct) {
            c.position.copy(ct.target).add(dir.multiplyScalar(zProxy.dist));
            ct.update();
          }
        },
      });
    }

    // Shake se configurado
    if (shot.shake) {
      shake.current.active    = true;
      shake.current.intensity = shot.shake.intensity;
      shake.current.decay     = shot.shake.decay ?? 0.92;
    }

  }, [cameraRef, controlsRef, applyDoF, applyShotImmediate]);

  // ─────────────────────────────────────────────────────────────────────────
  // tick — chamado a cada frame
  // ─────────────────────────────────────────────────────────────────────────

  const tick = useCallback((audioTime: number, _delta: number, elapsedTime: number) => {
    const cam  = cameraRef.current;
    const ctrl = controlsRef.current;
    if (!cam || !ctrl) return;

    // ── Detecção de mudança de shot ──────────────────────────────────────
    const shot = getShotAt(audioTime);
    if (shot && shot.id !== currentShotId.current) {
      currentShotId.current = shot.id;
      transitionToShot(shot);
    }

    // ── Drift orgânico ───────────────────────────────────────────────────
    if (shot?.drift) {
      const d = shot.drift;
      const newOx = Math.sin(elapsedTime * d.speed * 0.23) * d.horizontal
                  + Math.sin(elapsedTime * d.speed * 0.41) * d.horizontal * 0.5;
      const newOy = Math.sin(elapsedTime * d.speed * 0.19 + 1.3) * d.vertical;
      const newOz = Math.sin(elapsedTime * d.speed * 0.29 + 2.7) * d.horizontal * 0.75
                  + Math.cos(elapsedTime * d.speed * 0.17) * d.horizontal * 0.5;

      cam.position.x += newOx - driftPrev.current.x;
      cam.position.y += newOy - driftPrev.current.y;
      cam.position.z += newOz - driftPrev.current.z;

      driftPrev.current = { x: newOx, y: newOy, z: newOz };
    } else {
      // Reset drift state quando shot não tem drift
      driftPrev.current = { x: 0, y: 0, z: 0 };
    }

    // ── Camera shake ─────────────────────────────────────────────────────
    if (shake.current.active && shake.current.intensity > 0.001) {
      cam.position.x += (Math.random() - 0.5) * shake.current.intensity;
      cam.position.y += (Math.random() - 0.5) * shake.current.intensity * 0.5;
      cam.position.z += (Math.random() - 0.5) * shake.current.intensity * 0.5;
      shake.current.intensity *= shake.current.decay;
      if (shake.current.intensity < 0.001) {
        shake.current.active    = false;
        shake.current.intensity = 0;
      }
    }

    // ── Safety clamps ────────────────────────────────────────────────────
    if (cam.position.y < 0.3) cam.position.y = 0.3;
    if (cam.position.y > 6.0) cam.position.y = 6.0;

  }, [cameraRef, controlsRef, transitionToShot]);

  // ─────────────────────────────────────────────────────────────────────────
  // playIntro — animation entrada
  // ─────────────────────────────────────────────────────────────────────────

  const playIntro = useCallback(() => {
    const cam  = cameraRef.current;
    const ctrl = controlsRef.current;
    if (!cam || !ctrl) return;

    // Posição de referência exata (default anchor)
    const anchor = CAMERA_ANCHORS.default;
    const refPos = new THREE.Vector3(anchor.position.x, anchor.position.y, anchor.position.z);
    const refTgt = new THREE.Vector3(anchor.target.x,   anchor.target.y,   anchor.target.z);

    // Direção referência → câmera (normalizada)
    const dir = new THREE.Vector3().subVectors(refPos, refTgt).normalize();
    const refDist = refPos.distanceTo(refTgt); // ~2.7

    // Configura câmera no ponto de partida do zoom (mais próxima)
    ctrl.target.copy(refTgt);
    cam.position.copy(refTgt).add(dir.clone().multiplyScalar(2.0));
    cam.fov = anchor.fov ?? 22;
    cam.updateProjectionMatrix();
    ctrl.update();

    // Zoom out até a distância de referência
    const proxy = { dist: 2.0 };
    gsap.to(proxy, {
      dist: refDist,
      duration: 5,
      ease: 'power2.out',
      onUpdate: () => {
        const c  = cameraRef.current;
        const ct = controlsRef.current;
        if (c && ct) {
          c.position.copy(ct.target).add(dir.clone().multiplyScalar(proxy.dist));
          ct.update();
        }
      },
    });

    // DoF de abertura
    const dof = anchor.dof ?? CAMERA_ANCHORS.default.dof!;
    applyDoF(dof);

    // Reset drift e força detecção do primeiro shot
    driftPrev.current = { x: 0, y: 0, z: 0 };
    currentShotId.current = null;
  }, [cameraRef, controlsRef, applyDoF]);

  // ─────────────────────────────────────────────────────────────────────────
  // playOutro
  // ─────────────────────────────────────────────────────────────────────────

  const playOutro = useCallback(() => {
    const cam  = cameraRef.current;
    const ctrl = controlsRef.current;
    if (!cam || !ctrl) return;

    const anchor = CAMERA_ANCHORS.default;
    gsap.to(cam.position, {
      x: anchor.position.x,
      y: anchor.position.y,
      z: anchor.position.z,
      duration: 3,
      ease: 'power2.inOut',
      onUpdate: () => { ctrl.update(); },
    });
    gsap.to(ctrl.target, {
      x: anchor.target.x,
      y: anchor.target.y,
      z: anchor.target.z,
      duration: 3,
      ease: 'power2.inOut',
    });
  }, [cameraRef, controlsRef]);

  // ─────────────────────────────────────────────────────────────────────────
  // reset
  // ─────────────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    currentShotId.current = null;
    driftPrev.current = { x: 0, y: 0, z: 0 };
    shake.current = { active: false, intensity: 0, decay: 0.92 };
    zoomTween.current?.kill();
    zoomTween.current = null;
    playIntro();
  }, [playIntro]);

  // ─────────────────────────────────────────────────────────────────────────
  // jumpTo
  // ─────────────────────────────────────────────────────────────────────────

  const jumpTo = useCallback((shotId: string) => {
    const shot = CAMERA_SHOTS.find(s => s.id === shotId);
    if (!shot) {
      console.warn(`[useCameraDirector] Shot "${shotId}" não encontrado`);
      return;
    }
    currentShotId.current = shotId;
    transitionToShot(shot);
  }, [transitionToShot]);

  // ─────────────────────────────────────────────────────────────────────────
  // triggerShake
  // ─────────────────────────────────────────────────────────────────────────

  const triggerShake = useCallback((intensity: number, decay = 0.92) => {
    shake.current.active    = true;
    shake.current.intensity = intensity;
    shake.current.decay     = decay;
  }, []);

  return { tick, playIntro, playOutro, reset, jumpTo, currentShotId, triggerShake };
}
