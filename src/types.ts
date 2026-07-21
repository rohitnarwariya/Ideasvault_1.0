export type Platform = 'YOUTUBE' | 'INSTAGRAM' | 'PINTEREST' | 'WEBSITE' | 'REDDIT' | 'PODCAST' | 'LINKEDIN' | 'GITHUB' | 'OTHER';

export type AiStatus = 'pending' | 'ready' | 'failed';

export interface AiAnalysis {
  creativeInsight: string;
  whyItWorks: string;
  sequentialBlueprint: string[];
  howToAdapt: string[];
}

export interface Inspiration {
  id: string;
  title: string;
  url: string;
  notes: string;
  tags: string[];
  platform: Platform;
  board: string;
  createdAt: string;
  isFavorite: boolean;
  imageUrl?: string;
  voiceUrl?: string;
  aiStatus: AiStatus;
  aiAnalysis: AiAnalysis | null;
  collectionId?: string | null;
  collection_id?: string | null;
  observations?: string;
  actionItems?: { text: string; checked: boolean }[];
  voiceTranscript?: string;
}

export interface Board {
  id: string;
  name: string;
  icon?: string;
}
