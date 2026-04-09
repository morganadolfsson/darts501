import type { GameState } from '../lib/types';
import { getCheckoutSuggestion } from '../lib/checkouts';

interface Props {
  state: GameState;
}

export default function Scoreboard({ state }: Props) {
  const { players, currentPlayer, currentRemaining, settings, matchOver, matchWinner, gameOver } = state;
  const currentP = players[currentPlayer];
  const suggestion = getCheckoutSuggestion(currentRemaining);
  const manyPlayers = settings.playerCount >= 3 ? 'many-players' : '';

  return (
    <>
      <div className={`sets-legs-display stylish-row ${manyPlayers}`}>
        {players.map((player, i) => (
          <div
            key={i}
            className={`sets-legs-score ${currentPlayer === i ? 'current stylish-active' : ''}`}
          >
            <div className="player-name-display">{player.name}</div>
            <div className="sets-legs-stats">
              <div className="sets-display">Sets: <strong>{player.sets}</strong></div>
              <div className="legs-display">Legs: <strong>{player.legs}</strong></div>
            </div>
          </div>
        ))}
      </div>
      <div className={`scoreboard stylish-row ${manyPlayers}`}>
        {players.map((player, i) => (
          <div
            key={i}
            className={`player-score stylish-card ${currentPlayer === i ? 'current stylish-active' : ''}`}
          >
            {player.name}: {currentPlayer === i ? currentRemaining : player.score}
          </div>
        ))}
      </div>
      {!gameOver && !matchOver ? (
        <div>
          <h2>Current Turn: <span className="stylish-active">{currentP?.name}</span></h2>
          <div className="format-info">
            First to {settings.legsPerSet} legs wins set | First to {settings.setsToWin} sets wins match
            {!settings.doubleOut && ' | No double checkout required'}
          </div>
          {suggestion && suggestion !== 'No checkout possible' && (
            <p className="suggestion">Checkout suggestion: <strong>{suggestion}</strong></p>
          )}
          {suggestion === null && currentRemaining <= 170 && currentRemaining >= 2 && (
            <p className="suggestion"><em>No checkout possible this turn</em></p>
          )}
        </div>
      ) : matchOver && matchWinner !== null ? (
        <h2 className="game-over">Match Over - {players[matchWinner]?.name} wins the match!</h2>
      ) : (
        <h2 className="game-over">Game Over - {currentP?.name} wins!</h2>
      )}
    </>
  );
}
