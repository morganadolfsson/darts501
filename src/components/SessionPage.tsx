import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSession } from '../hooks/use-session';
import GameSetup from './GameSetup';
import Scoreboard from './Scoreboard';
import DartInput from './DartInput';
import GameOver from './GameOver';
import ReactionLayer from './ReactionLayer';

const DEFAULT_TWEAKS = { gifsEnabled: true, soundEnabled: true, reactionSensitivity: 'generous' as const };

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const {
    state,
    sessionCode,
    loading,
    throwDart,
    undo,
    startGame,
    newMatch,
  } = useSession(id!);
  const [tweaks] = useState(DEFAULT_TWEAKS);

  if (loading) {
    return <div className="loading">Loading session...</div>;
  }

  if (!state.gameStarted) {
    return <GameSetup onStartGame={startGame} sessionCode={sessionCode} />;
  }

  return (
    <div className="page">
      <div className="bar-header">
        <div className="bar-logo">
          <span className="dot" /><span className="dot-2" />
          <div className="bar-title">
            <span className="display">501 · LIVE MATCH</span>
            <span className="sub">
              BEST OF {state.settings.legsPerSet * 2 - 1} LEGS · {state.settings.setsToWin} SET{state.settings.setsToWin > 1 ? 'S' : ''}
              {sessionCode && <> · CODE <strong>{sessionCode}</strong></>}
            </span>
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
