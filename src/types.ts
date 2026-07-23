export type ViewMode = 'assistant' | 'desktop-studio' | 'media-studio' | 'memory-heartbeat';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface MemoryFact {
  id: string;
  userId: string;
  fact: string;
  category: 'preference' | 'identity' | 'decision' | 'general';
  createdAt: string;
}

export interface HeartbeatTask {
  id: string;
  title: string;
  schedule: string; // e.g. "Every 1 hour", "Daily 9:00 AM"
  enabled: boolean;
  lastRun?: string;
  status: 'idle' | 'running' | 'triggered' | 'quiet';
  quietOnly: boolean;
}

export interface PendingAction {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'trillion' | 'system';
  text: string;
  timestamp: string;
  thinking?: string;
  modelUsed?: string;
  audioUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  musicUrl?: string;
  sources?: Array<{ title: string; url: string }>;
  places?: Array<{ name: string; address: string; rating?: number; mapsUrl?: string }>;
  toolCall?: string;
  isVoiceInput?: boolean;
}

export interface DesktopAppConfig {
  agentName: string;
  localUrl: string;
  port: number;
  os: 'macOS' | 'Windows' | 'Linux';
  serverFramework: string;
  serverStartMethod: string;
  requiresMic: boolean;
  pythonVersion: string;
  hasOAuth: boolean;
  bundleId: string;
  iconUrl?: string;
  distributionType: 'local' | 'distribute';
}

export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';
export type ImageResolution = '1K' | '2K' | '4K';

export interface ImageGenParams {
  prompt: string;
  aspectRatio: AspectRatio;
  quality: 'fast' | 'pro';
  resolution: ImageResolution;
  inputImageBase64?: string;
}

export interface VideoGenParams {
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  inputImageBase64?: string;
}

export interface MusicGenParams {
  prompt: string;
  type: 'clip' | 'full';
  durationSeconds: number;
}
