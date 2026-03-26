/**
 * useCharacterAnimator
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages character.glb loading, AnimationMixer, and clip switching.
 *
 * Strategy — "single active action" (simplest, most reliable):
 *   • Only ONE action is active (.play()) at any time with effectiveWeight = 1.
 *   • All others are stopped (not playing, weight = 0).
 *   • Switching: previous.stop() → next.time = 0 → next.enabled = true → next.play()
 *
 * Why NOT fadeOut/fadeIn:
 *   • fadeOut reduces outgoing weight over N frames. If the incoming action's
 *     weight doesn't fully cover the gap, Three.js blends with the bind pose
 *     (rest skeleton) → T-pose flash.
 *   • reset() before fadeIn wipes scheduled weight interpolation.
 *
 * Why this works without T-pose:
 *   • At every mixer.update() tick there is exactly one action with weight = 1.
 *   • The mixer never sees total weight < 1, so it never falls back to bind pose.
 */

import { useRef, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TIMELINE, FADE_DURATION } from './timeline';

// ── Character constants (calibrated with TransformControls gizmo) ─────────────
export const CHAR_SCALE = 0.1532;
export const CHAR_POS   = { x: 0.221, y: 0.02, z: 1.522 } as const;

// ─────────────────────────────────────────────────────────────────────────────
// Sorted once at module load — edit the timeline in  timeline.ts  instead.
const SORTED_TIMELINE = [...TIMELINE].sort((a, b) => a.from - b.from);

export function getClipForAudioTime(t: number): string {
  for (const seg of SORTED_TIMELINE) {
    if (t >= seg.from && t < seg.to) return seg.clip;
  }
  return SORTED_TIMELINE[SORTED_TIMELINE.length - 1].clip;
}

// ─────────────────────────────────────────────────────────────────────────────

