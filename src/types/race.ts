export type RaceDistance = '10K' | 'HALF' | 'MARATHON';

export type Milestone = 'ASAP_6MO' | 'MO_3' | 'MO_1' | 'D_7' | 'D_1' | 'RACE_MORNING';

export type TaskCategory = 'Travel' | 'Gear & Clothing' | 'Admin & Rules' | 'Nutrition & Strategy' | 'Personal & Misc';

export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE' | 'SKIPPED';

export interface Race {
  id: string;
  name: string;
  distance: RaceDistance;
  date: string; // YYYY-MM-DD
  start_time?: string; // HH:mm
  city?: string;
  country?: string;
  is_travel_race: boolean;
  created_from_race_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  race_id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  milestone: Milestone;
  status: TaskStatus;
  sort_order: number;
  is_default: boolean;
  is_hidden: boolean;
}

export interface PersonalizationProfile {
  race_id: string;
  international_travel: boolean;
  stays_in_hotel: boolean;
  heat_sensitive: boolean;
  uses_gels: boolean;
  uses_hydration_pack: boolean;
  uses_headphones: boolean;
  has_dependents: boolean;
}

export const MILESTONE_ORDER: Milestone[] = [
  'ASAP_6MO',
  'MO_3',
  'MO_1',
  'D_7',
  'D_1',
  'RACE_MORNING',
];

export const MILESTONE_LABELS: Record<Milestone, string> = {
  'ASAP_6MO': 'ASAP / 6 months',
  'MO_3': '3 months out',
  'MO_1': '1 month out',
  'D_7': '7 days out',
  'D_1': 'Day before',
  'RACE_MORNING': 'Race morning',
};

export const MILESTONE_DAYS_BEFORE: Record<Milestone, number> = {
  'ASAP_6MO': 180,
  'MO_3': 90,
  'MO_1': 30,
  'D_7': 7,
  'D_1': 1,
  'RACE_MORNING': 0,
};

export const DISTANCE_LABELS: Record<RaceDistance, string> = {
  '10K': '10K',
  'HALF': 'Half Marathon',
  'MARATHON': 'Marathon',
};

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  'Travel': 'category-travel',
  'Gear & Clothing': 'category-gear',
  'Admin & Rules': 'category-admin',
  'Nutrition & Strategy': 'category-nutrition',
  'Personal & Misc': 'category-personal',
};
