import { Task, TaskStatus, CATEGORY_COLORS, MILESTONE_LABELS } from '@/types/race';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Eye, EyeOff, Pencil, GripVertical, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskItemProps {
  task: Task;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onToggleHidden: (taskId: string) => void;
  showMilestone?: boolean;
  compact?: boolean;
}

export function TaskItem({
  task,
  onStatusChange,
  onEdit,
  onToggleHidden,
  showMilestone = false,
  compact = false,
}: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isDone = task.status === 'DONE';
  const isSkipped = task.status === 'SKIPPED';

  const handleCheckChange = (checked: boolean) => {
    onStatusChange(task.id, checked ? 'DONE' : 'NOT_STARTED');
  };

  const handleSkip = () => {
    onStatusChange(task.id, isSkipped ? 'NOT_STARTED' : 'SKIPPED');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`group bg-card rounded-lg border border-border/50 ${
        task.is_hidden ? 'opacity-50' : ''
      } ${isDone || isSkipped ? 'bg-muted/30' : ''}`}
    >
      <div className={`flex items-start gap-3 ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center gap-2 pt-0.5">
          <div className="opacity-0 group-hover:opacity-50 transition-opacity cursor-grab">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
          <Checkbox
            checked={isDone}
            onCheckedChange={handleCheckChange}
            className="tap-target data-[state=checked]:animate-check-bounce"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p
                className={`font-medium text-card-foreground leading-snug ${
                  isDone || isSkipped ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {task.title}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className={`milestone-chip ${CATEGORY_COLORS[task.category]}`}>
                  {task.category}
                </span>
                {showMilestone && (
                  <span className="text-xs text-muted-foreground">
                    {MILESTONE_LABELS[task.milestone]}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              {task.description && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-60 hover:opacity-100"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-60 hover:opacity-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSkip}>
                    {isSkipped ? 'Unskip' : 'Skip this task'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleHidden(task.id)}>
                    {task.is_hidden ? (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Show task
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Hide task
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && task.description && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pl-14">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {task.description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
