# Stance Up DESIGN.md

## Product goal

Build a small camera-based coaching app that helps a user improve Muay Thai fighting stance through real-time movement capture, pose analysis, and specific corrective feedback.

Initial scope: Muay Thai stance only. The app should analyze stance quality, explain what it sees, and give actionable drills/cues to improve.

## Target user

A beginner to intermediate Muay Thai practitioner practicing alone at home or in a gym who wants immediate feedback on stance fundamentals.

## MVP promise

Within one camera session, the user can:

1. Start the camera locally in the browser.
2. Select stance orientation: orthodox, southpaw, or auto-detect.
3. See a live pose overlay.
4. Receive a stance score and detailed feedback for Muay Thai stance fundamentals.
5. Review a short session summary with top 3 improvement cues.

## Explicit non-goals for MVP

- No punch, kick, elbow, knee, clinch, or sparring analysis yet.
- No backend, account system, cloud storage, or social sharing.
- No medical or injury-prevention claims.
- No claim that feedback replaces a coach.
- No combat-sport support beyond Muay Thai stance in this phase.
- No model training in MVP; use deterministic heuristics over pose landmarks.

## Major decisions

### 1. App type

Decision: Build a browser-first PWA using Vite, React, and TypeScript.

Why:
- Fastest path to a small working camera app.
- Browser camera APIs are enough for MVP.
- A PWA can later be installed on phones without committing to native iOS/Android too early.
- Keeps the repo simple and testable.

Rejected for now:
- Native mobile app: better camera performance later, but too much setup for MVP.
- Backend-first app: unnecessary because all MVP analysis can run locally.

### 2. Pose estimation

Decision: Use MediaPipe Tasks Vision Pose Landmarker in the browser.

Why:
- Mature real-time human pose landmark detection.
- Runs client-side, preserving privacy.
- Provides stable body landmarks needed for stance heuristics.
- Avoids collecting or labeling training data for the first version.

Important constraint:
- Pose estimation quality depends heavily on lighting, camera angle, body visibility, and device performance.

### 3. Privacy model

Decision: Camera frames stay on-device for MVP. No video upload. No analytics events containing images or landmarks.

Why:
- Fighting practice video is sensitive.
- Local processing simplifies trust and removes backend cost.
- We can still save non-sensitive session summaries locally if needed.

### 4. Feedback model

Decision: Use transparent heuristic scoring, not an opaque ML classifier.

Why:
- Stance fundamentals can be expressed as measurable rules.
- Users need explainable feedback, not just a score.
- Heuristics are easy to unit test and tune.
- Later, coach-reviewed datasets can improve thresholds or train models.

### 5. Initial camera framing

Decision: MVP expects full-body or near-full-body view, ideally from front/three-quarter angle.

Why:
- Muay Thai stance requires feet, knees, hips, shoulders, guard, and head alignment.
- Side-only view makes width, guard symmetry, and stance orientation harder.

App requirement:
- Show a setup checklist before scoring:
  - full body visible
  - hands visible
  - feet visible
  - enough light
  - camera stable

### 6. Scoring philosophy

Decision: Score individual dimensions first, then compute an overall score.

Dimensions:
- Base width and stance length
- Knee softness / athletic bend
- Weight balance
- Guard position
- Chin/head posture
- Shoulder/hip alignment
- Stance stability over time
- Recovery to stance after small movement

Overall score should be secondary. Specific cues matter more than the number.

### 7. Session length

Decision: MVP analyzes short continuous windows of 5-15 seconds.

Why:
- Reduces noisy single-frame judgments.
- Enables stability/movement metrics.
- Short enough for quick iteration while practicing.

### 8. Data persistence

Decision: MVP stores only local settings and optional session summaries in localStorage/IndexedDB.

Examples:
- preferred stance orientation
- last camera device id if permission allows
- previous scores without raw video

### 9. Safety and wording

Decision: Feedback must be framed as coaching cues, not medical advice.

Example copy:
- Good: "Try softening both knees so you can move without standing tall."
- Avoid: "This prevents knee injury."

## Muay Thai stance fundamentals to analyze

These are the first-pass heuristics. Thresholds should be configurable constants and refined through testing.

### 1. Stance orientation

Inputs:
- left/right shoulder landmarks
- left/right hip landmarks
- left/right knee/ankle landmarks
- user-selected orthodox/southpaw preference

