// Drop into src/components/GameSetup.tsx — replaces original
import { useState } from 'react';
import type { GameSettings } from '../lib/types';

const AVATAR_SET = ['🎯','🔥','💀','🏴‍☠️','🦁','🐺','🐍','🦊','🐻','🦅','🦄','🐙','👑','⚡','🧨','🤠','🥷','🧙','🐉','🍺','🏆','⭐','🌶️','🎱'];

interface Props {
  onStartGame: (names: string[], avatars: string[], taglines: string[], settings: GameSettings) => void;
  sessionCode?: string | null;
}

export default function GameSetup({ onStartGame, sessionCode }: Props) {
  const [playerCount, setPlayerCount] = useState(2);
  const [mode, setMode] = useState<'501' | '301'>('501');
  const [legsPerSet, setLegsPerSet] = useState(3);
  const [setsToWin, setSetsToWin] = useState(1);
  const [players, setPlayers] = useState([
    { name: '', avatar: '🔥', tagline: '' },
    { name: '', avatar: '🎯', tagline: '' },
    { name: '', avatar: '🍺', tagline: '' },
    { name: '', avatar: '🦊', tagline: '' },
    { name: '', avatar: '🐺', tagline: '' },
  ]);
  const [pickerFor, setPickerFor] = useState<number | null>(null);

  const update = (i: number, patch: Partial<typeof players[0]>) =>
    setPlayers(prev => prev.map((p, idx) => idx === i ? { ...p, ...patch } : p));

  const start = () => {
    const slice = players.slice(0, playerCount);
    onStartGame(
      slice.map(p => p.name),
      slice.map(p => p.avatar),
      slice.map(p => p.tagline),
      {
        legsPerSet, setsToWin,
        startScore: mode === '501' ? 501 : 301,
        playerCount, doubleOut: mode === '501',
      }
    );
  };

  return (
    <div className="page">
      <div className="bar-header">
        <div className="bar-logo">
          <span className="dot" /><span className="dot-2" />
          <div className="bar-title">
            <span className="display">MATCH SETUP</span>
            <span className="sub">ROSTER · FORMAT · WALK-ON</span>
          </div>
        </div>
      </div>
      <div className="setup">
        <div className="setup-left">
          {sessionCode && (
            <div style={{ background: 'var(--bg-1)', border: '1px solid var(--rule)', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>Share this code</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, letterSpacing: 8, color: 'var(--accent)' }}>{sessionCode}</div>
            </div>
          )}
          <h2>Roster</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {players.slice(0, playerCount).map((p, i) => (
              <div key={i} className="player-row" style={{ position: 'relative' }}>
                <div className="avatar-pick" onClick={() => setPickerFor(pickerFor === i ? null : i)}>{p.avatar}</div>
                {pickerFor === i && (
                  <div className="avatar-popover" style={{ left: 72, top: 60 }}>
                    {AVATAR_SET.map(a => (
                      <button key={a} onClick={() => { update(i, { avatar: a }); setPickerFor(null); }}>{a}</button>
                    ))}
                  </div>
                )}
                <div className="tagline-row">
                  <input value={p.name} onChange={e => update(i, { name: e.target.value })} placeholder={`Player ${i+1}`} />
                  <input className="tagline" value={p.tagline} onChange={e => update(i, { tagline: e.target.value })} placeholder="Walk-on quote" />
                </div>
                <div style={{ color: 'var(--ink-2)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase' }}>P{i+1}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="setup-right">
          <div><h3>Format</h3>
            <div className="pill-group" style={{ marginTop: 10 }}>
              <button className={`pill ${mode==='501'?'active':''}`} onClick={() => setMode('501')}>501 — Double out</button>
              <button className={`pill ${mode==='301'?'active':''}`} onClick={() => setMode('301')}>301 — Rookies</button>
            </div>
          </div>
          <div><h3>Players</h3>
            <div className="pill-group" style={{ marginTop: 10 }}>
              {[2,3,4,5].map(n => (
                <button key={n} className={`pill ${playerCount===n?'active':''}`} onClick={() => setPlayerCount(n)}>{n} players</button>
              ))}
            </div>
          </div>
          <div><h3>Best of legs (per set)</h3>
            <div className="pill-group" style={{ marginTop: 10 }}>
              {[{bo:3,l:2},{bo:5,l:3},{bo:7,l:4}].map(o => (
                <button key={o.bo} className={`pill ${legsPerSet===o.l?'active':''}`} onClick={() => setLegsPerSet(o.l)}>Best of {o.bo}</button>
              ))}
            </div>
          </div>
          <div><h3>Sets to win</h3>
            <div className="pill-group" style={{ marginTop: 10 }}>
              {[1,2,3,4].map(n => (
                <button key={n} className={`pill ${setsToWin===n?'active':''}`} onClick={() => setSetsToWin(n)}>{n}</button>
              ))}
            </div>
          </div>
          <button className="btn primary" style={{ marginTop: 'auto', fontSize: 22, padding: '16px 28px' }} onClick={start}>
            START THE MATCH →
          </button>
        </div>
      </div>
    </div>
  );
}
