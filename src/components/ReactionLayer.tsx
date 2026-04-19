// Exports two things:
//   - <ReactionLayer/>  — ephemeral celebration overlay (180 text, shame meter, confetti, slide-in gif)
//   - <ReactionSlot/>   — permanent large GIF panel that holds the latest reaction until next event
import { useEffect, useState, type CSSProperties } from 'react';
import type { Player, ReactionEvent } from '../lib/types';
import { commentator, getCallout } from '../lib/commentator';
import { fetchReactionGif } from '../lib/giphy';

interface Tweaks {
  gifsEnabled: boolean;
  soundEnabled: boolean;
  reactionSensitivity: 'sparing' | 'balanced' | 'generous';
}

type HugeData = { text: string; flavor: 'pink' | 'amber' };
type FlashData = { color: 'danger' | 'accent' };
type GifData = { url: string | null; caption: string; fake: string };
type ShameData = { level: number; quote: string; name: string };
type ConfettiData = { count: number };

type Item =
  | { id: string; kind: 'huge'; data: HugeData }
  | { id: string; kind: 'flash'; data: FlashData }
  | { id: string; kind: 'gif'; data: GifData }
  | { id: string; kind: 'shame'; data: ShameData }
  | { id: string; kind: 'confetti'; data: ConfettiData };

type ItemDataFor<K extends Item['kind']> = Extract<Item, { kind: K }>['data'];

