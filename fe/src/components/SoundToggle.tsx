import { useSoundEffects } from '../hooks/useSoundEffects';
import { Switch } from './ui/switch';
import { Volume2, VolumeX } from 'lucide-react';

export function SoundToggle() {
  const { soundEnabled, toggleSounds } = useSoundEffects();

  return (
    <div className="flex items-center gap-2 h-10 px-3 rounded-lg border transition-all" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
      {soundEnabled ? (
        <Volume2 className="w-4 h-4 text-amber-500 transition-all duration-300" />
      ) : (
        <VolumeX className="w-4 h-4 transition-all duration-300" style={{ color: 'var(--color-text-secondary)' }} />
      )}
      <Switch
        checked={soundEnabled}
        onCheckedChange={toggleSounds}
        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-amber-500 data-[state=checked]:to-amber-600 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 focus-visible:ring-0 focus-visible:ring-offset-0"
        style={!soundEnabled ? { backgroundColor: 'var(--color-surface-elevated)' } : undefined}
        aria-label={soundEnabled ? 'Disable sound effects' : 'Enable sound effects'}
      />
    </div>
  );
}