Rules:
- Orthodox: left side generally leads, right side rear.
- Southpaw: right side generally leads, left side rear.
- Auto-detect only if confidence is high; otherwise ask user.

Feedback examples:
- "Your stance orientation is unclear. Turn slightly so your lead side is visible and keep both feet in frame."

### 2. Base width

Inputs:
- ankle landmarks
- hip/shoulder width as scale reference

Rule concept:
- Feet should not be on a tight line.
- Lateral distance between ankles should be roughly shoulder-width-ish, adjusted for camera perspective.

Feedback examples:
- Too narrow: "Widen your base so your feet are not lined up. You should feel harder to push over sideways."
- Too wide: "Bring your feet slightly closer so you can step quickly without being stuck."

### 3. Stance length

Inputs:
- ankle landmarks
- hip/shoulder scale
- stance orientation

Rule concept:
- Lead and rear foot should have enough front/back separation for balance, but not a long lunge.

Feedback examples:
- Too short: "Step your rear foot back slightly so you are not square."
- Too long: "Shorten the stance so you can check, teep, and step without dragging your rear leg."

### 4. Knee softness

Inputs:
- hip, knee, ankle landmarks
- knee angle approximation

Rule concept:
- Knees should be slightly bent, not locked, not deeply squatted.

Feedback examples:
- Too straight: "Soften your knees. Think athletic bounce, not standing tall."
- Too deep: "Rise a little. Muay Thai stance should be mobile, not a squat."

### 5. Weight balance

Inputs:
- hip midpoint, ankle positions, vertical posture, movement over time

Rule concept:
- Balanced enough to move, with no extreme lean over either foot.
- MVP uses approximation because true weight distribution cannot be measured from RGB video alone.

Feedback examples:
- "Your hips drift far over the lead leg. Center your weight so either leg can move."

### 6. Guard position

Inputs:
- wrist, elbow, shoulder, nose/mouth/eye landmarks

Rule concept:
- Hands should stay high enough to protect head.
- Elbows should not flare excessively.
- Rear hand should be close to cheek/temple region.
- Lead hand can be slightly forward but should not drop.

Feedback examples:
- "Your rear hand is dropping below your chin. Keep it near your cheek after every movement."
- "Your lead hand is too low. Keep it active between you and the opponent."

### 7. Chin/head posture

Inputs:
- nose, ears/eyes if available, shoulder line

Rule concept:
- Head should not project far forward or tilt excessively up.
- Chin tucked cue should be gentle and not medicalized.

Feedback examples:
- "Your head is reaching forward. Stack it over your stance and keep your chin slightly tucked."

### 8. Shoulder and hip alignment

Inputs:
- shoulder line, hip line, stance orientation

Rule concept:
- User should not be completely square unless intentionally checking/defending.
- User should not be over-bladed like a point-fighting stance.

Feedback examples:
- "You are very square. Angle your stance slightly so your rear side is protected."
- "You are very sideways. Open up enough to check kicks and throw rear-side weapons."

### 9. Stability over time

Inputs:
- landmark smoothing over 5-15 seconds
- ankle/hip/head drift

Rule concept:
- Stance should remain stable during light bounce or reset.
- Penalize repeated hand drops, stance collapse, excessive head drift.

Feedback examples:
- "Your stance starts strong, then your hands drop after a few seconds. Reset your guard after every bounce."

## High-level architecture

```text
Browser PWA
  ├── Camera capture layer
  │     └── getUserMedia video stream
  ├── Pose layer
  │     └── MediaPipe Pose Landmarker
  ├── Analysis layer
  │     ├── landmark normalization
  │     ├── stance orientation detection
  │     ├── per-frame heuristics
  │     └── rolling-window aggregation
  ├── Feedback layer
  │     ├── score calculation
  │     ├── issue ranking
  │     └── coaching cue generation
  └── UI layer
        ├── onboarding/setup checklist
        ├── live camera + skeleton overlay
        ├── real-time cues
        └── session summary
```

## Proposed source layout

