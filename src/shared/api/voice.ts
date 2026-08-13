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

export type VoiceSession = {
  apiKey: string;
  token: string;
  callType: string;
  callId: string;
  userId: string;
  agentUserId: string;
  joinUrl: string;
  agentConnected: boolean;
  agentSessionId?: string | null;
  hint?: string;
};

export type AgentSessionResult = {
  session_id: string | null;
  agentConnected: boolean;
  hint?: string;
};

/** Optional Stream + Vision Agent session (requires real OPENAI_API_KEY). */
export function createVoiceSession() {
  return apiFetch<VoiceSession>('/voice/session', { method: 'POST' });
}

export function startVoiceAgentSession(callId: string, callType = 'default') {
  return apiFetch<AgentSessionResult>('/voice/agent-session', {
    method: 'POST',
    body: JSON.stringify({ callId, callType }),
  });
}

export function stopVoiceAgentSession(callId: string, sessionId: string) {
  return apiFetch<{ ok: true }>(
    `/voice/agent-session?callId=${encodeURIComponent(callId)}&sessionId=${encodeURIComponent(sessionId)}`,
    { method: 'DELETE' },
  );
}
