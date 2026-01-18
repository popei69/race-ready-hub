import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getRace,
  getTasksForRace,
  saveTask,
  saveTasks,
  deleteRace,
  getProfile,
  saveProfile,
} from '@/lib/storage';
import {
  daysUntilRace,
  calculateProgress,
  getTasksDueNow,
  applyPersonalization,
} from '@/lib/checklist-engine';
import {
  Race,
  Task,
  Milestone,
  TaskStatus,
  DISTANCE_LABELS,
  MILESTONE_ORDER,
  MILESTONE_LABELS,
  PersonalizationProfile,
} from '@/types/race';
import { Header } from '@/components/Header';
import { TaskItem } from '@/components/TaskItem';
import { TaskEditDialog } from '@/components/TaskEditDialog';
import { MilestoneNav } from '@/components/MilestoneNav';
import { PersonalizationPanel } from '@/components/PersonalizationPanel';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  MoreVertical,
  Copy,
  Trash2,
  Pencil,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ListTodo,
  Eye,
  EyeOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function RaceOverview() {
  const { raceId } = useParams<{ raceId: string }>();
  const navigate = useNavigate();

  const [race, setRace] = useState<Race | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'personalize'>('overview');
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showHiddenTasks, setShowHiddenTasks] = useState(false);
  const [profile, setProfile] = useState<PersonalizationProfile>({
    race_id: raceId || '',
    international_travel: false,
    stays_in_hotel: false,
    heat_sensitive: false,
    uses_gels: false,
    uses_hydration_pack: false,
    uses_headphones: false,
    has_dependents: false,
  });

  useEffect(() => {
    if (!raceId) {
      navigate('/');
      return;
    }

    const loadedRace = getRace(raceId);
    if (!loadedRace) {
      toast.error('Race not found');
      navigate('/');
      return;
    }

    setRace(loadedRace);
    setTasks(getTasksForRace(raceId));

    const existingProfile = getProfile(raceId);
    if (existingProfile) {
      setProfile(existingProfile);
    } else {
      // Set defaults based on race
      setProfile({
        race_id: raceId,
        international_travel: loadedRace.is_travel_race,
        stays_in_hotel: loadedRace.is_travel_race,
        heat_sensitive: false,
        uses_gels: loadedRace.distance !== '10K',
        uses_hydration_pack: false,
        uses_headphones: false,
        has_dependents: false,
      });
    }
  }, [raceId, navigate]);

  const refreshTasks = useCallback(() => {
    if (raceId) {
      setTasks(getTasksForRace(raceId));
    }
  }, [raceId]);

  if (!race) {
    return null;
  }

  const daysLeft = daysUntilRace(race.date);
  const progress = calculateProgress(tasks);
  const { overdue, dueNow, upcoming } = getTasksDueNow(tasks, daysLeft);
  const isPast = daysLeft < 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      const updatedTask = { ...task, status };
      saveTask(updatedTask);
      refreshTasks();
      if (status === 'DONE') {
        toast.success('Task completed! 🎉');
      }
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskDialogOpen(true);
  };

  const handleSaveTask = (task: Task) => {
    saveTask(task);
    refreshTasks();
    toast.success(editingTask ? 'Task updated' : 'Task added');
    setEditingTask(null);
  };

  const handleToggleHidden = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      const updatedTask = { ...task, is_hidden: !task.is_hidden };
      saveTask(updatedTask);
      refreshTasks();
      toast.success(updatedTask.is_hidden ? 'Task hidden' : 'Task visible');
    }
  };

  const handleAddTask = (milestone?: Milestone) => {
    setEditingTask(null);
    setActiveMilestone(milestone || null);
    setIsTaskDialogOpen(true);
  };

  const handleDeleteRace = () => {
    deleteRace(race.id);
    toast.success('Race deleted');
    navigate('/');
  };

  const handleApplyPersonalization = () => {
    if (!race) return;
    
    saveProfile(profile);
    const updatedTasks = applyPersonalization(tasks, race, profile);
    saveTasks(updatedTasks);
    refreshTasks();
    toast.success('Checklist personalized!');
    setActiveTab('overview');
  };

  const getTasksForMilestone = (milestone: Milestone) => {
    return tasks
      .filter((t) => t.milestone === milestone && (showHiddenTasks || !t.is_hidden))
      .sort((a, b) => a.sort_order - b.sort_order);
  };

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-6">
      <Header
        title={race.name}
        showBack
        backTo="/"
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="tap-target">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/race/edit/${race.id}`)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit Race
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/race/new/duplicate/${race.id}`)}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate Race
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Race
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <main className="container py-4 sm:py-6">
        {/* Race Header Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium px-2.5 py-1 bg-secondary rounded-full text-secondary-foreground">
                    {DISTANCE_LABELS[race.distance]}
                  </span>
                  {race.is_travel_race && (
                    <span className="text-sm font-medium px-2.5 py-1 bg-accent/10 text-accent rounded-full">
                      Travel Race
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDate(race.date)}
                  </span>
                  {race.start_time && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {race.start_time}
                    </span>
                  )}
                  {(race.city || race.country) && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {[race.city, race.country].filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-left sm:text-right">
                <p className={`font-display text-4xl font-bold ${isPast ? 'text-muted-foreground' : 'countdown-text'}`}>
                  {isPast ? '—' : daysLeft}
                </p>
                <p className="text-sm text-muted-foreground">
                  {daysLeft === 0
                    ? 'Race day!'
                    : daysLeft === 1
                    ? 'day to go'
                    : isPast
                    ? 'completed'
                    : 'days to go'}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Overall progress</span>
                <span className="text-sm font-medium">
                  {progress.done}/{progress.total} tasks ({progress.percentage}%)
                </span>
              </div>
              <Progress value={progress.percentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="w-full sm:w-auto mb-6">
            <TabsTrigger value="overview" className="flex-1 sm:flex-initial gap-2">
              <ListTodo className="w-4 h-4" />
              Due Now
            </TabsTrigger>
            <TabsTrigger value="milestones" className="flex-1 sm:flex-initial gap-2">
              <Calendar className="w-4 h-4" />
              Milestones
            </TabsTrigger>
            <TabsTrigger value="personalize" className="flex-1 sm:flex-initial gap-2">
              <Sparkles className="w-4 h-4" />
              Personalize
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - What's Due Now */}
          <TabsContent value="overview" className="space-y-6">
            {/* Overdue Tasks */}
            {overdue.length > 0 && (
              <Card className="border-destructive/30" style={{ background: 'hsl(var(--overdue-bg))' }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    Overdue ({overdue.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {overdue.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onStatusChange={handleStatusChange}
                        onEdit={handleEditTask}
                        onToggleHidden={handleToggleHidden}
                        showMilestone
                        compact
                      />
                    ))}
                  </AnimatePresence>
                </CardContent>
              </Card>
            )}

            {/* Due Now Tasks */}
            {dueNow.length > 0 && (
              <Card style={{ background: 'hsl(var(--due-now-bg))' }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-warning">
                    <Clock className="w-5 h-5" />
                    Due Now ({dueNow.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {dueNow.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onStatusChange={handleStatusChange}
                        onEdit={handleEditTask}
                        onToggleHidden={handleToggleHidden}
                        showMilestone
                        compact
                      />
                    ))}
                  </AnimatePresence>
                </CardContent>
              </Card>
            )}

            {/* All caught up */}
            {overdue.length === 0 && dueNow.length === 0 && (
              <EmptyState
                icon={CheckCircle2}
                title="You're all caught up!"
                description={
                  upcoming.length > 0
                    ? `${upcoming.length} tasks coming up in future milestones.`
                    : 'All tasks completed. Good luck on race day!'
                }
              />
            )}

            {/* Quick add button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleAddTask()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Milestone Navigation */}
              <div className="sm:w-56 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">Timeline</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHiddenTasks(!showHiddenTasks)}
                    className="h-8 text-xs gap-1"
                  >
                    {showHiddenTasks ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showHiddenTasks ? 'Hide' : 'Show'} hidden
                  </Button>
                </div>
                <MilestoneNav
                  tasks={tasks}
                  daysUntilRace={daysLeft}
                  activeMilestone={activeMilestone}
                  onSelect={setActiveMilestone}
                />
              </div>

              {/* Tasks for selected milestone */}
              <div className="flex-1 min-w-0">
                {activeMilestone ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-lg font-semibold">
                        {MILESTONE_LABELS[activeMilestone]}
                      </h3>
                      <Button size="sm" onClick={() => handleAddTask(activeMilestone)}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <AnimatePresence mode="popLayout">
                        {getTasksForMilestone(activeMilestone).map((task) => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            onStatusChange={handleStatusChange}
                            onEdit={handleEditTask}
                            onToggleHidden={handleToggleHidden}
                          />
                        ))}
                      </AnimatePresence>
                    </div>

                    {getTasksForMilestone(activeMilestone).length === 0 && (
                      <EmptyState
                        icon={ListTodo}
                        title="No tasks here"
                        description="Add a task to this milestone"
                        actionLabel="Add Task"
                        onAction={() => handleAddTask(activeMilestone)}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 text-muted-foreground">
                    Select a milestone to view tasks
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Personalize Tab */}
          <TabsContent value="personalize">
            <PersonalizationPanel
              profile={profile}
              onChange={setProfile}
              onApply={handleApplyPersonalization}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Task Edit Dialog */}
      <TaskEditDialog
        task={editingTask}
        raceId={race.id}
        defaultMilestone={activeMilestone || 'D_7'}
        isOpen={isTaskDialogOpen}
        onClose={() => {
          setIsTaskDialogOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this race?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{race.name}" and all its tasks. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRace}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
