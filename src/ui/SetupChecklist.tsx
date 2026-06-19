import type { StanceSelection } from '../analysis/types';
import { useLocale } from '../i18n/LocaleProvider';

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
  const { t } = useLocale();

  const checklistItems = [
    { label: t('setup.fullBody'), id: 'body' },
    { label: t('setup.handsVisible'), id: 'hands' },
    { label: t('setup.feetVisible'), id: 'feet' },
    { label: t('setup.goodLighting'), id: 'lighting' },
    { label: t('setup.stableCamera'), id: 'camera' },
  ];

  return (
    <div className="camera-setup">
      <h2>{t('setup.heading')}</h2>
      <p className="setup-description">
        {t('setup.description')}
      </p>

      <ul className="setup-tips" aria-label="Camera setup requirements">
        {checklistItems.map(item => (
          <li key={item.id}>{item.label}</li>
        ))}
      </ul>

      <div className="stance-selector">
        <label>
          {t('setup.stance')}
          <select
            value={stanceSelection}
            onChange={e => onStanceChange(e.target.value as StanceSelection)}
            aria-label={t('setup.stance')}
            disabled={isLoading}
          >
            <option value="orthodox">{t('setup.orthodox')}</option>
            <option value="southpaw">{t('setup.southpaw')}</option>
            <option value="auto">{t('setup.autoDetect')}</option>
          </select>
        </label>
      </div>

      <button
        onClick={onStart}
        disabled={isLoading}
        className="start-button"
      >
        {isLoading ? t('setup.startingCamera') : t('setup.startCamera')}
      </button>

      {error && <div className="error" role="alert">{error}</div>}

      <p className="privacy-note">
        {t('app.privacyNote')}
      </p>
    </div>
  );
}
