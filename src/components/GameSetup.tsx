import { useState } from 'react';
import type { GameSettings } from '../lib/types';

interface Props {
  onStartGame: (names: string[], settings: GameSettings) => void;
}

export default function GameSetup({ onStartGame }: Props) {
  const [playerCount, setPlayerCount] = useState(2);
  const [tempNames, setTempNames] = useState<string[]>(['', '']);
  const [legsPerSet, setLegsPerSet] = useState(3);
  const [setsToWin, setSetsToWin] = useState(1);

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    setTempNames(Array(count).fill(''));
  };

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...tempNames];
    newNames[index] = value;
    setTempNames(newNames);
  };

  const handleStart = () => {
    onStartGame(tempNames, {
      legsPerSet,
      setsToWin,
      startScore: 501,
      playerCount,
    });
  };

  return (
    <div className="App">
      <div className="scoreboard-card">
        <h1>Darts 501 Game</h1>
        <div className="name-inputs stylish-card">
          <div className="player-count-selection">
            <h3>Number of Players:</h3>
            <div className="player-count-buttons">
              {[2, 3].map(count => (
                <button
                  key={count}
                  className={`count-btn ${playerCount === count ? 'active' : ''}`}
                  onClick={() => handlePlayerCountChange(count)}
                >
                  {count} Players
                </button>
              ))}
            </div>
          </div>
          <div className="name-inputs-container">
            {Array.from({ length: playerCount }, (_, i) => (
              <div key={i}>
                <label>
                  Player {i + 1} Name:
                  <input
                    type="text"
                    value={tempNames[i] || ''}
                    onChange={e => handleNameChange(i, e.target.value)}
                  />
                </label>
              </div>
            ))}
          </div>
          <div className="format-selection">
            <h3>Match Format:</h3>
            <div className="format-options">
              <div className="format-option">
                <label>Legs per Set (best of):</label>
                <select
                  value={legsPerSet === 3 ? 5 : legsPerSet === 2 ? 3 : 7}
                  onChange={e => {
                    const bestOf = parseInt(e.target.value);
                    setLegsPerSet(bestOf === 5 ? 3 : bestOf === 3 ? 2 : 4);
                  }}
                >
                  <option value={3}>Best of 3 (first to 2)</option>
                  <option value={5}>Best of 5 (first to 3)</option>
                  <option value={7}>Best of 7 (first to 4)</option>
                </select>
              </div>
              <div className="format-option">
                <label>Sets to Win Match:</label>
                <select
                  value={setsToWin}
                  onChange={e => setSetsToWin(parseInt(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7].map(n => (
                    <option key={n} value={n}>
                      {n} Set{n > 1 ? 's' : ''} {n > 1 ? `(best of ${n * 2 - 1})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <button className="start-btn" onClick={handleStart}>Start Game</button>
        </div>
      </div>
    </div>
  );
}
