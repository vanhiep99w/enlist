import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Globe, Briefcase, Drama, Sun, GraduationCap, Film, Leaf, Users, UtensilsCrossed, Dumbbell, ShoppingBag, Laptop, Plane } from 'lucide-react';

interface TopicDropdownProps {
  topics: string[];
  selectedTopic: string;
  onTopicChange: (topic: string) => void;
}

const topicIcons: Record<string, React.ReactNode> = {
  business: <Briefcase className="w-4 h-4" />,
  culture: <Drama className="w-4 h-4" />,
  daily_life: <Sun className="w-4 h-4" />,
  education: <GraduationCap className="w-4 h-4" />,
  entertainment: <Film className="w-4 h-4" />,
  environment: <Leaf className="w-4 h-4" />,
  family: <Users className="w-4 h-4" />,
  food: <UtensilsCrossed className="w-4 h-4" />,
  health: <Dumbbell className="w-4 h-4" />,
  shopping: <ShoppingBag className="w-4 h-4" />,
  technology: <Laptop className="w-4 h-4" />,
  travel: <Plane className="w-4 h-4" />,
};

export function TopicDropdown({ topics, selectedTopic, onTopicChange }: TopicDropdownProps) {
  const formatTopicName = (topic: string) => {
    return topic.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const getTopicIcon = (topic: string) => {
    return topicIcons[topic.toLowerCase()] || <Globe className="w-4 h-4" />;
  };

  const allOptions = [
    { value: 'all', label: 'All Topics', icon: <Globe className="w-4 h-4" /> },
    ...topics.map(t => ({ value: t, label: formatTopicName(t), icon: getTopicIcon(t) }))
  ];

  const handleValueChange = (value: string) => {
    onTopicChange(value === 'all' ? '' : value);
  };

  const displayValue = selectedTopic || 'all';

  return (
    <Select value={displayValue} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[240px] bg-background border-border/30 hover:border-primary/50 focus:ring-primary/30 transition-all">
        <SelectValue placeholder="All Topics" />
      </SelectTrigger>
      <SelectContent className="bg-card/95 backdrop-blur-xl border-primary/20">
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
