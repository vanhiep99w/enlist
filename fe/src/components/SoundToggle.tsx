import { useSoundEffects } from '../hooks/useSoundEffects';
import { Switch } from './ui/switch';
import { Volume2, VolumeX } from 'lucide-react';

export function SoundToggle() {
  const { soundEnabled, toggleSounds } = useSoundEffects();

  return (
    <div
      className="flex h-10 items-center gap-2 rounded-lg border px-3 transition-all"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    >
      {soundEnabled ? (
        <Volume2 className="h-4 w-4 text-amber-500 transition-all duration-300" />
      ) : (
        <VolumeX
          className="h-4 w-4 transition-all duration-300"
          style={{ color: 'var(--color-text-secondary)' }}
        />
      )}
      <Switch
        checked={soundEnabled}
        onCheckedChange={toggleSounds}
        className="shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-amber-500 data-[state=checked]:to-amber-600"
        style={!soundEnabled ? { backgroundColor: 'var(--color-surface-elevated)' } : undefined}
        aria-label={soundEnabled ? 'Disable sound effects' : 'Enable sound effects'}
      />
    </div>
  );
}
