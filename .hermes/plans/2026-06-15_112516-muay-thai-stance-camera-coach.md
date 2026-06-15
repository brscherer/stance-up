# Muay Thai Stance Camera Coach Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build a small browser app that uses the camera to analyze Muay Thai stance and give detailed corrective feedback.

**Architecture:** Browser-first local PWA. Camera frames are processed client-side by MediaPipe Pose Landmarker. Pure TypeScript analysis modules convert pose landmarks into stance metrics, scores, and coaching cues; React components render setup, live overlay, score panel, and session summary.

**Tech Stack:** Vite, React, TypeScript, MediaPipe Tasks Vision, Vitest, React Testing Library, optional Playwright for browser camera/manual flow checks.

---

## Current context

- Repository path: `/Users/brscherer/dev/stance-up`.
- Repository is essentially empty except `.git`.
- Planning artifacts created:
  - `/Users/brscherer/dev/stance-up/DESIGN.md`
  - `/Users/brscherer/dev/stance-up/todo.txt`
- MVP should focus only on Muay Thai stance.
- No backend or video upload for MVP.

## Proposed approach

1. Initialize a Vite React TypeScript app in the existing repo.
2. Build pure, tested analysis functions before wiring camera UI.
3. Use synthetic landmark fixtures to make heuristic tests deterministic.
4. Integrate MediaPipe only after domain scoring is tested.
5. Add UI once the analysis pipeline has stable types and behavior.
6. Manually validate with real camera footage and tune thresholds conservatively.

## Likely files to create

```text
package.json
index.html
src/main.tsx
src/App.tsx
src/styles.css
src/camera/CameraView.tsx
src/camera/cameraPermissions.ts
src/pose/poseLandmarker.ts
src/pose/landmarks.ts
src/pose/normalizeLandmarks.ts
src/analysis/types.ts
src/analysis/stanceOrientation.ts
src/analysis/stanceMetrics.ts
src/analysis/scoring.ts
src/analysis/feedback.ts
src/analysis/rollingWindow.ts
src/ui/SetupChecklist.tsx
src/ui/LiveOverlay.tsx
src/ui/ScorePanel.tsx
src/ui/SessionSummary.tsx
src/__tests__/fixtureHelpers.ts
src/__tests__/stanceOrientation.test.ts
src/__tests__/stanceMetrics.test.ts
src/__tests__/scoring.test.ts
src/__tests__/feedback.test.ts
src/__tests__/rollingWindow.test.ts
```

## Implementation plan

Follow `/Users/brscherer/dev/stance-up/todo.txt` as the step-by-step execution checklist.

Recommended execution batches:

### Batch 1: Project baseline

Complete todo items 0.01-0.08.

Validation:
- `npm test`
- `npm run typecheck`
- `npm run build`

### Batch 2: Analysis foundation

Complete todo phases 1-3.

Validation:
- fixture tests pass
- normalization tests pass
- orientation tests pass

### Batch 3: Stance metrics

Complete todo phase 4.

Validation:
- base width, stance length, knee softness, guard, head posture, and alignment tests pass.

### Batch 4: Temporal scoring and feedback

Complete todo phases 5-6.

Validation:
- rolling-window tests pass
- issue ranking tests pass
- low-confidence landmarks produce cautious feedback

### Batch 5: Camera and pose integration

Complete todo phase 7.

Validation:
- camera starts/stops
- pose loop initializes
- no crash on missing model/camera permission
- build passes

### Batch 6: User experience

Complete todo phases 8-9.

Validation:
- user can move through landing, setup, calibration, live analysis, and summary.
- UI clearly says processing is local.

### Batch 7: Manual validation and threshold tuning

Complete todo phase 10.

Validation:
- real webcam session produces useful cues.
- missing hands/feet reduce confidence rather than creating false bad feedback.
- final tests, typecheck, lint, and build pass.

## Risks and tradeoffs

- RGB pose landmarks cannot measure true weight distribution; use approximate language.
- Foot spacing can be distorted by camera angle; require setup guidance and confidence handling.
- Hand landmarks may disappear during movement; use rolling windows.
- Heuristics can encode bad assumptions; keep thresholds centralized and easy to tune.

## Open questions to revisit after MVP

- Should the app become native mobile after the browser MVP proves useful?
- Should coach-reviewed clips be collected to tune thresholds?
- Should optional local-only video replay be supported?
- Which first movement module should follow stance: guard reset, step/bounce, teep balance, or low-kick check?
