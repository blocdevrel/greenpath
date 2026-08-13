export type StreamVoiceCallProps = {
  apiKey: string;
  token: string;
  userId: string;
  userName: string;
  callType: string;
  callId: string;
  agentUserId: string;
  agentConnected: boolean;
  agentHint?: string;
  joinUrl?: string;
  onRetryAgent: () => void;
};
