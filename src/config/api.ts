export const BACKEND_API_URL =
  (import.meta.env.VITE_BACKEND_API_URL as string | undefined)?.replace(/\/+$/, '') ||
  'http://localhost:3000/api';

export const AI_API_URL =
  (import.meta.env.VITE_AI_API_URL as string | undefined)?.replace(/\/+$/, '') ||
  'http://localhost:8000/api/ai';

export interface SmartMatchPayload {
  user_id: number;
  origin: string;
  destination: string;
  vibe_weight?: number;
  max_walk_meters?: number;
  women_only?: boolean;
}

export interface ConciergeSlots {
  origin?: string | null;
  destination?: string | null;
  time_label?: string | null;
  seats_needed?: number | null;
  max_walk_meters?: number | null;
  auto_book?: boolean;
  vibe_preference?: string | null;
}

export interface ConciergePayload {
  user_id: number;
  message: string;
  current_slots: ConciergeSlots;
}

export interface ConciergeResponse {
  reply: string;
  response?: string;
  slots: ConciergeSlots;
  missing_slots: string[];
  is_complete: boolean;
  quick_chips: string[];
}

export interface WatcherCreatePayload {
  user_id: number;
  origin: string;
  destination: string;
  time_label: string;
  seats_needed?: number;
  max_walk_meters?: number;
  vibe_preference?: string | null;
}

export async function fetchSmartMatch(payload: SmartMatchPayload) {
  const res = await fetch(`${AI_API_URL}/smart-match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Smart Match API error: ${res.status}`);
  }
  return res.json();
}

export async function sendConciergeMessage(
  payload: ConciergePayload
): Promise<ConciergeResponse> {
  const res = await fetch(`${AI_API_URL}/concierge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`AI Concierge API error: ${res.status}`);
  }
  return res.json();
}

export async function createAiWatcher(payload: WatcherCreatePayload) {
  const res = await fetch(`${AI_API_URL}/watchers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`AI Watchers API error: ${res.status}`);
  }
  return res.json();
}

export async function fetchAiWatchers(userId: number) {
  const res = await fetch(`${AI_API_URL}/watchers/${userId}`);
  if (!res.ok) {
    throw new Error(`Fetch Watchers API error: ${res.status}`);
  }
  return res.json();
}
