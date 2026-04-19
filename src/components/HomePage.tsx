// Drop into src/components/HomePage.tsx — replaces original
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession, findSessionByCode } from '../lib/api';

export default function HomePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const create = async () => {
    setLoading(true); setErr('');
    try {
      const s = await createSession({ legsPerSet: 3, setsToWin: 1, playerCount: 2 });
      navigate(`/session/${s._id}`);
    } catch { setErr('Failed to create session. Check your connection.'); }
    finally { setLoading(false); }
  };
  const join = async () => {
    if (!code.trim()) return;
    setLoading(true); setErr('');
    try {
      const s = await findSessionByCode(code.trim().toUpperCase());
      navigate(`/session/${s._id}`);
    } catch { setErr('Session not found. Check the code and try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="bar-header">
        <div className="bar-logo">
          <span className="dot" /><span className="dot-2" />
          <div className="bar-title">
            <span className="display">RAMBMO DARTS</span>
            <span className="sub">501 · LIVE SCOREBOARD</span>
          </div>
        </div>
        <div className="bar-status"><span className="live"><span className="pulse" /> LIVE</span></div>
      </div>
      <div className="home">
        <div className="home-hero">
          <span className="tag">Friday night? It's darts night.</span>
          <h1>THROW<br/>SOME <span className="five">501</span>.</h1>
          <p className="lede">A loud, stupid, brilliant scoreboard for the pub. One device or many — share a code, heckle your mates, and watch the reactions roll in when someone slams a one hundred and eighty.</p>
          {err && <p className="error-msg" style={{ color: 'var(--danger)' }}>{err}</p>}
          <div className="home-actions">
            <button className="btn primary" onClick={create} disabled={loading}>{loading ? 'Creating...' : 'Start a new game'}</button>
            <div className="home-join">
              <input placeholder="CODE" value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={6} onKeyDown={e => e.key==='Enter' && join()} />
              <button className="btn" disabled={loading || !code.trim()} onClick={join}>Join</button>
            </div>
          </div>
        </div>
        <div className="home-side">
          <div className="chalkboard">
            <h3>Rules of the oche</h3>
            <ul>
              <li><span>First to zero</span><span className="score">wins</span></li>
              <li><span>Finish on a double</span><span className="score">or bull</span></li>
              <li><span>Below zero = bust</span><span className="score">no score</span></li>
              <li><span>Three darts a turn</span><span className="score">then pass</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
