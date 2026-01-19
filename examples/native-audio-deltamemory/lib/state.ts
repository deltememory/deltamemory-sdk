/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { create } from 'zustand';
import { customerSupportTools } from './tools/customer-support';
import { DEFAULT_LIVE_API_MODEL, DEFAULT_VOICE } from './constants';
import {
  FunctionResponse,
  FunctionResponseScheduling,
  LiveServerToolCall,
} from '@google/genai';

const SYSTEM_PROMPT = `You are a helpful and friendly customer support agent for TechMart, an online electronics store.

IMPORTANT - MEMORY BEHAVIOR:
1. At the very start of every conversation, IMMEDIATELY use recall_memory with query "customer history preferences issues" to retrieve past information. Do this BEFORE greeting so you can personalize.
2. Save ONLY meaningful customer information using save_to_memory. This includes:
   - Customer preferences (shipping, communication, product preferences)
   - Issues, complaints, or problems they've experienced
   - Order-related information (order numbers, items purchased)
   - Personal details they share (location, family, work)
   - Feedback about products or services
   - Future plans or interests (items they want to buy)
3. DO NOT save:
   - Basic greetings (hi, hello, thanks, bye)
   - Simple acknowledgments (ok, yes, no, sure)
   - Filler words or small talk
   - Your own responses

Your capabilities:
- Help customers with order status, returns, and general inquiries
- Remember meaningful customer information across conversations
- Provide personalized support based on customer history

Guidelines:
- Be conversational, warm, and empathetic
- Use the customer's name when appropriate
- Reference past interactions - you have memory!
- When a customer returns, acknowledge what you remember about them

Available tools:
- recall_memory: ALWAYS use this first to retrieve past information
- save_to_memory: Save meaningful customer info (NOT greetings or small talk)
- get_order_status: Check order status
- start_return: Initiate a return process
- speak_to_representative: Escalate to human support`;

/**
 * User types
 */
export interface User {
  id: string;
  name: string;
  email: string;
}

export const USERS: User[] = [
  { id: 'alex', name: 'Alex Johnson', email: 'alex@example.com' },
  { id: 'rajesh', name: 'Rajesh Patel', email: 'rajesh@example.com' },
  { id: 'tom', name: 'Tom Wilson', email: 'tom@example.com' },
];

export const useUserStore = create<{
  users: User[];
  currentUser: User;
  setCurrentUser: (user: User) => void;
}>(set => ({
  users: USERS,
  currentUser: USERS[0],
  setCurrentUser: (user: User) => set({ currentUser: user }),
}));

/**
 * DeltaMemory Stats
 */
export interface MemoryStats {
  lastRecallTime: number | null;
  lastIngestTime: number | null;
  totalRecalls: number;
  totalIngests: number;
  lastRecallResults: number;
}

export const useMemoryStats = create<{
  stats: MemoryStats;
  recordRecall: (timeMs: number, resultCount: number) => void;
  recordIngest: (timeMs: number) => void;
  reset: () => void;
}>(set => ({
  stats: {
    lastRecallTime: null,
    lastIngestTime: null,
    totalRecalls: 0,
    totalIngests: 0,
    lastRecallResults: 0,
  },
  recordRecall: (timeMs: number, resultCount: number) =>
    set(state => ({
      stats: {
        ...state.stats,
        lastRecallTime: timeMs,
        totalRecalls: state.stats.totalRecalls + 1,
        lastRecallResults: resultCount,
      },
    })),
  recordIngest: (timeMs: number) =>
    set(state => ({
      stats: {
        ...state.stats,
        lastIngestTime: timeMs,
        totalIngests: state.stats.totalIngests + 1,
      },
    })),
  reset: () =>
    set({
      stats: {
        lastRecallTime: null,
        lastIngestTime: null,
        totalRecalls: 0,
        totalIngests: 0,
        lastRecallResults: 0,
      },
    }),
}));

