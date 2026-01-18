import { Task, TaskCategory, Milestone, MILESTONE_LABELS } from '@/types/race';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface TaskEditDialogProps {
  task: Task | null;
  raceId: string;
  defaultMilestone?: Milestone;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const CATEGORIES: TaskCategory[] = [
  'Travel',
  'Gear & Clothing',
  'Admin & Rules',
  'Nutrition & Strategy',
  'Personal & Misc',
];

export function TaskEditDialog({
  task,
  raceId,
  defaultMilestone = 'D_7',
  isOpen,
  onClose,
  onSave,
}: TaskEditDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Personal & Misc');
  const [milestone, setMilestone] = useState<Milestone>(defaultMilestone);

  const isNew = !task;

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setCategory(task.category);
      setMilestone(task.milestone);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Personal & Misc');
      setMilestone(defaultMilestone);
    }
  }, [task, defaultMilestone]);

  const handleSave = () => {
    if (!title.trim()) return;

    const savedTask: Task = {
      id: task?.id || uuidv4(),
      race_id: raceId,
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      milestone,
      status: task?.status || 'NOT_STARTED',
      sort_order: task?.sort_order || Date.now(),
      is_default: task?.is_default || false,
      is_hidden: task?.is_hidden || false,
    };

    onSave(savedTask);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Add Task' : 'Edit Task'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details or tips..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as TaskCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Milestone</Label>
              <Select value={milestone} onValueChange={(v) => setMilestone(v as Milestone)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MILESTONE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            {isNew ? 'Add Task' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
