import { useEffect, useRef, useState } from 'react';
import type { Player, ReactionEvent } from '../lib/types';
import { commentator, getCallout } from '../lib/commentator';
import { fetchGif } from '../lib/giphy';

interface Tweaks {
  gifsEnabled: boolean;
  soundEnabled: boolean;
  reactionSensitivity: 'generous' | 'normal' | 'sparing';
}

interface Item {
  id: string;
  kind: 'huge' | 'flash' | 'gif' | 'shame' | 'confetti';
  data: Record<string, unknown>;
}

interface Props {
  event: ReactionEvent | null;
  tweaks: Tweaks;
  players: Player[];
}

export default function ReactionLayer({ event, tweaks, players }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (!event) return;
    const id = ++idRef.current;
    const add = (kind: Item['kind'], data: Record<string, unknown>, lifetime: number) => {
      const item: Item = { id: `${id}-${kind}`, kind, data };
      setItems(prev => [...prev, item]);
      setTimeout(() => setItems(prev => prev.filter(x => x.id !== item.id)), lifetime);
    };

    const type = event.type;
    const player = players[event.player];

    if (tweaks.soundEnabled) {
      const line = getCallout(type);
      if (line) commentator.say(line);
    }

    if (type === '180') add('huge', { text: '180!', flavor: 'pink' }, 1600);
    else if (type === 'ton-40') add('huge', { text: `${event.turn?.total ?? 140}`, flavor: 'amber' }, 1400);
    else if (type === 'ton') add('huge', { text: `${event.turn?.total ?? 100}`, flavor: 'amber' }, 1200);
    else if (type === 't20') add('huge', { text: 'T20', flavor: 'amber' }, 900);
    else if (type === 'bull') add('huge', { text: 'BULL', flavor: 'amber' }, 900);
    else if (type === 'bust') add('huge', { text: 'BUST', flavor: 'pink' }, 1200);
    else if (type === 'leg-win') add('huge', { text: 'LEG!', flavor: 'amber' }, 1400);
    else if (type === 'set-win') add('huge', { text: 'SET!', flavor: 'amber' }, 1600);
    else if (type === 'match-win') add('huge', { text: 'CHAMPION!', flavor: 'pink' }, 2800);

    if (tweaks.reactionSensitivity !== 'sparing' && (type === 'miss' || type === 'low')) {
      const level = type === 'miss' ? 90 : 60 + Math.random() * 30;
      const quotes: Record<string, string[]> = {
        miss: ['Off the board! Shame.', "Ouch — that one's off.", 'Did you have a pint too many?'],
        low: ['Barely scratched it.', 'Rusty tonight.', "That won't win you many legs."],
      };
      const q = quotes[type][Math.floor(Math.random() * quotes[type].length)];
      add('shame', { level, quote: q, name: player?.name || '' }, 3800);
    }

    if (type === 'leg-win' || type === 'set-win' || type === 'match-win') {
      add('confetti', { count: type === 'match-win' ? 120 : 50 }, type === 'match-win' ? 3500 : 2500);
    }

    if (['180','ton-40','ton','leg-win','set-win','match-win','bust'].includes(type)) {
      add('flash', { color: type === 'bust' ? 'danger' : 'accent' }, 500);
    }

    if (tweaks.gifsEnabled && ['180','ton-40','ton','bust','miss','low','leg-win','set-win','match-win'].includes(type)) {
      const captionMap: Record<string, string> = {
        '180': 'ONE HUNDRED AND EIGHTY!',
        'ton-40': `${event.turn?.total || 140}!`,
        'ton': `${event.turn?.total || 100}!`,
        'bust': 'BUST',
        'miss': 'AIRBALL',
        'low': 'YIKES',
        'leg-win': 'LEG WINNER',
        'set-win': 'SET!',
        'match-win': `${player?.name || 'WINNER'} — CHAMPION`,
      };
      fetchGif(type).then(url => {
        add('gif', { url, caption: captionMap[type] || type.toUpperCase(), fake: `${type.toUpperCase()} · reaction gif` }, 3600);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.ts]);

  return (
    <div className="reactions-overlay">
      {items.map(it => {
        if (it.kind === 'huge') {
          const d = it.data as { text: string; flavor: string };
          return <div key={it.id} className={`huge-text ${d.flavor === 'pink' ? 'pink' : ''}`}>{d.text}</div>;
        }
        if (it.kind === 'flash') {
          const d = it.data as { color: string };
          return <div key={it.id} className="flash" style={{ background: d.color === 'danger' ? 'var(--danger)' : 'var(--accent)' }} />;
        }
        if (it.kind === 'gif') {
          const d = it.data as { url: string | null; caption: string; fake: string };
          return (
            <div key={it.id} className="gif-card">
              {d.url
                ? <img src={d.url} alt="" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                : <div className="fake-gif">{d.fake}</div>}
              <div className="cap">{d.caption}</div>
            </div>
          );
        }
        if (it.kind === 'shame') {
          const d = it.data as { level: number; quote: string };
          return (
            <div key={it.id} className="shame-meter">
              <div className="label">SHAME-O-METER</div>
              <div className="bar"><i style={{ ['--level' as string]: `${d.level}%` } as React.CSSProperties} /></div>
              <div className="quote">{d.quote}</div>
            </div>
          );
        }
        if (it.kind === 'confetti') {
          const d = it.data as { count: number };
          return <Confetti key={it.id} count={d.count} />;
        }
        return null;
      })}
    </div>
  );
}

function Confetti({ count }: { count: number }) {
  const [pieces] = useState(() => {
    const colors = ['#ffb238', '#ff2d87', '#4cd4b0', '#fff1a8', '#ff6e4a'];
    return Array.from({ length: count }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      dur: 1.6 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 360,
      size: 6 + Math.random() * 10,
    }));
  });
  return (
    <>
      {pieces.map((p, i) => (
        <span key={i} className="confetti" style={{
          left: `${p.left}%`,
          width: `${p.size}px`,
          height: `${p.size * 1.6}px`,
          background: p.color,
          transform: `rotate(${p.rot}deg)`,
          animationDuration: `${p.dur}s`,
          animationDelay: `${p.delay}s`,
        }} />
      ))}
    </>
  );
}

