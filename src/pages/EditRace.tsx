import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Race, RaceDistance, DISTANCE_LABELS } from '@/types/race';
import { saveRace, getRace } from '@/lib/storage';
import { COUNTRY_OPTIONS, resolveCountryToCode } from '@/lib/country-flag';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Clock, Plane, Home } from 'lucide-react';
import { toast } from 'sonner';

export default function EditRace() {
  const navigate = useNavigate();
  const { raceId } = useParams<{ raceId: string }>();

  const [formData, setFormData] = useState({
    name: '',
    distance: 'MARATHON' as RaceDistance,
    date: '',
    start_time: '',
    city: '',
    country: '',
    is_travel_race: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [originalRace, setOriginalRace] = useState<Race | null>(null);

  useEffect(() => {
    if (!raceId) {
      navigate('/');
      return;
    }

    const race = getRace(raceId);
    if (!race) {
      toast.error('Race not found');
      navigate('/');
      return;
    }

    setOriginalRace(race);
    setFormData({
      name: race.name,
      distance: race.distance,
      date: race.date,
      start_time: race.start_time || '',
      city: race.city || '',
      country: resolveCountryToCode(race.country) || '',
      is_travel_race: race.is_travel_race,
    });
  }, [raceId, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Race name is required';
    }

    if (!formData.date) {
      newErrors.date = 'Race date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !originalRace) return;

    const updatedRace: Race = {
      ...originalRace,
      name: formData.name.trim(),
      distance: formData.distance,
      date: formData.date,
      start_time: formData.start_time || undefined,
      city: formData.city || undefined,
      country: formData.country || undefined,
      is_travel_race: formData.is_travel_race,
      updated_at: new Date().toISOString(),
    };

    saveRace(updatedRace);
    toast.success('Race updated!');
    navigate(`/race/${raceId}`);
  };

  if (!originalRace) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="Edit Race" showBack backTo={`/race/${raceId}`} />

      <main className="container py-6 sm:py-8 max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-6">
              {/* Race Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Race Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Singapore Marathon 2025"
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Distance */}
              <div className="space-y-2">
                <Label>Distance *</Label>
                <Select
                  value={formData.distance}
                  onValueChange={(v) => setFormData({ ...formData, distance: v as RaceDistance })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(DISTANCE_LABELS) as [RaceDistance, string][]).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Race Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={errors.date ? 'border-destructive' : ''}
                  />
                  {errors.date && (
                    <p className="text-sm text-destructive">{errors.date}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_time" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Start Time
                  </Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    City
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g., Singapore"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={formData.country || '__none__'}
                    onValueChange={(v) =>
                      setFormData({ ...formData, country: v === '__none__' ? '' : v })
                    }
                  >
                    <SelectTrigger id="country">
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">—</SelectItem>
                      {COUNTRY_OPTIONS.map(({ code, name }) => (
                        <SelectItem key={code} value={code}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Travel Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  {formData.is_travel_race ? (
                    <Plane className="w-5 h-5 text-accent" />
                  ) : (
                    <Home className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <Label htmlFor="travel" className="cursor-pointer">
                      {formData.is_travel_race ? 'Travel Race' : 'Home Race'}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {formData.is_travel_race
                        ? 'Includes travel and accommodation tasks'
                        : 'Local race, no travel planning needed'}
                    </p>
                  </div>
                </div>
                <Switch
                  id="travel"
                  checked={formData.is_travel_race}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_travel_race: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" size="lg">
            Save Changes
          </Button>
        </form>
      </main>
    </div>
  );
}
