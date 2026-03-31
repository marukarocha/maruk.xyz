export type StageId = 'overview' | 'cargo' | 'frame' | 'size' | 'rear';

export type CameraPose = {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  duration?: number;
};

export type BikeStage = {
  id: StageId;
  titleLines: string[];
  accentLine: number;
  ghostWord: string;
  supportLabel: string;
  subtitleLines: string[];
  accent: string;
  camera: CameraPose;
};

export type FrameSealId = 'aluminium-triple' | 'weld-reinforcement' | 'robotic-welds' | 'high-strength';

export type FrameSeal = {
  id: FrameSealId;
  label: string;
  description: string;
  camera: CameraPose;
};

export type HotspotId = 'deck' | 'cockpit' | 'frame' | 'rear';

export type BikeHotspot = {
  id: HotspotId;
  stageId: StageId;
  title: string;
  description: string;
  position: [number, number, number];
  nodeName?: string;
};