```text
stance-up/
  DESIGN.md
  todo.txt
  package.json
  index.html
  src/
    main.tsx
    App.tsx
    styles.css
    camera/
      CameraView.tsx
      cameraPermissions.ts
    pose/
      poseLandmarker.ts
      landmarks.ts
      normalizeLandmarks.ts
    analysis/
      types.ts
      stanceOrientation.ts
      stanceMetrics.ts
      scoring.ts
      feedback.ts
      rollingWindow.ts
    ui/
      SetupChecklist.tsx
      LiveOverlay.tsx
      ScorePanel.tsx
      SessionSummary.tsx
    __tests__/
      stanceOrientation.test.ts
      stanceMetrics.test.ts
      scoring.test.ts
      feedback.test.ts
```

## Core domain types

```ts
export type StanceSide = 'orthodox' | 'southpaw' | 'auto';

export type StanceMetricStatus = 'good' | 'warn' | 'bad' | 'unknown';

export interface StanceMetric {
  id: string;
  label: string;
  status: StanceMetricStatus;
  score: number; // 0-100
  confidence: number; // 0-1
  message: string;
  correction?: string;
}

export interface StanceAnalysisResult {
  timestampMs: number;
  overallScore: number;
  confidence: number;
  metrics: StanceMetric[];
  topCues: string[];
}
```

## UX flow

1. Landing screen
   - Explain local camera analysis.
   - Button: Start camera.

2. Camera permission and setup
   - Request camera access.
   - Show video preview.
   - Checklist validates full-body visibility where possible.
   - User chooses orthodox, southpaw, or auto.

3. Calibration window
   - 3-second countdown.
   - Collect stable landmarks.
   - Establish scale references: shoulder width, hip width, ankle spacing baseline.

4. Live analysis
   - Show skeleton overlay.
   - Show overall score but emphasize current top cue.
   - Show per-dimension status chips.

5. Session summary
   - Average score.
   - Best dimension.
   - Top 3 improvement areas.
   - Suggested mini-drill.

## Testing strategy

### Unit tests

Use Vitest for pure analysis functions.

Test areas:
- landmark normalization handles missing/low-confidence landmarks
- stance orientation detection handles orthodox/southpaw fixtures
- base width scoring returns good/warn/bad for known synthetic landmark sets
- guard scoring catches dropped rear hand and lead hand
- feedback ranks severe/high-confidence issues first
- rolling-window aggregation dampens single-frame noise

### Component tests

Use React Testing Library for UI states:
- setup checklist renders camera requirements
- score panel shows top cue and metric chips
- session summary shows ranked improvements

### Manual validation

Use a browser with webcam:
- camera permission flow works
- full-body view produces landmarks
- losing hand/foot visibility reduces confidence instead of crashing
- no raw camera data leaves the browser

## Risks and mitigations

### Risk: Camera perspective makes foot distance unreliable

Mitigation:
- Treat foot metrics as approximate.
- Use confidence levels and user-facing wording like "appears narrow".
- Add setup guidance for camera angle.

### Risk: Pose model misses wrists/ankles during fast movement

Mitigation:
- MVP focuses on stance and light movement, not strikes.
- Use rolling windows and landmark confidence checks.
- Show "not enough visibility" instead of bad feedback when data is missing.

### Risk: Feedback becomes too generic

Mitigation:
- Each metric must produce a concrete correction.
- Rank only top 1-3 cues at a time.
- Include cause + correction where possible.

### Risk: Bad coaching from simplistic heuristics

Mitigation:
- Keep thresholds editable.
- Add examples/fixtures.
- Phrase feedback conservatively.
- Later validate with coach-reviewed video clips.

## Acceptance criteria for MVP

- App runs locally with `npm install` and `npm run dev`.
- User can start webcam from the browser.
- Pose overlay appears when body is visible.
- App supports orthodox and southpaw selection.
- App computes at least these metrics:
  - base width
  - stance length
  - knee softness
  - guard height
  - head posture
  - stability over time
- App displays detailed feedback, not only a numeric score.
- App handles missing landmarks gracefully.
- Analysis functions have unit tests with synthetic landmark fixtures.
- No backend or video upload is required.

## Future phases

### Phase 2: Movement recovery

- Analyze returning to stance after step, check, teep chamber, or punch reset.
- Add short drills: bounce, step-in/step-out, guard reset.

### Phase 3: Technique modules

- Jab/cross guard recovery.
- Low-kick check stance recovery.
- Teep balance and chamber.

### Phase 4: Personalization

- Height/body proportion calibration.
- User-specific baseline.
- Local progress trends.

### Phase 5: Coach-assisted validation

- Optional upload/share workflow.
- Coach annotations.
- Threshold tuning from labeled examples.
