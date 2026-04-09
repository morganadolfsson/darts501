import { useState } from 'react';
import type { GameSettings } from '../lib/types';

type GameMode = '501' | '301-rookies';

const PRESETS: Record<GameMode, { label: string; description: string; startScore: number; doubleOut: boolean }> = {
  '501': {
    label: 'Standard 501',
    description: 'Classic 501 — must check out on a double or bull',
    startScore: 501,
    doubleOut: true,
  },
  '301-rookies': {
    label: '301 for Rookies',
    description: '301 — no double checkout required, just hit zero!',
    startScore: 301,
    doubleOut: false,
  },
};

interface Props {
  onStartGame: (names: string[], settings: GameSettings) => void;
  sessionCode?: string | null;
}

export default function GameSetup({ onStartGame, sessionCode }: Props) {
  const [gameMode, setGameMode] = useState<GameMode>('501');
  const [playerCount, setPlayerCount] = useState(2);
  const [tempNames, setTempNames] = useState<string[]>(['', '']);
  const [legsPerSet, setLegsPerSet] = useState(3);
  const [setsToWin, setSetsToWin] = useState(1);

  const preset = PRESETS[gameMode];

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
      startScore: preset.startScore,
      playerCount,
      doubleOut: preset.doubleOut,
    });
  };

  return (
    <div className="App">
      <div className="scoreboard-card">
        <h1>Darts Game</h1>
        {sessionCode && (
          <div className="session-banner">
            <p className="session-banner-label">Share this code to invite players:</p>
            <div className="session-code">{sessionCode}</div>
            <p className="session-link">{window.location.href}</p>
          </div>
        )}
        <div className="name-inputs stylish-card">
          <div className="game-mode-selection">
            <h3>Game Mode:</h3>
            <div className="player-count-buttons">
              {(Object.keys(PRESETS) as GameMode[]).map(mode => (
                <button
                  key={mode}
                  className={`count-btn ${gameMode === mode ? 'active' : ''}`}
                  onClick={() => setGameMode(mode)}
                >
                  {PRESETS[mode].label}
                </button>
              ))}
            </div>
            <p className="mode-description">{preset.description}</p>
          </div>
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
