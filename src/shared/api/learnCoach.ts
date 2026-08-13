import { apiFetch } from './client';

export type LearnCoachChatResult = {
  reply: string;
  model: string;
  provider: 'openrouter';
  lessonTitle?: string;
};

export type LearnCoachHistoryMessage = {
  role: 'user' | 'assistant';
  content: string;
};

/** Quick text coach about the current lesson — proxied through greenserver → OpenRouter. */
export function learnCoachChatApi(body: {
  message: string;
  lessonId?: string;
  history?: LearnCoachHistoryMessage[];
}) {
  return apiFetch<LearnCoachChatResult>('/courses/coach/chat', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
