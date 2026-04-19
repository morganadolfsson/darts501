import { useState } from 'react';

const NUMBERS = [20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];
const SEG = 360 / 20;

const R = {
  board: 190,
  double_out: 170,
  double_in: 160,
  outer_out: 160,
  outer_in: 100,
  triple_out: 100,
  triple_in: 90,
  inner_out: 90,
  inner_in: 16,
  outer_bull: 16,
  bull: 8,
};

function polar(cx: number, cy: number, r: number, degrees: number): [number, number] {
  const rad = (degrees - 90) * Math.PI / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function wedgePath(cx: number, cy: number, rOuter: number, rInner: number, startA: number, endA: number) {
  const [x1, y1] = polar(cx, cy, rOuter, startA);
  const [x2, y2] = polar(cx, cy, rOuter, endA);
  const [x3, y3] = polar(cx, cy, rInner, endA);
  const [x4, y4] = polar(cx, cy, rInner, startA);
  const largeArc = endA - startA > 180 ? 1 : 0;
  return [
    `M ${x1} ${y1}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4}`,
    'Z',
  ].join(' ');
}

interface Seg {
  d: string;
  fill: string;
  label: string;
  base: number;
  mult: 'S' | 'D' | 'T';
}

interface Props {
  onThrow: (base: number, mult: 'S' | 'D' | 'T') => void;
  disabled?: boolean;
}

export default function Dartboard({ onThrow, disabled }: Props) {
  const cx = 200, cy = 200;
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);

  const click = (base: number, mult: 'S' | 'D' | 'T') => {
    if (disabled) return;
    onThrow(base, mult);
  };

  const segs: Seg[] = [];
  NUMBERS.forEach((num, i) => {
    const startA = i * SEG - SEG / 2;
    const endA = startA + SEG;
    const isEven = i % 2 === 0;
    const singleFill = isEven ? '#f2e9d8' : '#1a1510';
    const redGreen = isEven ? '#d03c2e' : '#2ea05a';

    segs.push({ d: wedgePath(cx, cy, R.double_out, R.double_in, startA, endA), fill: redGreen, label: `D${num}`, base: num, mult: 'D' });
    segs.push({ d: wedgePath(cx, cy, R.outer_out, R.outer_in, startA, endA), fill: singleFill, label: `${num}`, base: num, mult: 'S' });
    segs.push({ d: wedgePath(cx, cy, R.triple_out, R.triple_in, startA, endA), fill: redGreen, label: `T${num}`, base: num, mult: 'T' });
    segs.push({ d: wedgePath(cx, cy, R.inner_out, R.inner_in, startA, endA), fill: singleFill, label: `${num}`, base: num, mult: 'S' });
  });

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
          const angle = i * SEG;
          const [x, y] = polar(cx, cy, R.double_out + 16, angle);
          return (
            <text key={`n${i}`} x={x} y={y} textAnchor="middle" dominantBaseline="central"
                  fontFamily="Bebas Neue, sans-serif" fontSize={22} fill="#f2e9d8"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}>
              {num}
            </text>
          );
        })}

        {segs.map((s, i) => (
          <path key={i} d={s.d} fill={s.fill} stroke="rgba(0,0,0,0.4)" strokeWidth={0.5}
                className="seg"
                onMouseEnter={() => setHoverLabel(s.label)}
                onMouseLeave={() => setHoverLabel(prev => prev === s.label ? null : prev)}
                onClick={() => click(s.base, s.mult)} />
        ))}

        <circle cx={cx} cy={cy} r={R.outer_bull} fill="#2ea05a" className="seg"
                onMouseEnter={() => setHoverLabel('25')}
                onMouseLeave={() => setHoverLabel(null)}
                onClick={() => click(25, 'S')} />
        <circle cx={cx} cy={cy} r={R.bull} fill="#d03c2e" className="seg"
                onMouseEnter={() => setHoverLabel('BULL 50')}
                onMouseLeave={() => setHoverLabel(null)}
                onClick={() => click(50, 'D')} />

        {Array.from({ length: 20 }, (_, i) => {
          const a = (i + 0.5) * SEG;
          const [x1, y1] = polar(cx, cy, R.double_in, a);
          const [x2, y2] = polar(cx, cy, R.outer_in, a);
          return <line key={`w${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3a2d1c" strokeWidth={1} />;
        })}

        {hoverLabel && (
          <g pointerEvents="none">
            <rect x={cx - 40} y={360} width={80} height={26} rx={6} fill="#0b0a0e" stroke="#ffb238" />
            <text x={cx} y={378} textAnchor="middle" fontFamily="Bebas Neue, sans-serif"
                  fontSize={18} fill="#ffb238">{hoverLabel}</text>
          </g>
        )}
      </svg>
    </div>
  );
}
