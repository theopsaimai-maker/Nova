export type Role = "user" | "assistant" | "system";

export interface Attachment {
  id: string;
  name: string;
  type: "image" | "pdf" | "docx" | "txt" | "csv" | "other";
  url: string;
  mimeType: string;
  size: number;
}

export interface Citation {
  index: number;
  title: string;
  url: string;
  snippet?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: Role;
  content: string;
  attachments?: Attachment[];
  citations?: Citation[];
  tokenCount?: number;
  createdAt: string;
  feedback?: "up" | "down" | null;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  pinned: boolean;
  model: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  settings?: UserSettings;
}

export interface UserSettings {
  theme: "light" | "dark" | "system";
  customInstructions?: string;
  memoryEnabled: boolean;
  historyEnabled: boolean;
}

export type GroupedConversations = {
  label: string;
  items: Conversation[];
}[];

export interface ChatRequest {
  conversationId?: string;
  message: string;
  model?: string;
  attachments?: Attachment[];
}

export interface SSEEvent {
  type: "token" | "tool_call" | "citation" | "done" | "error";
  data: string;
}
