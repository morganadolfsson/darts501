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
    throwDart,
    setMultiplier,
    editDart,
    startGame,
    newMatch,
  } = useSession(id!);

  if (!state.gameStarted) {
    return <GameSetup onStartGame={startGame} />;
  }

  return (
    <div className="App stylish-bg">
      <div className="scoreboard-card stylish-card">
        <h1>Darts 501 Scoreboard</h1>
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
