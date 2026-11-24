# Laboratório (playground) — acesso público

A proteção por senha das experiências foi **removida** em novembro de 2026.

Antes existia:

- login por experiência (`/playground/:id/login`) com uma senha compartilhada;
- os arquivos `src/components/ProtectedRoute.tsx`, `src/pages/PlaygroundLoginPage.tsx`
  e `src/playground/auth.ts`;
- o array `PROTECTED_PLAYGROUND_IDS` em `auth.ts` (tourism-guide, experience-studio
  e eldonita).

Agora todas as experiências abrem direto em `/playground/:id`, sem senha:
a rota `:id/*` no `src/App.tsx` renderiza `ExperimentView` diretamente.

## Se a proteção precisar voltar

1. Reintroduza `ProtectedRoute`, `PlaygroundLoginPage` e `auth.ts` (histórico do git,
   commits anteriores a esta remoção).
2. Envolva a rota em `src/App.tsx`:

```tsx
<Route
  path=":id/*"
  element={
    <ProtectedRoute allowedPaths={[...PROTECTED_PLAYGROUND_IDS]}>
      <ExperimentView />
    </ProtectedRoute>
  }
/>
```