export default function ReactionLayer({ event, tweaks, players }: { event: ReactionEvent | null; tweaks: Tweaks; players: Player[] }) {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    if (!event) return;
    const id = `${event.ts}`;
    let idCounter = 0;
    const add = <K extends Item['kind']>(kind: K, data: ItemDataFor<K>, lifetime: number) => {
      const itemId = `${id}-${kind}-${idCounter++}`;
      const item = { id: itemId, kind, data } as Item;
      setItems(prev => [...prev, item]);
      setTimeout(() => setItems(prev => prev.filter(x => x.id !== itemId)), lifetime);
    };

    const type = event.type;
    const p = players[event.player];

    if (tweaks.soundEnabled) {
      const line = getCallout(type);
      if (line) commentator.say(line);
    }

    if (type === '180')        add('huge', { text: '180!', flavor: 'pink' }, 1600);
    else if (type === 'ton-40') add('huge', { text: `${event.turn?.total}`, flavor: 'amber' }, 1400);
    else if (type === 'ton')    add('huge', { text: `${event.turn?.total}`, flavor: 'amber' }, 1200);
    else if (type === 't20')    add('huge', { text: 'T20', flavor: 'amber' }, 900);
    else if (type === 'bull')   add('huge', { text: 'BULL', flavor: 'amber' }, 900);
    else if (type === 'bust')   add('huge', { text: 'BUST', flavor: 'pink' }, 1200);
    else if (type === 'leg-win')  add('huge', { text: 'LEG!', flavor: 'amber' }, 1400);
    else if (type === 'set-win')  add('huge', { text: 'SET!', flavor: 'amber' }, 1600);
    else if (type === 'match-win')add('huge', { text: 'CHAMPION!', flavor: 'pink' }, 2800);

    if (tweaks.reactionSensitivity !== 'sparing' && (type === 'miss' || type === 'low')) {
      const level = type === 'miss' ? 90 : 60 + Math.random() * 30;
      const lines: Record<string, string[]> = {
        miss: ['Off the board! Shame.', "Ouch — that one's off.", 'Did you have a pint too many?'],
        low:  ['Barely scratched it.', 'Rusty tonight.', "That won't win you many legs."],
      };
      add('shame', { level, quote: lines[type][Math.floor(Math.random() * lines[type].length)], name: p?.name || '' }, 3800);
    }

    if (['leg-win','set-win','match-win'].includes(type)) {
      add('confetti', { count: type === 'match-win' ? 120 : 50 }, type === 'match-win' ? 3500 : 2500);
    }
    if (['180','ton-40','ton','leg-win','set-win','match-win','bust'].includes(type)) {
      add('flash', { color: type === 'bust' ? 'danger' : 'accent' }, 500);
    }

    if (tweaks.gifsEnabled && ['180','ton-40','ton','bust','miss','low','leg-win','set-win','match-win'].includes(type)) {
      const caps: Record<string, string> = {
        '180': 'ONE HUNDRED AND EIGHTY!',
        'ton-40': `${event.turn?.total || 140}!`,
        'ton': `${event.turn?.total || 100}!`,
        'bust': 'BUST', 'miss': 'AIRBALL', 'low': 'YIKES',
        'leg-win': 'LEG WINNER', 'set-win': 'SET!',
        'match-win': `${p?.name || 'WINNER'} — CHAMPION`,
      };
      fetchReactionGif(type).then(url => {
        add('gif', { url, caption: caps[type] || type.toUpperCase(), fake: `${type.toUpperCase()} · reaction` }, 3600);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only fire when the event timestamp changes
  }, [event?.ts]);

  return (
    <div className="reactions-overlay">
      {items.map(it => {
        if (it.kind === 'huge')
          return <div key={it.id} className={`huge-text ${it.data.flavor==='pink'?'pink':''}`}>{it.data.text}</div>;
        if (it.kind === 'flash')
          return <div key={it.id} className="flash" style={{ background: it.data.color==='danger' ? 'var(--danger)' : 'var(--accent)' }} />;
        if (it.kind === 'gif') return (
          <div key={it.id} className="gif-card">
            {it.data.url ? <img src={it.data.url} alt="" onError={e=>{(e.currentTarget as HTMLElement).style.display='none';}} />
              : <div className="fake-gif">{it.data.fake}</div>}
            <div className="cap">{it.data.caption}</div>
          </div>
        );
        if (it.kind === 'shame') return (
          <div key={it.id} className="shame-meter">
            <div className="label">SHAME-O-METER</div>
            <div className="bar"><i style={{ '--level': `${it.data.level}%` } as CSSProperties} /></div>
            <div className="quote">{it.data.quote}</div>
          </div>
        );
        if (it.kind === 'confetti') return <Confetti key={it.id} count={it.data.count} />;
        return null;
      })}
    </div>
  );
}

interface ConfettiPiece { left: number; delay: number; dur: number; color: string; rot: number; size: number }

function Confetti({ count }: { count: number }) {
  const [pieces] = useState<ConfettiPiece[]>(() => {
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
          left: `${p.left}%`, width: `${p.size}px`, height: `${p.size * 1.6}px`,
          background: p.color, transform: `rotate(${p.rot}deg)`,
          animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s`,
        }} />
      ))}
    </>
  );
}

// --- ReactionSlot ---------------------------------------------------------
// Permanent, always-present GIF panel. Shows the latest reaction and holds it
// until the next event overrides it.
interface SlotState { url: string | null; caption: string; flavor: 'good' | 'bad' | 'idle'; fake: string }
const SLOT_EVENT_SET: ReadonlySet<string> = new Set([
  '180','ton-40','ton','t20','bull','bust','miss','low','leg-win','set-win','match-win',
]);

export function ReactionSlot({ event, tweaks, players }: { event: ReactionEvent | null; tweaks: Tweaks; players: Player[] }) {
  const [fetched, setFetched] = useState<{ url: string | null; ts: number }>({ url: null, ts: 0 });

  useEffect(() => {
    if (!event || !tweaks.gifsEnabled) return;
    if (!SLOT_EVENT_SET.has(event.type)) return;
    const ts = event.ts;
    let cancelled = false;
    fetchReactionGif(event.type).then(url => {
      if (!cancelled) setFetched({ url, ts });
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- event.ts uniquely identifies the event; full object would re-fire on every render
  }, [event?.ts, event?.type, tweaks.gifsEnabled]);

  const slot = computeSlot(event, players, fetched);

  return (
    <div className={`reaction-slot ${slot.flavor}`} key={event?.ts || 'idle'}>
      <div className="reaction-slot-media">
        {slot.url
          ? <img src={slot.url} alt="" onError={e => { (e.currentTarget as HTMLElement).style.display='none'; }} />
          : <div className="reaction-slot-fake">{slot.fake}</div>}
      </div>
      <div className="reaction-slot-cap">{slot.caption}</div>
    </div>
  );
}

function computeSlot(event: ReactionEvent | null, players: Player[], fetched: { url: string | null; ts: number }): SlotState {
  if (!event || !SLOT_EVENT_SET.has(event.type)) {
    return { url: null, caption: 'WAITING FOR THE FIRST THROW', flavor: 'idle', fake: 'READY' };
  }
  const type = event.type;
  const p = players[event.player];
  const captionMap: Record<string, string> = {
    '180': 'ONE HUNDRED AND EIGHTY',
    'ton-40': `${event.turn?.total || 140} — TON FORTY`,
    'ton': `${event.turn?.total || 100} — OVER THE TON`,
    't20': 'TREBLE TWENTY',
    'bull': 'BULLSEYE',
    'bust': `${p?.name || ''} — BUST`.trim(),
    'miss': `${p?.name || ''} — MISSED THE BOARD`.trim(),
    'low': `${p?.name || ''} — ROUGH TURN`.trim(),
    'leg-win': `${p?.name || 'WINNER'} — LEG`,
    'set-win': `${p?.name || 'WINNER'} — SET`,
    'match-win': `${p?.name || 'WINNER'} — CHAMPION`,
  };
  const flavor: SlotState['flavor'] = ['bust','miss','low'].includes(type) ? 'bad' : 'good';
  const url = fetched.ts === event.ts ? fetched.url : null;
  const fake = url ? type.toUpperCase() : `${type.toUpperCase()} · LOADING`;
  return { url, caption: captionMap[type] ?? type.toUpperCase(), flavor, fake };
}
