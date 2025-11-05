// types/message.ts

export type MessageType = 'success' | 'error' | 'warning' | 'info';

export interface MessageState {
  message: string;
  type: MessageType;
}