export function useCharacterAnimator() {
  const charModelRef      = useRef<THREE.Object3D | null>(null);
  const charMixerRef      = useRef<THREE.AnimationMixer | null>(null);
  const charActionsRef    = useRef<THREE.AnimationAction[]>([]);

  // Maps resolved Blender clip name → action (populated by loadCharacter)
  const byNameRef          = useRef<Record<string, THREE.AnimationAction>>({});
  // Name of the currently active clip (resolved key inside byNameRef)
  const activeKeyRef       = useRef<string>('');

  // ── resolveKey ───────────────────────────────────────────────────────────
  // Returns the actual key in byNameRef for a given name (case-insensitive).
  const resolveKey = useCallback((name: string): string | undefined => {
    const keys = Object.keys(byNameRef.current);
    return (
      keys.find(k => k === name) ??
      keys.find(k => k.toLowerCase() === name.toLowerCase())
    );
  }, []);

  // ── activateClip ─────────────────────────────────────────────────────────
  // The ONLY place that switches the active animation.
  //
  // instant = true  → hard cut (used on first play and resetToStart)
  // instant = false → crossfade via crossFadeTo:
  //   prev: weight 1 → 0 (fadeOut)   both actions stay .play()'d
  //   next: weight 0 → 1 (fadeIn)    weights always sum to 1 → no T-pose
  const activateClip = useCallback((resolvedKey: string, instant = false) => {
    const byName = byNameRef.current;
    const next   = byName[resolvedKey];
    if (!next) return;

    const prevKey = activeKeyRef.current;
    const prev    = (prevKey && prevKey !== resolvedKey) ? byName[prevKey] : null;

    // Stop any third action that is neither outgoing nor incoming
    Object.entries(byName).forEach(([k, a]) => {
      if (k !== prevKey && k !== resolvedKey) {
        a.setEffectiveWeight(0);
        a.stop();
      }
    });

    activeKeyRef.current = resolvedKey;

    // Prepare incoming action
    next.setEffectiveTimeScale(1);
    next.paused  = false;
    next.enabled = true;

    if (!prev || instant) {
      // ── Hard cut ──────────────────────────────────────────────────────
      if (prev) {
        prev.setEffectiveWeight(0);
        prev.stop();
      }
      next.setEffectiveWeight(1);
      next.time = 0;
      next.play();
      console.log(`[CharAnim] → "${resolvedKey}" (cut)`);
    } else {
      // ── Crossfade ─────────────────────────────────────────────────────────
      // Three.js _updateWeight formula:  finalWeight = this.weight * interpolant
      //
      // Bug with setEffectiveWeight(0) + fadeIn:
      //   setEffectiveWeight(0) sets this.weight = 0
      //   fadeIn schedules interpolant 0→1
      //   but _updateWeight = 0 * (0→1) = 0 always → T-pose
      //
      // Fix (two-step):
      //   1. setEffectiveWeight(0)  → zeroes _effectiveWeight so fadeIn starts from 0
      //      (side-effect: weight=0, overridden immediately)
      //   2. next.weight = 1        → direct property, not the setter; base weight=1
      //   3. fadeIn → interpolant 0→1, _updateWeight = 1*(0→1) = 0→1 ✓
      //   prev fadeOut: weight=1*(1→0) ✓  — sum = 1 every frame, no T-pose.
      next.time = 0;
      next.setEffectiveWeight(0); // zeroes _effectiveWeight (starts fadeIn from 0)
      next.weight = 1;            // restore base weight (direct property, not setter)
      next.play();

      prev.fadeOut(FADE_DURATION);
      next.fadeIn(FADE_DURATION);
      console.log(`[CharAnim] → "${resolvedKey}" (fade ${FADE_DURATION}s)`);
    }
  }, []);

  // ── switchClip ───────────────────────────────────────────────────────────
  // Public: call with a clip name (tolerates case mismatch).
  // Safe to call every render frame — no-ops if already on that clip.
  const switchClip = useCallback((name: string) => {
    if (!Object.keys(byNameRef.current).length) return;

    const key = resolveKey(name);
    if (!key) {
      console.warn(`[CharAnim] "${name}" not found. Have: ${Object.keys(byNameRef.current).join(', ')}`);
      return;
    }
    if (activeKeyRef.current === key) return; // already active, do nothing
    activateClip(key);
  }, [resolveKey, activateClip]);

  // ── tickByAudioTime ──────────────────────────────────────────────────────
  // Drive animation from audio position. Call once per animation frame.
  const tickByAudioTime = useCallback((audioTime: number) => {
    switchClip(getClipForAudioTime(audioTime));
  }, [switchClip]);

  // ── resetToStart ─────────────────────────────────────────────────────────
  // Re-activates the Intro clip from frame 0.
  const resetToStart = useCallback(() => {
    const keys = Object.keys(byNameRef.current);
    if (!keys.length) return;

    // Stop every action cleanly
    keys.forEach(k => {
      const a = byNameRef.current[k];
      a.setEffectiveWeight(0);
      a.stop();
    });
    activeKeyRef.current = '';

    // Re-activate Intro (or first available clip) — instant cut on reset
    const startKey =
      keys.find(k => k.toLowerCase().includes('intro')) ?? keys[0];
    if (startKey) activateClip(startKey, true);
  }, [activateClip]);

  // ── loadCharacter ────────────────────────────────────────────────────────
  const loadCharacter = useCallback((
    scene:   THREE.Scene,
    onReady: (clipNames: string[]) => void,
    onError: () => void,
  ) => {
    const loader = new GLTFLoader();

    loader.load(
      '/3d/character.glb',
      (gltf) => {
        const obj = gltf.scene;

        // Fixed position & scale (calibrated with TransformControls gizmo)
        obj.scale.setScalar(CHAR_SCALE);
        obj.position.set(CHAR_POS.x, CHAR_POS.y, CHAR_POS.z);

        obj.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow    = true;
            child.receiveShadow = true;
          }
        });

        scene.add(obj);
        charModelRef.current = obj;

        const clipNames: string[] = [];

        if (gltf.animations.length > 0) {
          const mixer   = new THREE.AnimationMixer(obj);
          charMixerRef.current = mixer;

          const byName: Record<string, THREE.AnimationAction> = {};
          const actions: THREE.AnimationAction[] = [];

          gltf.animations.forEach((clip, i) => {
            const action = mixer.clipAction(clip);
            action.setLoop(THREE.LoopRepeat, Infinity);
            // All start STOPPED and at weight 0.
            // Only activateClip() will start one at a time.
            action.setEffectiveWeight(0);
            action.enabled = false;

            byName[clip.name] = action;
            actions.push(action);
            clipNames.push(clip.name);
            console.log(`[CharAnim] Registered clip [${i}]: "${clip.name}"`);
          });

          byNameRef.current      = byName;
          charActionsRef.current = actions;

          // ── Validate timeline against loaded clips ────────────────────────
          // Warns immediately if a clip name in timeline.ts doesn't exist in the GLB.
          const uniqueTimelineClips = [...new Set(TIMELINE.map(s => s.clip))];
          uniqueTimelineClips.forEach(name => {
            const found = Object.keys(byName).some(
              k => k.toLowerCase() === name.toLowerCase()
            );
            if (!found) {
              console.warn(
                `[CharAnim] ⚠ timeline.ts references "${name}" but it was NOT found in character.glb.`,
                `\n  Available clips: ${Object.keys(byName).join(', ')}`,
              );
            }
          });
          // ─────────────────────────────────────────────────────────────────
          const startKey =
            Object.keys(byName).find(k => k.toLowerCase().includes('intro')) ??
            Object.keys(byName)[0];

          if (startKey) {
            activateClip(startKey, true); // instant on first load
          }
        } else {
          console.warn('[CharAnim] No animations found in character.glb');
        }

        onReady(clipNames);
      },
      undefined,
      (err) => {
        console.error('[CharAnim] Failed to load character.glb:', err);
        onError();
      },
    );
  }, [activateClip]);

  return {
    charModelRef,
    charMixerRef,
    charActionsRef,
    loadCharacter,
    switchClip,
    tickByAudioTime,
    resetToStart,
  };
}
