export enum Role {
  USER = 'user',
  AI = 'ai',
}

export interface Message {
  role: Role;
  content: string;
}

export interface Document {
    name: string;
    status: 'ready' | 'processing' | 'error';
    size: string;
    url?: string;
    content?: string;
}
