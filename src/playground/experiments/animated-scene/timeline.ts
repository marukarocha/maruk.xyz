/**
 * timeline.ts — Sequência de animações do personagem
 * ─────────────────────────────────────────────────────────────────────────────
 * Este é o ÚNICO arquivo que você precisa editar para mudar as animações.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  COMO ADICIONAR UMA NOVA ANIMAÇÃO                                       │
 * │                                                                         │
 * │  1. No Blender: crie a action no NLA Editor com o nome desejado         │
 * │  2. Exporte o character.glb (File → Export → glTF 2.0)                  │
 * │  3. Adicione uma linha aqui:                                            │
 * │        { from: X, to: Y, clip: 'NomeExatoDoBlender' }                  │
 * │                                                                         │
 * │  Pronto. A ordem das linhas não importa — são ordenadas automaticamente.│
 * │  Os nomes são comparados sem diferença de maiúscula/minúscula.          │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * Nomes de clips disponíveis no GLB atual (confirmados no console ao carregar):
 *   • Intro
 *   • Danca
 *   • Ombrinho
 */

// ── Duração do crossfade entre clips (em segundos) ────────────────────────────
export const FADE_DURATION = 0.4;

// ── Sequência de animações ────────────────────────────────────────────────────
// { from: A, to: B, clip: 'Nome' }
//   from  → segundo de início (inclusivo)
//   to    → segundo de fim    (exclusivo)
//   clip  → nome exato da action no Blender (case-insensitive)
//
// O último item deve ter  to: Infinity  para tocar até o fim.
export const TIMELINE: Array<{ from: number; to: number; clip: string }> = [
  { from: 0,  to: 5,        clip: 'Intro'    },
  { from: 5,  to: 17,       clip: 'Ombrinho' },
  { from: 17, to: 33,       clip: 'Boom'    },
  { from: 33, to: 40,       clip: 'Ombrinho' },
  { from: 40, to: 60,       clip: 'Danca'    },
  { from: 60, to: 71,       clip: 'Ombrinho' },
  { from: 72, to: Infinity, clip: 'Intro'    },
];
