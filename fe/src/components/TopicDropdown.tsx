import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Globe,
  Briefcase,
  Drama,
  Sun,
  GraduationCap,
  Film,
  Leaf,
  Users,
  UtensilsCrossed,
  Dumbbell,
  ShoppingBag,
  Laptop,
  Plane,
} from 'lucide-react';

interface TopicDropdownProps {
  topics: string[];
  selectedTopic: string;
  onTopicChange: (topic: string) => void;
}

const topicIcons: Record<string, React.ReactNode> = {
  business: <Briefcase className="h-4 w-4" />,
  culture: <Drama className="h-4 w-4" />,
  daily_life: <Sun className="h-4 w-4" />,
  education: <GraduationCap className="h-4 w-4" />,
  entertainment: <Film className="h-4 w-4" />,
  environment: <Leaf className="h-4 w-4" />,
  family: <Users className="h-4 w-4" />,
  food: <UtensilsCrossed className="h-4 w-4" />,
  health: <Dumbbell className="h-4 w-4" />,
  shopping: <ShoppingBag className="h-4 w-4" />,
  technology: <Laptop className="h-4 w-4" />,
  travel: <Plane className="h-4 w-4" />,
};

export function TopicDropdown({ topics, selectedTopic, onTopicChange }: TopicDropdownProps) {
  const formatTopicName = (topic: string) => {
    return topic.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getTopicIcon = (topic: string) => {
    return topicIcons[topic.toLowerCase()] || <Globe className="h-4 w-4" />;
  };

  const allOptions = [
    { value: 'all', label: 'All Topics', icon: <Globe className="h-4 w-4" /> },
    ...topics.map((t) => ({ value: t, label: formatTopicName(t), icon: getTopicIcon(t) })),
  ];

  const handleValueChange = (value: string) => {
    onTopicChange(value === 'all' ? '' : value);
  };

  const displayValue = selectedTopic || 'all';

  return (
    <Select value={displayValue} onValueChange={handleValueChange}>
      <SelectTrigger
        className="hover:border-primary/50 focus:ring-primary/30 w-[240px] border transition-all"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        <SelectValue placeholder="All Topics" />
      </SelectTrigger>
      <SelectContent className="bg-card/95 border-primary/20 backdrop-blur-xl">
        {allOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="focus:bg-primary/15 focus:text-primary cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              {option.icon}
              <span className="font-medium">{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
