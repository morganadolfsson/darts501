import { useParams } from 'react-router-dom';
import { useSession } from '../hooks/use-session';
import GameSetup from './GameSetup';
import Scoreboard from './Scoreboard';
import DartInput from './DartInput';
import DartHistory from './DartHistory';
import GameOver from './GameOver';

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const {
    state,
    sessionCode,
    loading,
    throwDart,
    setMultiplier,
    editDart,
    startGame,
    newMatch,
  } = useSession(id!);

  if (loading) {
    return <div className="loading">Loading session...</div>;
  }

  if (!state.gameStarted) {
    return <GameSetup onStartGame={startGame} sessionCode={sessionCode} />;
  }

  const gameLabel = state.settings.doubleOut
    ? `Darts ${state.settings.startScore} Scoreboard`
    : `Darts ${state.settings.startScore} Rookies`;

  return (
    <div className="App stylish-bg">
      <div className="scoreboard-card stylish-card">
        <h1>{gameLabel}</h1>
        {sessionCode && (
          <div className="session-code-inline">
            Session: <strong>{sessionCode}</strong>
          </div>
        )}
        <Scoreboard state={state} />
        {state.message && <p className="message stylish-message">{state.message}</p>}
        <DartInput
          multiplier={state.multiplier}
          onSetMultiplier={setMultiplier}
          onThrow={throwDart}
          disabled={state.gameOver || state.matchOver}
        />
        <GameOver state={state} onNewMatch={newMatch} />
      </div>
      <DartHistory
        history={state.history}
        players={state.players}
        onEditDart={editDart}
      />
    </div>
  );
}
