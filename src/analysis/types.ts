export type StrikeType = 'jab' | 'cross' | 'hook' | 'uppercut' | 'roundhouse' | 'teep' | 'knee' | 'check';

export type StanceSide = 'orthodox' | 'southpaw';
export type StanceSelection = StanceSide | 'auto';

export type StanceMetricStatus = 'good' | 'warn' | 'bad' | 'unknown';

export interface PoseLandmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
  presence?: number;
}

export interface StanceMetric {
  id: string;
  label: string;
  status: StanceMetricStatus;
  score: number;
  confidence: number;
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
