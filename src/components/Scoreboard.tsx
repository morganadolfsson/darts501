// Drop into src/components/Scoreboard.tsx — replaces original
import type { GameState } from '../lib/types';
import { getCheckoutSuggestion } from '../lib/checkouts';
import { ReactionSlot } from './ReactionLayer';

interface Tweaks { gifsEnabled: boolean; soundEnabled: boolean; reactionSensitivity: 'sparing' | 'balanced' | 'generous'; }

export default function Scoreboard({ state, tweaks }: { state: GameState; tweaks: Tweaks }) {
  const { players, currentPlayer, currentRemaining, turnDarts, settings } = state;
  const count = players.length;
  const cols = count <= 2 ? 'repeat(2, 1fr)' : count === 3 ? 'repeat(3, 1fr)' : count === 4 ? 'repeat(4, 1fr)' : 'repeat(5, 1fr)';
  const suggestion = getCheckoutSuggestion(currentRemaining, settings.doubleOut);

  return (
    <>
      <div className="stats-strip" style={{ gridTemplateColumns: cols }}>
        {players.map((p, i) => {
          const active = i === currentPlayer;
          const shown = active ? currentRemaining : p.score;
          const avg = p.turnsThrown > 0 ? (p.totalScored / p.turnsThrown).toFixed(1) : '—';
          return (
            <div key={i} className={`player-card ${active ? 'active' : ''}`}>
              <div className="avatar">{p.avatar || '🎯'}</div>
              <div>
                <div className="player-name">{p.name}</div>
                {p.tagline && <div className="player-tag">"{p.tagline}"</div>}
                <div className="player-meta">
                  <span>AVG<strong>{avg}</strong></span>
                  <span>HIGH<strong>{p.highestTurn || 0}</strong></span>
                  <span>CO%<strong>{p.checkoutAttempts ? Math.round(100*p.checkoutHits/p.checkoutAttempts) : 0}</strong></span>
                </div>
              </div>
              <div className="score-block">
                <div className="big">{shown}</div>
                <div className="sub">Remaining</div>
                <div className="sets-legs">
                  <span>SETS <strong>{p.sets}</strong></span>
                  <span>LEGS
                    <span className="dots" style={{ marginLeft: 6 }}>
                      {Array.from({ length: settings.legsPerSet }, (_, j) => (
                        <span key={j} className={`dot ${j < p.legs ? 'on' : ''}`} />
                      ))}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="turn-banner">
        <div>
          <span className="require">You require</span>{' '}
          <span className="number">{currentRemaining}</span>
          {suggestion && <span className="checkout"> · {suggestion}</span>}
        </div>
        <div className="turn-gif-slot">
          <ReactionSlot event={state.lastEvent} tweaks={tweaks} players={state.players} />
        </div>
        <div className="darts">
          {[0,1,2].map(i => {
            const d = turnDarts[i];
            return (
              <div key={i} className={`dart-slot ${d ? 'filled' : ''}`}>
                {d ? `${d.multiplier==='S'?'':d.multiplier}${d.baseValue}` : `${i+1}`}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
