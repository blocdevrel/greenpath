import { apiFetch } from './client';

export type VoiceChatResult = {
  reply: string;
  model: string;
  provider: 'openrouter';
  userTranscript?: string;
  audioBase64?: string;
  audioMimeType?: string;
  audioUrl?: string;
};

/** OpenRouter gpt-audio coach — text and/or push-to-talk audio. */
export function voiceChatApi(body: {
  message?: string;
  audioBase64?: string;
  audioFormat?: 'wav' | 'mp3' | 'webm' | 'm4a' | 'ogg' | 'mp4';
  locale?: string;
}) {
  return apiFetch<VoiceChatResult>('/voice/chat', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