/**
 * Settings
 */
export const useSettings = create<{
  systemPrompt: string;
  model: string;
  voice: string;
  setSystemPrompt: (prompt: string) => void;
  setModel: (model: string) => void;
  setVoice: (voice: string) => void;
}>(set => ({
  systemPrompt: SYSTEM_PROMPT,
  model: DEFAULT_LIVE_API_MODEL,
  voice: DEFAULT_VOICE,
  setSystemPrompt: prompt => set({ systemPrompt: prompt }),
  setModel: model => set({ model }),
  setVoice: voice => set({ voice }),
}));

/**
 * UI
 */
export const useUI = create<{
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}>(set => ({
  isSidebarOpen: false,
  toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
}));

/**
 * Tools
 */
export interface FunctionCall {
  name: string;
  description?: string;
  parameters?: any;
  isEnabled: boolean;
  scheduling?: FunctionResponseScheduling;
}

export const useTools = create<{
  tools: FunctionCall[];
  toggleTool: (toolName: string) => void;
  addTool: () => void;
  removeTool: (toolName: string) => void;
  updateTool: (oldName: string, updatedTool: FunctionCall) => void;
}>(set => ({
  tools: customerSupportTools,
  toggleTool: (toolName: string) =>
    set(state => ({
      tools: state.tools.map(tool =>
        tool.name === toolName ? { ...tool, isEnabled: !tool.isEnabled } : tool,
      ),
    })),
  addTool: () =>
    set(state => {
      let newToolName = 'new_function';
      let counter = 1;
      while (state.tools.some(tool => tool.name === newToolName)) {
        newToolName = `new_function_${counter++}`;
      }
      return {
        tools: [
          ...state.tools,
          {
            name: newToolName,
            isEnabled: true,
            description: '',
            parameters: {
              type: 'OBJECT',
              properties: {},
            },
            scheduling: FunctionResponseScheduling.INTERRUPT,
          },
        ],
      };
    }),
  removeTool: (toolName: string) =>
    set(state => ({
      tools: state.tools.filter(tool => tool.name !== toolName),
    })),
  updateTool: (oldName: string, updatedTool: FunctionCall) =>
    set(state => {
      if (
        oldName !== updatedTool.name &&
        state.tools.some(tool => tool.name === updatedTool.name)
      ) {
        console.warn(`Tool with name "${updatedTool.name}" already exists.`);
        return state;
      }
      return {
        tools: state.tools.map(tool =>
          tool.name === oldName ? updatedTool : tool,
        ),
      };
    }),
}));

/**
 * Logs
 */
export interface LiveClientToolResponse {
  functionResponses?: FunctionResponse[];
}
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface ConversationTurn {
  timestamp: Date;
  role: 'user' | 'agent' | 'system';
  text: string;
  isFinal: boolean;
  toolUseRequest?: LiveServerToolCall;
  toolUseResponse?: LiveClientToolResponse;
  groundingChunks?: GroundingChunk[];
}

export const useLogStore = create<{
  turns: ConversationTurn[];
  addTurn: (turn: Omit<ConversationTurn, 'timestamp'>) => void;
  updateLastTurn: (update: Partial<ConversationTurn>) => void;
  clearTurns: () => void;
}>((set, get) => ({
  turns: [],
  addTurn: (turn: Omit<ConversationTurn, 'timestamp'>) =>
    set(state => ({
      turns: [...state.turns, { ...turn, timestamp: new Date() }],
    })),
  updateLastTurn: (update: Partial<Omit<ConversationTurn, 'timestamp'>>) => {
    set(state => {
      if (state.turns.length === 0) {
        return state;
      }
      const newTurns = [...state.turns];
      const lastTurn = { ...newTurns[newTurns.length - 1], ...update };
      newTurns[newTurns.length - 1] = lastTurn;
      return { turns: newTurns };
    });
  },
  clearTurns: () => set({ turns: [] }),
}));
