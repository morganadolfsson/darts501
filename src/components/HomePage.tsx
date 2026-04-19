import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession, findSessionByCode } from '../lib/api';

export default function HomePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      const session = await createSession({ legsPerSet: 3, setsToWin: 1, playerCount: 2 });
      navigate(`/session/${session._id}`);
    } catch {
      setError('Failed to create session. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    try {
      const session = await findSessionByCode(code.trim().toUpperCase());
      navigate(`/session/${session._id}`);
    } catch {
      setError('Session not found. Check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="scan" />
      <div className="page">
        <div className="bar-header">
          <div className="bar-logo">
            <span className="dot" />
            <span className="dot-2" />
            <div className="bar-title">
              <span className="display">RAMBMO DARTS</span>
              <span className="sub">501 · LIVE SCOREBOARD</span>
            </div>
          </div>
          <div className="bar-status">
            <span>THURSDAYS · 8PM</span>
            <span className="live"><span className="pulse"/> LIVE</span>
          </div>
        </div>
        <div className="home">
          <div className="home-hero">
            <span className="tag">Friday night? It's darts night.</span>
            <h1>THROW<br/>SOME <span className="five">501</span>.</h1>
            <p className="lede">A loud, stupid, brilliant scoreboard for the pub. One device or many — share a code, heckle your mates, and watch the reactions roll in when someone slams a one hundred and eighty.</p>
            {error && <p className="error-msg" style={{ color: 'var(--danger)' }}>{error}</p>}
            <div className="home-actions">
              <button className="btn primary" onClick={handleCreate} disabled={loading}>
                {loading ? 'Creating…' : 'Start a new game'}
              </button>
              <button className="btn ghost" onClick={() => navigate('/local')} disabled={loading}>
                Local game (no session)
              </button>
              <div className="home-join">
                <input
                  placeholder="CODE"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  onKeyDown={e => e.key === 'Enter' && handleJoin()}
                />
                <button className="btn" onClick={handleJoin} disabled={loading || !code.trim()}>Join</button>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Tip — reactions fire on 180, bust, checkout &amp; more
            </div>
          </div>
          <div className="home-side">
            <div className="chalkboard">
              <h3>Tonight's leaderboard</h3>
              <ul>
                <li><span>Morgan "The Hammer"</span> <span className="score">avg 71.4</span></li>
                <li><span>Jess "Bullseye"</span> <span className="score">avg 68.1</span></li>
                <li><span>Dave, just Dave</span> <span className="score">avg 52.7</span></li>
                <li><span>Aunt Ruth</span> <span className="score">avg 48.3</span></li>
              </ul>
              <div className="ticker">
                <span>
                  · Morgan hit a 180 at 21:14  · Dave busted 3 times last leg  · Jess checkout 74 · Ruth's walk-on: "Eye of the Tiger"  ·
                  · Morgan hit a 180 at 21:14  · Dave busted 3 times last leg  · Jess checkout 74 · Ruth's walk-on: "Eye of the Tiger"  ·
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
