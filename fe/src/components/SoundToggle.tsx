import { useSoundEffects } from '../hooks/useSoundEffects';
import { Switch } from './ui/switch';
import { Volume2, VolumeX } from 'lucide-react';

export function SoundToggle() {
  const { soundEnabled, toggleSounds } = useSoundEffects();

  return (
    <div className="flex items-center gap-2 group">
      <Volume2 
        className={`w-4 h-4 transition-all duration-300 ${
          soundEnabled 
            ? 'text-amber-500 scale-100 opacity-100' 
            : 'text-gray-400 scale-90 opacity-40'
        }`} 
      />
      <Switch
        checked={soundEnabled}
        onCheckedChange={toggleSounds}
        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-amber-500 data-[state=checked]:to-amber-600 data-[state=unchecked]:bg-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        aria-label={soundEnabled ? 'Disable sound effects' : 'Enable sound effects'}
      />
      <VolumeX 
        className={`w-4 h-4 transition-all duration-300 ${
          !soundEnabled 
            ? 'text-gray-400 scale-100 opacity-100' 
            : 'text-gray-500 scale-90 opacity-30'
        }`} 
      />
    </div>
  );
}
