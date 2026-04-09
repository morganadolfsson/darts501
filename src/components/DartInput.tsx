interface Props {
  multiplier: 'S' | 'D' | 'T';
  onSetMultiplier: (m: 'S' | 'D' | 'T') => void;
  onThrow: (baseValue: number, multiplier: 'S' | 'D' | 'T') => void;
  disabled: boolean;
}

export default function DartInput({ multiplier, onSetMultiplier, onThrow, disabled }: Props) {
  if (disabled) return null;

  const handleNumber = (n: number) => {
    if (n === 0) {
      onThrow(0, 'S');
    } else {
      onThrow(n, multiplier);
    }
  };

  return (
    <div className="input-panel stylish-card">
      <div className="multiplier-select stylish-row">
        {(['S', 'D', 'T'] as const).map(m => (
          <label key={m}>
            <input
              type="radio"
              name="mult"
              value={m}
              checked={multiplier === m}
              onChange={() => onSetMultiplier(m)}
            />
            {' '}{m === 'S' ? 'Single' : m === 'D' ? 'Double' : 'Triple'}
          </label>
        ))}
      </div>
      <div className="numbers-grid stylish-grid">
        {Array.from({ length: 21 }, (_, n) => (
          <button
            key={n}
            className={`number-btn stylish-btn ${n === 0 ? 'miss-btn' : ''}`}
            onClick={() => handleNumber(n)}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="bull-buttons stylish-row">
        <button className="outer-bull-btn stylish-btn" onClick={() => onThrow(25, 'S')}>
          Outer Bull (25)
        </button>
        <button className="bull-btn stylish-btn" onClick={() => onThrow(50, 'D')}>
          Bullseye (50)
        </button>
      </div>
    </div>
  );
}
