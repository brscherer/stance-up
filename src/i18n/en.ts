import type { TranslationDict } from './locale';

const en: TranslationDict = {
  app: {
    title: 'Stance Up',
    eyebrow: 'Muay Thai stance coach',
    lede: 'Use your camera locally to check stance fundamentals and get clear cues for your next round.',
    startButton: 'Start Camera Setup',
    privacyNote: 'Camera frames are processed locally in your browser. No video is uploaded or stored.',
    endSession: 'End Session',
    collectData: 'Collect Strike Data',
  },

  setup: {
    heading: 'Camera Setup',
    description: 'Position your camera to capture your full body in frame. Processing happens locally — no video leaves your device.',
    fullBody: 'Full body visible',
    handsVisible: 'Hands visible',
    feetVisible: 'Feet visible',
    goodLighting: 'Good lighting',
    stableCamera: 'Stable camera',
    stance: 'Stance:',
    orthodox: 'Orthodox (left lead)',
    southpaw: 'Southpaw (right lead)',
    autoDetect: 'Auto-detect',
    startingCamera: 'Starting camera…',
    startCamera: 'Start Camera',
  },

  camera: {
    selectCamera: 'Select camera',
    stopCamera: 'Stop Camera',
    failedToStart: 'Failed to start camera',
    errors: {
      permissionDenied: 'Camera permission denied. Please allow camera access in your browser settings.',
      noCamera: 'No camera found. Please connect a camera device.',
      inUse: 'Camera is already in use by another application.',
      constraints: 'Camera does not meet the required constraints.',
    },
  },

  scorePanel: {
    stanceAnalysis: 'Stance analysis',
    scoreLabel: '/100',
    confidence: 'Confidence:',
    focusOn: 'Focus on:',
    unknown: '?',
    good: '✓',
    warn: '⚠',
    bad: '✗',
  },

  sessionSummary: {
    heading: 'Session Summary',
    noData: 'No data collected yet.',
    close: 'Close',
    sessionComplete: 'Session Complete',
    averageScore: 'Average Score',
    avgConfidence: 'Avg Confidence',
    duration: 'Duration',
    frames: 'Frames',
    best: 'Best:',
    needsWork: 'Needs Work:',
    topFocusAreas: 'Top Focus Areas',
    times: 'x',
    done: 'Done',
    privacyNote: 'Session data is stored locally only. No video or pose data leaves your device.',
  },

  metrics: {
    unknownCorrection: 'Move so both feet are visible before judging this stance detail.',

    baseWidth: {
      label: 'Base width',
      unknown: 'Not enough foot or shoulder visibility to judge base width.',
      good: 'Your base width looks balanced for a Muay Thai stance.',
      bad: 'Your feet appear too close together laterally.',
      badCorrection: 'Widen your base so your feet are not lined up and you feel harder to push over sideways.',
      warn: 'Your feet appear very wide laterally.',
      warnCorrection: 'Bring your feet slightly closer so you can step quickly without feeling stuck.',
    },

    stanceLength: {
      label: 'Stance length',
      unknown: 'Not enough foot or torso visibility to judge stance length.',
      good: 'Your front-to-back stance length looks mobile.',
      bad: 'Your stance appears too square front-to-back.',
      badCorrection: 'Step your rear foot back slightly so you are not square and can move from a fighting stance.',
      warn: 'Your stance appears too long front-to-back.',
      warnCorrection: 'Shorten the stance so you can check, teep, and step without dragging your rear leg.',
    },

    kneeSoftness: {
      label: 'Knee softness',
      unknown: 'Not enough hip, knee, or ankle visibility to judge knee bend.',
      good: 'Your knees look softly bent and ready to move.',
      bad: 'Your knees appear too straight for an athletic stance.',
      badCorrection: 'Soften your knees. Think athletic bounce, not standing tall.',
      warn: 'Your stance appears deeper than needed for mobile Muay Thai movement.',
      warnCorrection: 'Rise a little. Muay Thai stance should be mobile, not a squat.',
    },

    guardPosition: {
      label: 'Guard position',
      unknown: 'Not enough hand, head, or shoulder visibility to judge guard position.',
      good: 'Your hands are high enough to protect your head.',
      badBoth: 'Both hands are dropping below your defensive line.',
      badOne: 'One hand is dropping below your defensive line.',
      badCorrection: 'Keep your guard active with your hands near your cheek and chin line after every movement.',
    },

    headPosture: {
      label: 'Head posture',
      unknown: 'Not enough head or shoulder visibility to judge head posture.',
      good: 'Your head looks stacked over your stance.',
      warn: 'Your head appears to drift away from your stance centerline.',
      warnCorrection: 'Stack your head over your stance and keep your chin slightly tucked instead of reaching.',
    },

    weightBalance: {
      label: 'Weight balance',
      unknown: 'Not enough hip or ankle visibility to judge weight balance.',
      good: 'Your weight looks balanced over your stance.',
      warn: 'Your hips drift significantly over one leg.',
      warnCorrection: 'Center your weight over your stance so either leg can move freely for checks, teeps, and steps.',
    },

    shoulderHipAlignment: {
      label: 'Shoulder and hip alignment',
      unknown: 'Not enough shoulder or hip visibility to judge stance angle.',
      good: 'Your shoulder and hip angle looks useful for Muay Thai stance.',
      warnSideways: 'Your stance appears very sideways.',
      warnSidewaysCorrection: 'Open up enough to check kicks and throw rear-side weapons without being over-bladed.',
      warnSquare: 'Your stance appears very square.',
      warnSquareCorrection: 'Angle your stance slightly so your rear side is protected while you stay ready to check kicks.',
    },
  },

  stability: {
    noData: 'No data',
    needMoreFrames: 'Need more frames',
    stable: 'Stable',
    someDrift: 'Some drift detected',
    unstable: 'Unstable',
    label: 'Stability:',
  },

  strikes: {
    jab: 'Jab',
    cross: 'Cross',
    hook: 'Hook',
    uppercut: 'Uppercut',
    roundhouse: 'Roundhouse',
    teep: 'Teep',
    knee: 'Knee',
    check: 'Check',
  },

  recorder: {
    heading: 'Strike Data Collection',
    record: 'Record',
    waiting: 'Buffering…',
    go: 'GO!',
    recording: 'Recording…',
    allDone: 'All strikes collected! Export the data for training.',
    export: 'Export JSON',
  },

  voice: {
    mute: 'Mute',
    unmute: 'Unmute',
  },

  feedback: {
    good0: 'Your stance looks solid — keep maintaining these fundamentals.',
    good1: 'Strong stance fundamentals. Stay consistent with this structure.',
    good2: 'Excellent base. Your Muay Thai stance is well-structured.',
    warn0: 'Your stance has room for improvement. Focus on the cues below.',
    warn1: 'Decent foundation, but a few adjustments will sharpen your stance.',
    warn2: "You're close — dial in these details for a tighter stance.",
    bad0: 'Your stance needs work. Start with the top cues below.',
    bad1: 'Significant stance issues detected. Address the priority corrections.',
    bad2: 'Reset your stance and focus on the fundamentals first.',
    scoreSuffix: 'Overall score:',
  },
};

export default en;
