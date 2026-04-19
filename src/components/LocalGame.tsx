// Drop into src/components/LocalGame.tsx — replaces original
import { useState } from 'react';
import { useGame } from '../hooks/use-game';
import GameSetup from './GameSetup';
import Scoreboard from './Scoreboard';
import DartInput from './DartInput';
import GameOver from './GameOver';
import ReactionLayer from './ReactionLayer';

const DEFAULT_TWEAKS = { gifsEnabled: true, soundEnabled: true, reactionSensitivity: 'generous' as const };

export default function LocalGame() {
  const { state, startGame, throwDart, undo, newMatch } = useGame();
  const [tweaks] = useState(DEFAULT_TWEAKS);

  if (!state.gameStarted) return <GameSetup onStartGame={startGame} />;

  return (
    <div className="page">
      <div className="bar-header">
        <div className="bar-logo">
          <span className="dot" /><span className="dot-2" />
          <div className="bar-title">
            <span className="display">501 · LIVE MATCH</span>
            <span className="sub">BEST OF {state.settings.legsPerSet * 2 - 1} LEGS · {state.settings.setsToWin} SET{state.settings.setsToWin > 1 ? 'S' : ''}</span>
          </div>
        </div>
      </div>
      <div className="page-body game">
        <Scoreboard state={state} tweaks={tweaks} />
        <div className="play-area">
          <div className="board-stage" style={{ position: 'relative' }}>
            <DartInput onThrow={throwDart} onUndo={undo} disabled={state.gameOver || state.matchOver} />
            <ReactionLayer event={state.lastEvent} tweaks={tweaks} players={state.players} />
          </div>
        </div>
      </div>
      <GameOver state={state} onNewMatch={newMatch} />
    </div>
  );
}
