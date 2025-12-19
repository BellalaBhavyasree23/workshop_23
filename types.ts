
export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
  groundingSources?: GroundingSource[];
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}
