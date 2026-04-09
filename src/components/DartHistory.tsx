import { useState } from 'react';
import type { Dart, Player } from '../lib/types';

interface Props {
  history: Dart[];
  players: Player[];
  onEditDart: (index: number, value: number, multiplier: 'S' | 'D' | 'T') => void;
}

export default function DartHistory({ history, players, onEditDart }: Props) {
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState(0);
  const [editMultiplier, setEditMultiplier] = useState<'S' | 'D' | 'T'>('S');

  const startEdit = (idx: number) => {
    setEditIndex(idx);
    setEditValue(history[idx].value);
    setEditMultiplier(history[idx].multiplier);
  };

  const saveEdit = () => {
    if (editIndex === null) return;
    onEditDart(editIndex, editValue, editMultiplier);
    setEditIndex(null);
  };

  return (
    <div className="history-card stylish-card">
      <h2>Dart History</h2>
      <div className="history-table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th>Turn</th>
              <th>Player</th>
              <th>Dart #</th>
              <th>Value</th>
              <th>Multiplier</th>
              <th>Double/Bull</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {history.map((d, idx) => (
              <tr key={idx} className={editIndex === idx ? 'editing-row' : ''}>
                <td>{d.turn}</td>
                <td>{players[d.player]?.name || `Player ${d.player + 1}`}</td>
                <td>{d.dart}</td>
                <td>
                  {editIndex === idx ? (
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={editValue}
                      onChange={e => setEditValue(Number(e.target.value))}
                    />
                  ) : d.value}
                </td>
                <td>
                  {editIndex === idx ? (
                    <select
                      value={editMultiplier}
                      onChange={e => setEditMultiplier(e.target.value as 'S' | 'D' | 'T')}
                    >
                      <option value="S">S</option>
                      <option value="D">D</option>
                      <option value="T">T</option>
                    </select>
                  ) : d.multiplier}
                </td>
                <td>{d.isDoubleOrBull ? 'Yes' : ''}</td>
                <td>
                  {editIndex === idx ? (
                    <>
                      <button className="stylish-btn save-btn" onClick={saveEdit}>Save</button>
                      <button className="stylish-btn cancel-btn" onClick={() => setEditIndex(null)}>Cancel</button>
                    </>
                  ) : (
                    <button className="stylish-btn edit-btn" onClick={() => startEdit(idx)}>Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
