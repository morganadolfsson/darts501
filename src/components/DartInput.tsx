// Drop into src/components/DartInput.tsx — replaces original.
// Now wraps the new <Dartboard/> tap-to-score + keeps the quick-button dock underneath.
import Dartboard from './Dartboard';

interface Props {
  onThrow: (baseValue: number, multiplier: 'S' | 'D' | 'T') => void;
  onUndo: () => void;
  disabled: boolean;
}

export default function DartInput({ onThrow, onUndo, disabled }: Props) {
  if (disabled) return null;
  return (
    <>
      <div className="board-stage">
        <div className="board-controls">
          <button className="tiny-btn" onClick={onUndo}>↶ UNDO</button>
          <button className="tiny-btn" onClick={() => onThrow(0, 'S')}>✕ MISS</button>
        </div>
        <Dartboard onThrow={onThrow} disabled={disabled} />
      </div>
      <div className="input-dock">
        <button className="quick-btn" onClick={() => onThrow(20,'T')}>T20 · 60</button>
        <button className="quick-btn" onClick={() => onThrow(19,'T')}>T19 · 57</button>
        <button className="quick-btn" onClick={() => onThrow(18,'T')}>T18 · 54</button>
        <button className="quick-btn" onClick={() => onThrow(20,'D')}>D20 · 40</button>
        <button className="quick-btn" onClick={() => onThrow(16,'D')}>D16 · 32</button>
        <button className="quick-btn" onClick={() => onThrow(50,'D')}>BULL · 50</button>
        <button className="quick-btn undo" onClick={onUndo}>↶ UNDO</button>
      </div>
    </>
  );
}
