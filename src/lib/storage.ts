import { Race, Task, PersonalizationProfile } from '@/types/race';

const STORAGE_KEYS = {
  RACES: 'rpc_races',
  TASKS: 'rpc_tasks',
  PROFILES: 'rpc_profiles',
  SETTINGS: 'rpc_settings',
} as const;

// Generic storage helpers
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

// Races
export function getRaces(): Race[] {
  return getItem<Race[]>(STORAGE_KEYS.RACES, []);
}

export function getRace(id: string): Race | undefined {
  return getRaces().find((r) => r.id === id);
}

export function saveRace(race: Race): void {
  const races = getRaces();
  const index = races.findIndex((r) => r.id === race.id);
  if (index >= 0) {
    races[index] = { ...race, updated_at: new Date().toISOString() };
  } else {
    races.push(race);
  }
  setItem(STORAGE_KEYS.RACES, races);
}

export function deleteRace(id: string): void {
  const races = getRaces().filter((r) => r.id !== id);
  setItem(STORAGE_KEYS.RACES, races);
  // Also delete associated tasks and profile
  const tasks = getTasks().filter((t) => t.race_id !== id);
  setItem(STORAGE_KEYS.TASKS, tasks);
  const profiles = getItem<PersonalizationProfile[]>(STORAGE_KEYS.PROFILES, []).filter(
    (p) => p.race_id !== id
  );
  setItem(STORAGE_KEYS.PROFILES, profiles);
}

// Tasks
export function getTasks(): Task[] {
  return getItem<Task[]>(STORAGE_KEYS.TASKS, []);
}

export function getTasksForRace(raceId: string): Task[] {
  return getTasks()
    .filter((t) => t.race_id === raceId)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function saveTask(task: Task): void {
  const tasks = getTasks();
  const index = tasks.findIndex((t) => t.id === task.id);
  if (index >= 0) {
    tasks[index] = task;
  } else {
    tasks.push(task);
  }
  setItem(STORAGE_KEYS.TASKS, tasks);
}

export function saveTasks(newTasks: Task[]): void {
  const existingTasks = getTasks();
  const taskMap = new Map(existingTasks.map((t) => [t.id, t]));
  newTasks.forEach((t) => taskMap.set(t.id, t));
  setItem(STORAGE_KEYS.TASKS, Array.from(taskMap.values()));
}

export function deleteTask(id: string): void {
  const tasks = getTasks().filter((t) => t.id !== id);
  setItem(STORAGE_KEYS.TASKS, tasks);
}

// Personalization Profiles
export function getProfile(raceId: string): PersonalizationProfile | undefined {
  const profiles = getItem<PersonalizationProfile[]>(STORAGE_KEYS.PROFILES, []);
  return profiles.find((p) => p.race_id === raceId);
}

export function saveProfile(profile: PersonalizationProfile): void {
  const profiles = getItem<PersonalizationProfile[]>(STORAGE_KEYS.PROFILES, []);
  const index = profiles.findIndex((p) => p.race_id === profile.race_id);
  if (index >= 0) {
    profiles[index] = profile;
  } else {
    profiles.push(profile);
  }
  setItem(STORAGE_KEYS.PROFILES, profiles);
}

// Settings
export interface AppSettings {
  notifications_enabled: boolean;
}

export function getSettings(): AppSettings {
  return getItem<AppSettings>(STORAGE_KEYS.SETTINGS, {
    notifications_enabled: false,
  });
}

export function saveSettings(settings: AppSettings): void {
  setItem(STORAGE_KEYS.SETTINGS, settings);
}

// Export/Import for data portability (future backend integration point)
export function exportAllData() {
  return {
    races: getRaces(),
    tasks: getTasks(),
    profiles: getItem<PersonalizationProfile[]>(STORAGE_KEYS.PROFILES, []),
    settings: getSettings(),
    exported_at: new Date().toISOString(),
  };
}

export function importData(data: ReturnType<typeof exportAllData>): void {
  if (data.races) setItem(STORAGE_KEYS.RACES, data.races);
  if (data.tasks) setItem(STORAGE_KEYS.TASKS, data.tasks);
  if (data.profiles) setItem(STORAGE_KEYS.PROFILES, data.profiles);
  if (data.settings) setItem(STORAGE_KEYS.SETTINGS, data.settings);
}
