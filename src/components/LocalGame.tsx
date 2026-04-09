import { useGame } from '../hooks/use-game';
import GameSetup from './GameSetup';
import Scoreboard from './Scoreboard';
import DartInput from './DartInput';
import DartHistory from './DartHistory';
import GameOver from './GameOver';

export default function LocalGame() {
  const { state, startGame, throwDart, setMultiplier, editDart, newMatch } = useGame();

  if (!state.gameStarted) {
    return <GameSetup onStartGame={startGame} />;
  }

  return (
    <div className="App stylish-bg">
      <div className="scoreboard-card stylish-card">
        <h1>
          {state.settings.doubleOut
            ? `Darts ${state.settings.startScore} Scoreboard`
            : `Darts ${state.settings.startScore} Rookies`}
        </h1>
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
