import { Race, DISTANCE_LABELS } from '@/types/race';
import { daysUntilRace, calculateProgress } from '@/lib/checklist-engine';
import { getLocationDisplay } from '@/lib/country-flag';
import { getTasksForRace } from '@/lib/storage';
import { MapPin, Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

interface RaceCardProps {
  race: Race;
  index: number;
}

export function RaceCard({ race, index }: RaceCardProps) {
  const navigate = useNavigate();
  const tasks = getTasksForRace(race.id);
  const progress = calculateProgress(tasks);
  const daysLeft = daysUntilRace(race.date);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCountdownText = () => {
    if (daysLeft === 0) return 'Race day!';
    if (daysLeft === 1) return '1 day to go';
    if (daysLeft < 0) return `${Math.abs(daysLeft)} days ago`;
    return `${daysLeft} days to go`;
  };

  const isPast = daysLeft < 0;
  const locationDisplay = getLocationDisplay(race);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={() => navigate(`/race/${race.id}`)}
      className="group cursor-pointer"
    >
      <div className={`bg-card rounded-lg p-4 sm:p-5 card-elevated border border-border/50 transition-all ${isPast ? 'opacity-60' : ''}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium px-2 py-0.5 bg-secondary rounded-full text-secondary-foreground">
                {DISTANCE_LABELS[race.distance]}
              </span>
              {race.is_travel_race && (
                <span className="text-xs font-medium px-2 py-0.5 bg-accent/10 text-accent rounded-full">
                  Travel
                </span>
              )}
            </div>
            <h3 className="font-display text-lg font-semibold text-card-foreground truncate mb-2">
              {race.name}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(race.date)}
                {race.start_time && ` · ${race.start_time}`}
              </span>
              {locationDisplay && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {locationDisplay}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className={`font-display text-2xl font-bold ${isPast ? 'text-muted-foreground' : 'countdown-text'}`}>
                {daysLeft >= 0 ? daysLeft : '—'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isPast ? 'completed' : 'days'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-medium text-card-foreground">
              {progress.done}/{progress.total} tasks
            </span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
        </div>
      </div>
    </motion.div>
  );
}
