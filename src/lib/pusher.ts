import Pusher from 'pusher-js';
import type { GameState } from './types';

let pusherInstance: Pusher | null = null;

function getPusher(): Pusher {
  if (!pusherInstance) {
    pusherInstance = new Pusher(import.meta.env.VITE_PUSHER_KEY as string, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER as string,
    });
  }
  return pusherInstance;
}

export function subscribeToSession(
  sessionId: string,
  onStateUpdate: (state: GameState, updatedBy: string) => void
): () => void {
  const pusher = getPusher();
  const channel = pusher.subscribe(`session-${sessionId}`);

  channel.bind('state-update', (data: { gameState: GameState; updatedBy: string }) => {
    onStateUpdate(data.gameState, data.updatedBy);
  });

  return () => {
    channel.unbind_all();
    pusher.unsubscribe(`session-${sessionId}`);
  };
}
