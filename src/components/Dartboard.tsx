// Drop into src/components/Dartboard.tsx (new component)
import { useState } from 'react';

const NUMBERS = [20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];
const SEG = 360 / 20;

const R = {
  board: 190, double_out: 170, double_in: 160,
  outer_out: 160, outer_in: 100,
  triple_out: 100, triple_in: 90,
  inner_out: 90, inner_in: 16,
  outer_bull: 16, bull: 8,
};

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg - 90) * Math.PI / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)] as const;
}

function wedge(cx: number, cy: number, rO: number, rI: number, a1: number, a2: number) {
  const [x1, y1] = polar(cx, cy, rO, a1);
  const [x2, y2] = polar(cx, cy, rO, a2);
  const [x3, y3] = polar(cx, cy, rI, a2);
  const [x4, y4] = polar(cx, cy, rI, a1);
  return `M ${x1} ${y1} A ${rO} ${rO} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${rI} ${rI} 0 0 0 ${x4} ${y4} Z`;
}

interface Props {
  onThrow: (baseValue: number, multiplier: 'S' | 'D' | 'T') => void;
  disabled: boolean;
}

export default function Dartboard({ onThrow, disabled }: Props) {
  const cx = 200, cy = 200;
  const [hover, setHover] = useState<string | null>(null);

  const segs: { d: string; fill: string; label: string; base: number; mult: 'S'|'D'|'T' }[] = [];
  NUMBERS.forEach((num, i) => {
    const a1 = i * SEG - SEG / 2, a2 = a1 + SEG;
    const single = i % 2 === 0 ? '#f2e9d8' : '#1a1510';
    const rg = i % 2 === 0 ? '#d03c2e' : '#2ea05a';
    segs.push({ d: wedge(cx, cy, R.double_out, R.double_in, a1, a2), fill: rg,     label: `D${num}`, base: num, mult: 'D' });
    segs.push({ d: wedge(cx, cy, R.outer_out,  R.outer_in,  a1, a2), fill: single, label: `${num}`,  base: num, mult: 'S' });
    segs.push({ d: wedge(cx, cy, R.triple_out, R.triple_in, a1, a2), fill: rg,     label: `T${num}`, base: num, mult: 'T' });
    segs.push({ d: wedge(cx, cy, R.inner_out,  R.inner_in,  a1, a2), fill: single, label: `${num}`,  base: num, mult: 'S' });
  });

  const click = (base: number, mult: 'S'|'D'|'T') => { if (!disabled) onThrow(base, mult); };

  return (
    <div className={`board-wrap ${disabled ? 'disabled' : ''}`}>
      <svg className="board-svg" viewBox="0 0 400 400">
        <defs>
          <radialGradient id="rim" cx="50%" cy="50%" r="50%">
            <stop offset="85%" stopColor="#2a2118" />
            <stop offset="100%" stopColor="#0d0905" />
          </radialGradient>
          <radialGradient id="felt" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#130f0a" />
            <stop offset="100%" stopColor="#070502" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={R.board} fill="url(#rim)" />
        <circle cx={cx} cy={cy} r={R.double_out + 4} fill="url(#felt)" stroke="#3a2d1c" strokeWidth={2} />
        {NUMBERS.map((num, i) => {
          const [x, y] = polar(cx, cy, R.double_out + 16, i * SEG);
          return (
            <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="central"
                  fontFamily="Bebas Neue, sans-serif" fontSize={22} fill="#f2e9d8"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}>{num}</text>
          );
        })}
        {segs.map((s, i) => (
          <path key={i} d={s.d} fill={s.fill} stroke="rgba(0,0,0,0.4)" strokeWidth={0.5}
                className="seg"
                onMouseEnter={() => setHover(s.label)}
                onMouseLeave={() => setHover(h => h === s.label ? null : h)}
                onClick={() => click(s.base, s.mult)} />
        ))}
        <circle cx={cx} cy={cy} r={R.outer_bull} fill="#2ea05a" className="seg"
                onMouseEnter={() => setHover('25')} onMouseLeave={() => setHover(null)}
                onClick={() => click(25, 'S')} />
        <circle cx={cx} cy={cy} r={R.bull} fill="#d03c2e" className="seg"
                onMouseEnter={() => setHover('BULL 50')} onMouseLeave={() => setHover(null)}
                onClick={() => click(50, 'D')} />
        {hover && (
          <g pointerEvents="none">
            <rect x={cx-40} y={360} width={80} height={26} rx={6} fill="#0b0a0e" stroke="#ffb238" />
            <text x={cx} y={378} textAnchor="middle" fontFamily="Bebas Neue, sans-serif"
                  fontSize={18} fill="#ffb238">{hover}</text>
          </g>
        )}
      </svg>
    </div>
  );
}
