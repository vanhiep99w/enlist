import { useTheme, type Theme } from '../hooks/useTheme';
import { Moon, Sunrise, Snowflake, Sun } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const themeIcons: Record<Theme, React.ReactNode> = {
  midnight: <Moon className="h-4 w-4" />,
  sunrise: <Sunrise className="h-4 w-4" />,
  arctic: <Snowflake className="h-4 w-4" />,
  desert: <Sun className="h-4 w-4" />,
};

const themeLabels: Record<Theme, string> = {
  midnight: 'Midnight',
  sunrise: 'Sunrise',
  arctic: 'Arctic',
  desert: 'Desert',
};

const themeColors: Record<Theme, string> = {
  midnight: 'text-violet-400',
  sunrise: 'text-amber-400',
  arctic: 'text-sky-400',
  desert: 'text-orange-500',
};

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const themes: Theme[] = ['midnight', 'sunrise', 'arctic', 'desert'];

  return (
    <Select value={theme} onValueChange={(value) => setTheme(value as Theme)}>
      <SelectTrigger
        className="hover:border-primary/50 focus:ring-primary/30 w-[140px] border transition-all"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-card/95 border-primary/20 backdrop-blur-xl">
        {themes.map((t) => (
          <SelectItem
            key={t}
            value={t}
            className="focus:bg-primary/15 focus:text-primary cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className={themeColors[t]}>{themeIcons[t]}</span>
              <span className="font-medium">{themeLabels[t]}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
