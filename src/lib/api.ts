import type { Session, GameState } from './types';

const BASE = import.meta.env.VITE_API_URL as string;
const API_KEY = import.meta.env.VITE_API_KEY as string;

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-apikey': API_KEY,
  };

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw Object.assign(new Error(err.error || 'Request failed'), { status: res.status });
  }

  return res.json() as Promise<T>;
}

export function createSession(settings: { legsPerSet: number; setsToWin: number; playerCount: number }) {
  return request<Session>('POST', '/sessions', { settings });
}

export function getSession(id: string) {
  return request<Session>('GET', `/sessions/${id}`);
}

export function findSessionByCode(code: string) {
  return request<Session>('GET', `/sessions/code/${code}`);
}

export function joinSession(id: string, playerName: string, userId: string) {
  return request<Session>('POST', `/sessions/${id}/join`, { playerName, userId });
}

export function updateSession(id: string, gameState: GameState, userId: string) {
  return request<Session>('PUT', `/sessions/${id}`, { gameState, updatedBy: userId });
}
