export type OpenAIVoice =
  | 'alloy'
  | 'echo'
  | 'fable'
  | 'onyx'
  | 'nova'
  | 'shimmer';
export type GoogleVoice = 'en-US-Neural2-F' | 'en-US-Neural2-D';
export type OfflineVoice =
  | 'en_US-amy-medium'
  | 'en_US-lessac-medium'
  | 'en_GB-alba-medium';
export type VoiceType = OpenAIVoice | GoogleVoice | OfflineVoice;

export interface AIVoice {
  id: VoiceType;
  name: string;
  avatar: string;
  model: 'tts-1' | 'tts-1-hd' | 'google' | 'offline';
  provider?: 'openai' | 'google' | 'offline';
  isOffline?: boolean;
  requiresDownload?: boolean;
  gender?: 'male' | 'female';
  language?: string;
  comingSoon?: boolean;
}

export const onlineVoices: AIVoice[] = [
  {
    id: 'nova',
    name: 'Sophia',
    avatar: '../../assets/Nova.png',
    model: 'tts-1-hd',
    provider: 'openai',
    isOffline: false,
  },
  {
    id: 'onyx',
    name: 'Marcus',
    avatar: '../../assets/Onyx.png',
    model: 'tts-1-hd',
    provider: 'openai',
    isOffline: false,
  },
];

// All available offline voices (Piper TTS)
// These will only be shown in the voice picker if they are downloaded
// Using "medium" quality models for best balance of quality and size
export const allOfflineVoices: AIVoice[] = [
  {
    id: 'en_US-amy-medium',
    name: 'Amy',
    avatar: '../../assets/Shimmer.png',
    model: 'offline',
    isOffline: true,
    requiresDownload: true,
    gender: 'female',
    language: 'en-US',
  },
  {
    id: 'en_US-lessac-medium',
    name: 'Lessac',
    avatar: '../../assets/Fable.png',
    model: 'offline',
    isOffline: true,
    requiresDownload: true,
    gender: 'male',
    language: 'en-US',
  },
  {
    id: 'en_GB-alba-medium',
    name: 'Alba',
    avatar: '../../assets/Echo.jpg',
    model: 'offline',
    isOffline: true,
    requiresDownload: true,
    gender: 'female',
    language: 'en-GB',
  },
];

// Helper function to get only downloaded offline voices
// This should be called with the list of downloaded voice IDs from usePiperDownload
export function getDownloadedOfflineVoices(
  downloadedVoiceIds: string[]
): AIVoice[] {
  return allOfflineVoices.filter((voice) =>
    downloadedVoiceIds.includes(voice.id)
  );
}

// Backward compatibility - empty by default, populated by downloaded voices
export const offlineVoices: AIVoice[] = [];

// For backward compatibility
export const availableVoices: AIVoice[] = onlineVoices;
