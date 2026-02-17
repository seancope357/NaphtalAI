import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { ChatMessage, AIProvider } from "@/types";

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  aiProvider: AIProvider;
  apiKey: string;
  contextNodeIds: string[];
  
  // Actions
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  clearMessages: () => void;
  setLoading: (isLoading: boolean) => void;
  setAIProvider: (provider: AIProvider) => void;
  setApiKey: (key: string) => void;
  setContextNodes: (nodeIds: string[]) => void;
  addContextNode: (nodeId: string) => void;
  removeContextNode: (nodeId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  aiProvider: "openai",
  apiKey: "",
  contextNodeIds: [],
  
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: uuidv4(),
          timestamp: new Date(),
        },
      ],
    })),
  
  clearMessages: () => set({ messages: [] }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setAIProvider: (provider) => set({ aiProvider: provider }),
  
  setApiKey: (key) => set({ apiKey: key }),
  
  setContextNodes: (nodeIds) => set({ contextNodeIds: nodeIds }),
  
  addContextNode: (nodeId) =>
    set((state) => ({
      contextNodeIds: state.contextNodeIds.includes(nodeId)
        ? state.contextNodeIds
        : [...state.contextNodeIds, nodeId],
    })),
  
  removeContextNode: (nodeId) =>
    set((state) => ({
      contextNodeIds: state.contextNodeIds.filter((id) => id !== nodeId),
    })),
}));

// Helper to create user message
export function createUserMessage(content: string, nodeContext?: string[]): Omit<ChatMessage, "id" | "timestamp"> {
  return {
    role: "user",
    content,
    nodeContext,
  };
}

// Helper to create assistant message
export function createAssistantMessage(content: string): Omit<ChatMessage, "id" | "timestamp"> {
  return {
    role: "assistant",
    content,
  };
}
