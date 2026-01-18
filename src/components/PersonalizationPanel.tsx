import { PersonalizationProfile } from '@/types/race';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, Hotel, Thermometer, Cookie, Droplets, Headphones, Users, Sparkles } from 'lucide-react';

interface PersonalizationPanelProps {
  profile: PersonalizationProfile;
  onChange: (profile: PersonalizationProfile) => void;
  onApply: () => void;
}

const OPTIONS: {
  key: keyof Omit<PersonalizationProfile, 'race_id'>;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    key: 'international_travel',
    label: 'International travel',
    description: 'Adds passport, visa, and adapter reminders',
    icon: Plane,
  },
  {
    key: 'stays_in_hotel',
    label: 'Staying in a hotel',
    description: 'Adds checkout and breakfast planning tasks',
    icon: Hotel,
  },
  {
    key: 'heat_sensitive',
    label: 'Heat/humidity sensitive',
    description: 'Adds sun protection and hydration reminders',
    icon: Thermometer,
  },
  {
    key: 'uses_gels',
    label: 'Racing with gels',
    description: 'Adds gel packing and carrying strategy tasks',
    icon: Cookie,
  },
  {
    key: 'uses_hydration_pack',
    label: 'Using hydration pack/handheld',
    description: 'Adds pack preparation and testing reminders',
    icon: Droplets,
  },
  {
    key: 'uses_headphones',
    label: 'Running with headphones',
    description: 'Adds rule checking and charging reminders',
    icon: Headphones,
  },
  {
    key: 'has_dependents',
    label: 'Have kids/pets to arrange care',
    description: 'Adds care arrangement reminders',
    icon: Users,
  },
];

export function PersonalizationPanel({
  profile,
  onChange,
  onApply,
}: PersonalizationPanelProps) {
  const handleToggle = (key: keyof Omit<PersonalizationProfile, 'race_id'>) => {
    onChange({
      ...profile,
      [key]: !profile[key],
    });
  };

  return (
    <Card className="border-accent/20 bg-accent/5">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <CardTitle className="text-lg">Personalize your checklist</CardTitle>
        </div>
        <CardDescription>
          Toggle options to add relevant tasks for your race. You can always edit tasks later.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {OPTIONS.map(({ key, label, description, icon: Icon }) => (
          <div
            key={key}
            className="flex items-center justify-between gap-4 py-2"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-background flex items-center justify-center">
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <Label htmlFor={key} className="text-sm font-medium cursor-pointer">
                  {label}
                </Label>
                <p className="text-xs text-muted-foreground truncate">{description}</p>
              </div>
            </div>
            <Switch
              id={key}
              checked={profile[key]}
              onCheckedChange={() => handleToggle(key)}
            />
          </div>
        ))}

        <Button onClick={onApply} className="w-full mt-4">
          Apply & Update Tasks
        </Button>
      </CardContent>
    </Card>
  );
}