const SLOT_EVENT_SET: ReadonlySet<string> = new Set([
  '180','ton-40','ton','t20','bull','bust','miss','low','leg-win','set-win','match-win',
]);

interface SlotProps extends Props {
  currentPlayer?: number;
}

export function ReactionSlot({ event, tweaks, players, currentPlayer }: SlotProps) {
  const [fetched, setFetched] = useState<{ url: string | null; ts: number }>({ url: null, ts: 0 });

  // Suppress events whose owner is no longer the active player — the prior player's
  // reaction should clear the moment turn-change makes the next player active.
  const visibleEvent = event && currentPlayer !== undefined && event.player !== currentPlayer
    ? null
    : event;

  useEffect(() => {
    if (!visibleEvent || !tweaks.gifsEnabled) return;
    if (!SLOT_EVENT_SET.has(visibleEvent.type)) return;
    const ts = visibleEvent.ts;
    let cancelled = false;
    fetchGif(visibleEvent.type).then(url => {
      if (!cancelled) setFetched({ url, ts });
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- event.ts uniquely identifies the event
  }, [visibleEvent?.ts, visibleEvent?.type, tweaks.gifsEnabled]);

  const slot = computeSlot(visibleEvent, players, fetched);

  return (
    <div className={`reaction-slot ${slot.flavor}`} key={visibleEvent?.ts || 'idle'}>
      <div className="reaction-slot-media">
        {slot.url
          ? <img src={slot.url} alt="" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          : <div className="reaction-slot-fake">{slot.fake}</div>}
      </div>
      <div className="reaction-slot-cap">{slot.caption}</div>
    </div>
  );
}

function computeSlot(event: ReactionEvent | null, players: Player[], fetched: { url: string | null; ts: number }) {
  if (!event || !SLOT_EVENT_SET.has(event.type)) {
    return { url: null as string | null, caption: 'WAITING FOR THE FIRST THROW', flavor: 'idle', fake: 'READY' };
  }
  const type = event.type;
  const player = players[event.player];
  const captionMap: Record<string, string> = {
    '180': 'ONE HUNDRED AND EIGHTY',
    'ton-40': `${event.turn?.total || 140} — TON FORTY`,
    'ton': `${event.turn?.total || 100} — OVER THE TON`,
    't20': 'TREBLE TWENTY',
    'bull': 'BULLSEYE',
    'bust': `${player?.name || ''} — BUST`.trim(),
    'miss': `${player?.name || ''} — MISSED THE BOARD`.trim(),
    'low': `${player?.name || ''} — ROUGH TURN`.trim(),
    'leg-win': `${player?.name || 'WINNER'} — LEG`,
    'set-win': `${player?.name || 'WINNER'} — SET`,
    'match-win': `${player?.name || 'WINNER'} — CHAMPION`,
  };
  const flavor = ['bust','miss','low'].includes(type) ? 'bad' : 'good';
  const url = fetched.ts === event.ts ? fetched.url : null;
  const fake = url ? type.toUpperCase() : `${type.toUpperCase()} · LOADING`;
  return { url, caption: captionMap[type] ?? type.toUpperCase(), flavor, fake };
}
