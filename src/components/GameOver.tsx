import type { GameState } from '../lib/types';

interface Props {
  state: GameState;
  onNewMatch: () => void;
  onHome?: () => void;
}

export default function GameOver({ state, onNewMatch, onHome }: Props) {
  if (!state.matchOver || state.matchWinner === null) return null;
  const winner = state.players[state.matchWinner];

  const winnerTurns = state.turns.filter(t => t.player === state.matchWinner && !t.bust);
  const avg = winnerTurns.length ? (winnerTurns.reduce((s, t) => s + t.total, 0) / winnerTurns.length).toFixed(1) : '—';
  const high = winnerTurns.reduce((m, t) => Math.max(m, t.total), 0);
  const tons = winnerTurns.filter(t => t.total >= 100).length;

  return (
    <div className="gameover">
      <div className="gameover-card">
        <div className="kicker">GAME · SHOT · AND · THE · MATCH</div>
        <h1>{winner.name}</h1>
        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--accent-2)', marginTop: 4 }}>
          {winner.tagline || 'Champion of the oche'}
        </div>
        <div className="stats">
          <div className="stat"><div className="k">Average</div><div className="v">{avg}</div></div>
          <div className="stat"><div className="k">Highest</div><div className="v">{high}</div></div>
          <div className="stat"><div className="k">Tons (100+)</div><div className="v">{tons}</div></div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn primary" onClick={onNewMatch}>Rematch</button>
          {onHome && <button className="btn ghost" onClick={onHome}>Back to pub</button>}
        </div>
      </div>
    </div>
  );
}
