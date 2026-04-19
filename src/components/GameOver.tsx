// Drop into src/components/GameOver.tsx — replaces original
import type { GameState } from '../lib/types';

interface Props { state: GameState; onNewMatch: () => void; }

export default function GameOver({ state, onNewMatch }: Props) {
  if (!state.matchOver || state.matchWinner === null) return null;
  const winner = state.players[state.matchWinner];
  const turns = state.turns.filter(t => t.player === state.matchWinner && !t.bust);
  const avg = turns.length ? (turns.reduce((s,t)=>s+t.total,0) / turns.length).toFixed(1) : '—';
  const high = turns.reduce((m,t) => Math.max(m,t.total), 0);
  const tons = turns.filter(t => t.total >= 100).length;

  return (
    <div className="gameover">
      <div className="gameover-card">
        <div className="kicker">GAME · SHOT · AND · THE · MATCH</div>
        <h1>{winner.name}</h1>
        <div style={{ fontFamily: 'var(--font-marker)', fontSize: 26, color: 'var(--accent-2)', marginTop: -6 }}>
          {winner.tagline || 'Champion of the oche'}
        </div>
        <div className="stats">
          <div className="stat"><div className="k">Average</div><div className="v">{avg}</div></div>
          <div className="stat"><div className="k">Highest</div><div className="v">{high}</div></div>
          <div className="stat"><div className="k">Tons (100+)</div><div className="v">{tons}</div></div>
        </div>
        <button className="btn primary" onClick={onNewMatch}>Rematch</button>
      </div>
    </div>
  );
}
