import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession, findSessionByCode } from '../lib/api';

export default function HomePage() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      const session = await createSession({
        legsPerSet: 3,
        setsToWin: 1,
        playerCount: 2,
      });
      navigate(`/session/${session._id}`);
    } catch {
      setError('Failed to create session. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setLoading(true);
    setError('');
    try {
      const session = await findSessionByCode(joinCode.trim().toUpperCase());
      navigate(`/session/${session._id}`);
    } catch {
      setError('Session not found. Check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <div className="home-card stylish-card">
        <h1>Darts 501</h1>
        <p>Play darts with friends - share a scoreboard in real time</p>
        {error && <p className="error-msg">{error}</p>}
        <div className="home-actions">
          <button
            className="stylish-btn create-btn"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create New Game'}
          </button>
          <div className="or-divider">- or join an existing game -</div>
          <div className="join-form">
            <input
              type="text"
              placeholder="CODE"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
            />
            <button
              className="stylish-btn join-btn"
              onClick={handleJoin}
              disabled={loading || !joinCode.trim()}
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
