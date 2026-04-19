import { useRef } from 'react';
import type { GameState } from '../lib/types';
import Scoreboard from './Scoreboard';
import Dartboard from './Dartboard';
import ReactionLayer from './ReactionLayer';
import GameOver from './GameOver';

interface Tweaks {
  gifsEnabled: boolean;
  soundEnabled: boolean;
  reactionSensitivity: 'generous' | 'normal' | 'sparing';
}

interface Props {
  state: GameState;
  tweaks: Tweaks;
  onThrow: (base: number, mult: 'S' | 'D' | 'T') => void;
  onUndo: () => void;
  onNewMatch: () => void;
  onHome?: () => void;
  headerTitle?: string;
  headerSub?: string;
  sessionCode?: string | null;
}

export default function GameShell({
  state, tweaks, onThrow, onUndo, onNewMatch, onHome,
  headerTitle = '501 · LIVE MATCH',
  headerSub,
  sessionCode,
}: Props) {
  const boardStageRef = useRef<HTMLDivElement>(null);
  const disabled = state.gameOver || state.matchOver;
  const sub = headerSub ?? `BEST OF ${state.settings.legsPerSet * 2 - 1} LEGS · ${state.settings.setsToWin} SET${state.settings.setsToWin > 1 ? 'S' : ''}`;

  return (
    <div className="page">
      <div className="bar-header">
        <div className="bar-logo">
          <span className="dot" /><span className="dot-2" />
          <div className="bar-title">
            <span className="display">{headerTitle}</span>
            <span className="sub">{sub}</span>
          </div>
        </div>
        <div className="bar-status">
          <span>{sessionCode ? `SESSION · ${sessionCode}` : 'LOCAL'}</span>
          <span className="live"><span className="pulse" /> ON THE OCHE</span>
        </div>
      </div>
      <div className="page-body game">
        <Scoreboard state={state} tweaks={tweaks} />
        <div className="play-area">
          <div className="board-stage" ref={boardStageRef}>
            <div className="board-controls">
              <button className="tiny-btn" onClick={onUndo} disabled={state.turnDarts.length === 0}>↶ UNDO</button>
              <button className="tiny-btn" onClick={() => onThrow(0, 'S')}>✕ MISS</button>
            </div>
            <Dartboard onThrow={onThrow} disabled={disabled} />
            <ReactionLayer event={state.lastEvent} tweaks={tweaks} players={state.players} />
          </div>
          <div className="history">
            <div className="history-head">
              <span>Turn history</span>
              <span style={{ color: 'var(--ink-2)' }}>{state.turns.length} turns</span>
            </div>
            <div className="history-list">
              {state.turns.map((t, idx) => {
                const p = state.players[t.player];
                const klass = t.bust ? 'bust' : t.total >= 100 ? 'ton' : '';
                return (
                  <div key={idx} className={`turn-card ${klass}`}>
                    <div className="t-avatar">{p?.avatar || '🎯'}</div>
                    <div>
                      <div className="t-name">{p?.name}</div>
                      <div className="t-darts">
                        {t.darts.map((d, j) => (
                          <span key={j} className="t-dart">
                            {d.mult === 'S' ? '' : d.mult}{d.base || 0}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="t-total">{t.bust ? 'BUST' : t.total}</div>
                  </div>
                );
              })}
              {state.turns.length === 0 && (
                <div style={{ color: 'var(--ink-2)', padding: 24, textAlign: 'center', fontSize: 13, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  Awaiting first dart
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="input-dock">
          <button className="quick-btn" onClick={() => onThrow(20,'T')}>T20 · 60</button>
          <button className="quick-btn" onClick={() => onThrow(19,'T')}>T19 · 57</button>
          <button className="quick-btn" onClick={() => onThrow(18,'T')}>T18 · 54</button>
          <button className="quick-btn" onClick={() => onThrow(20,'D')}>D20 · 40</button>
          <button className="quick-btn" onClick={() => onThrow(16,'D')}>D16 · 32</button>
          <button className="quick-btn" onClick={() => onThrow(50,'D')}>BULL · 50</button>
          <button className="quick-btn undo" onClick={onUndo}>↶ UNDO</button>
        </div>
      </div>
      <GameOver state={state} onNewMatch={onNewMatch} onHome={onHome} />
    </div>
  );
}
