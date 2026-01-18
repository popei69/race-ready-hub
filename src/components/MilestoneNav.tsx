import { Milestone, MILESTONE_ORDER, MILESTONE_LABELS, MILESTONE_DAYS_BEFORE } from '@/types/race';
import { Task } from '@/types/race';
import { getCurrentMilestone } from '@/lib/checklist-engine';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface MilestoneNavProps {
  tasks: Task[];
  daysUntilRace: number;
  activeMilestone: Milestone | null;
  onSelect: (milestone: Milestone) => void;
}

export function MilestoneNav({
  tasks,
  daysUntilRace,
  activeMilestone,
  onSelect,
}: MilestoneNavProps) {
  const currentMilestone = getCurrentMilestone(daysUntilRace);
  const currentIndex = MILESTONE_ORDER.indexOf(currentMilestone);

  const getMilestoneStats = (milestone: Milestone) => {
    const milestoneTasks = tasks.filter(
      (t) => t.milestone === milestone && !t.is_hidden
    );
    const done = milestoneTasks.filter(
      (t) => t.status === 'DONE' || t.status === 'SKIPPED'
    ).length;
    return { total: milestoneTasks.length, done };
  };

  const getMilestoneStatus = (milestone: Milestone, index: number) => {
    const stats = getMilestoneStats(milestone);
    if (stats.total === 0) return 'empty';
    if (stats.done === stats.total) return 'complete';
    if (index < currentIndex) return 'overdue';
    if (index === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <nav className="relative">
      {/* Mobile horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-2 sm:hidden scrollbar-hide">
        {MILESTONE_ORDER.map((milestone, index) => {
          const stats = getMilestoneStats(milestone);
          const status = getMilestoneStatus(milestone, index);
          const isActive = activeMilestone === milestone;

          return (
            <button
              key={milestone}
              onClick={() => onSelect(milestone)}
              className={cn(
                'flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all tap-target',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border hover:bg-secondary',
                status === 'overdue' && !isActive && 'border-destructive/50',
                status === 'complete' && 'opacity-60'
              )}
            >
              <span className="whitespace-nowrap">{MILESTONE_LABELS[milestone]}</span>
              {stats.total > 0 && (
                <span className="ml-2 opacity-70">
                  {stats.done}/{stats.total}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Desktop vertical timeline */}
      <div className="hidden sm:flex flex-col gap-1">
        {MILESTONE_ORDER.map((milestone, index) => {
          const stats = getMilestoneStats(milestone);
          const status = getMilestoneStatus(milestone, index);
          const isActive = activeMilestone === milestone;
          const daysLabel = MILESTONE_DAYS_BEFORE[milestone];

          return (
            <button
              key={milestone}
              onClick={() => onSelect(milestone)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all w-full group',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary',
                status === 'complete' && !isActive && 'opacity-60'
              )}
            >
              <div className="flex-shrink-0">
                {status === 'complete' ? (
                  <CheckCircle2 className={cn('w-5 h-5', isActive ? 'text-primary-foreground' : 'text-success')} />
                ) : status === 'overdue' ? (
                  <Clock className={cn('w-5 h-5', isActive ? 'text-primary-foreground' : 'text-destructive')} />
                ) : status === 'current' ? (
                  <Circle className={cn('w-5 h-5', isActive ? 'text-primary-foreground' : 'text-accent fill-accent')} />
                ) : (
                  <Circle className={cn('w-5 h-5', isActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('font-medium truncate', !isActive && 'text-card-foreground')}>
                  {MILESTONE_LABELS[milestone]}
                </p>
                {stats.total > 0 && (
                  <p className={cn('text-xs', isActive ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                    {stats.done}/{stats.total} tasks
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
