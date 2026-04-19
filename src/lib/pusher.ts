import Pusher from 'pusher-js';
import type { GameState } from './types';

let pusherInstance: Pusher | null = null;
let pusherDisabled = false;

function getPusher(): Pusher | null {
  if (pusherDisabled) return null;
  if (pusherInstance) return pusherInstance;
  const key = import.meta.env.VITE_PUSHER_KEY;
  const cluster = import.meta.env.VITE_PUSHER_CLUSTER;
  if (!key || !cluster) {
    console.warn('[pusher] VITE_PUSHER_KEY or VITE_PUSHER_CLUSTER missing — real-time sync disabled');
    pusherDisabled = true;
    return null;
  }
  try {
    pusherInstance = new Pusher(key, { cluster });
    return pusherInstance;
  } catch (err) {
    console.error('[pusher] init failed — real-time sync disabled', err);
    pusherDisabled = true;
    return null;
  }
}

export function subscribeToSession(
  sessionId: string,
  onStateUpdate: (state: GameState, updatedBy: string) => void
): () => void {
  const pusher = getPusher();
  if (!pusher) return () => {};
  const channel = pusher.subscribe(`session-${sessionId}`);

  channel.bind('state-update', (data: { gameState: GameState; updatedBy: string }) => {
    onStateUpdate(data.gameState, data.updatedBy);
  });

  return () => {
    channel.unbind_all();
    pusher.unsubscribe(`session-${sessionId}`);
  };
}
