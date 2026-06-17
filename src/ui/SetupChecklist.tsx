import type { StanceSelection } from '../analysis/types';

interface SetupChecklistProps {
  stanceSelection: StanceSelection;
  onStanceChange: (selection: StanceSelection) => void;
  onStart: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function SetupChecklist({
  stanceSelection,
  onStanceChange,
  onStart,
  isLoading,
  error,
}: SetupChecklistProps) {
  const checklistItems = [
    { label: 'Full body visible', id: 'body' },
    { label: 'Hands visible', id: 'hands' },
    { label: 'Feet visible', id: 'feet' },
    { label: 'Good lighting', id: 'lighting' },
    { label: 'Stable camera', id: 'camera' },
  ];

  return (
    <div className="camera-setup">
      <h2>Camera Setup</h2>
      <p className="setup-description">
        Position your camera to capture your full body in frame. Processing happens locally — no video leaves your device.
      </p>

      <div className="setup-checklist" role="group" aria-label="Camera setup requirements">
        {checklistItems.map(item => (
          <label key={item.id} className="checklist-item">
            <input type="checkbox" />
            <span>{item.label}</span>
          </label>
        ))}
      </div>

      <div className="stance-selector">
        <label>
          Stance:
          <select
            value={stanceSelection}
            onChange={e => onStanceChange(e.target.value as StanceSelection)}
            aria-label="Select stance"
            disabled={isLoading}
          >
            <option value="orthodox">Orthodox (left lead)</option>
            <option value="southpaw">Southpaw (right lead)</option>
            <option value="auto">Auto-detect</option>
          </select>
        </label>
      </div>

      <button
        onClick={onStart}
        disabled={isLoading}
        className="start-button"
      >
        {isLoading ? 'Starting camera…' : 'Start Camera'}
      </button>

      {error && <div className="error" role="alert">{error}</div>}

      <p className="privacy-note">
        Camera frames are processed locally in your browser. No video is uploaded or stored.
      </p>
    </div>
  );
}
