import { v4 as uuidv4 } from 'uuid';
import {
  Task,
  Race,
  Milestone,
  TaskCategory,
  MILESTONE_ORDER,
  MILESTONE_DAYS_BEFORE,
  PersonalizationProfile,
} from '@/types/race';

interface DefaultTaskDef {
  title: string;
  description?: string;
  category: TaskCategory;
  milestone: Milestone;
  condition?: (race: Race) => boolean;
}

const DEFAULT_TASKS: DefaultTaskDef[] = [
  // ASAP / 6 months
  {
    title: 'Register for race and confirm entry',
    description: 'Complete registration, save confirmation email, and note any early bird perks.',
    category: 'Admin & Rules',
    milestone: 'ASAP_6MO',
  },
  {
    title: 'Review race rules',
    description: 'Check cut-off times, bag drop policy, hydration stations, headphone rules.',
    category: 'Admin & Rules',
    milestone: 'ASAP_6MO',
  },
  {
    title: 'Check passport validity and visa requirements',
    description: 'Ensure passport is valid for 6+ months after race date. Check visa needs.',
    category: 'Travel',
    milestone: 'ASAP_6MO',
    condition: (race) => race.is_travel_race,
  },
  {
    title: 'Note early start time and plan heat strategy',
    description: 'SEA races often start at 4-5am. Plan hydration, salt tabs, and cooling gear.',
    category: 'Nutrition & Strategy',
    milestone: 'ASAP_6MO',
  },
  // 3 months
  {
    title: 'Book flights and accommodation',
    description: 'Prefer hotels close to start/finish or with good transport links.',
    category: 'Travel',
    milestone: 'MO_3',
    condition: (race) => race.is_travel_race,
  },
  {
    title: 'Decide on race shoes and start using in long runs',
    description: 'Break in your race shoes with at least 50-80km before race day.',
    category: 'Gear & Clothing',
    milestone: 'MO_3',
  },
  {
    title: 'Research typical climate for race location',
    description: 'Check historical weather data and shortlist appropriate gear options.',
    category: 'Gear & Clothing',
    milestone: 'MO_3',
  },
  // 1 month
  {
    title: 'Confirm all bookings',
    description: 'Double-check time off work, hotel reservations, and transport arrangements.',
    category: 'Travel',
    milestone: 'MO_1',
    condition: (race) => race.is_travel_race,
  },
  {
    title: 'Test race-day nutrition',
    description: 'Practice your planned breakfast and in-race fueling during training runs.',
    category: 'Nutrition & Strategy',
    milestone: 'MO_1',
  },
  {
    title: 'Check race weekend schedule',
    description: 'Review expo dates, bib pickup hours, start corrals, and bag drop times.',
    category: 'Admin & Rules',
    milestone: 'MO_1',
  },
  // 7 days
  {
    title: 'Check 7-day weather forecast',
    description: 'Refine your gear list based on expected conditions.',
    category: 'Gear & Clothing',
    milestone: 'D_7',
  },
  {
    title: 'Prepare complete packing list',
    description: 'Shoes, socks, kit, bib belt, hat/visor, anti-chafe, gels, watch, chargers, post-race clothes.',
    category: 'Gear & Clothing',
    milestone: 'D_7',
  },
  {
    title: 'Confirm expo and bib pickup details',
    description: 'Note location, opening hours, and what documents you need.',
    category: 'Admin & Rules',
    milestone: 'D_7',
  },
  {
    title: 'Plan transport to start line',
    description: 'Include buffer time for road closures and crowds.',
    category: 'Travel',
    milestone: 'D_7',
  },
  // Day before
  {
    title: 'Lay out full race kit',
    description: 'Pin bib if required. Double-check everything is ready.',
    category: 'Gear & Clothing',
    milestone: 'D_1',
  },
  {
    title: 'Pack race bag and post-race clothes',
    description: 'Include warm layers, flip flops, and any recovery items.',
    category: 'Gear & Clothing',
    milestone: 'D_1',
  },
  {
    title: 'Charge all devices',
    description: 'Watch, phone, headphones. Pack power bank.',
    category: 'Personal & Misc',
    milestone: 'D_1',
  },
  {
    title: 'Set alarms and confirm breakfast timing',
    description: 'Set primary and backup alarms. Plan to eat 2-3 hours before start.',
    category: 'Personal & Misc',
    milestone: 'D_1',
  },
  // Race morning
  {
    title: 'Morning routine: eat, hydrate, prepare',
    description: 'Breakfast, hydration, toilet, anti-chafe, sunscreen if needed.',
    category: 'Nutrition & Strategy',
    milestone: 'RACE_MORNING',
  },
  {
    title: 'Final kit check',
    description: 'Kit, gels, bottle, transit card, room key, cash/card.',
    category: 'Gear & Clothing',
    milestone: 'RACE_MORNING',
  },
  {
    title: 'Leave for start on time',
    description: 'Confirm bag drop location and any meet-up points.',
    category: 'Travel',
    milestone: 'RACE_MORNING',
  },
];

// Personalization-based additional tasks
const PERSONALIZATION_TASKS: {
  flag: keyof Omit<PersonalizationProfile, 'race_id'>;
  tasks: DefaultTaskDef[];
}[] = [
  {
    flag: 'has_dependents',
    tasks: [
      {
        title: 'Arrange childcare or pet care for race weekend',
        description: 'Confirm arrangements well in advance.',
        category: 'Personal & Misc',
        milestone: 'MO_1',
      },
    ],
  },
  {
    flag: 'international_travel',
    tasks: [
      {
        title: 'Prepare travel adapters and check roaming/eSIM',
        description: 'Ensure you can charge devices and stay connected.',
        category: 'Travel',
        milestone: 'D_7',
      },
      {
        title: 'Check travel insurance coverage',
        description: 'Ensure medical and trip cancellation coverage.',
        category: 'Admin & Rules',
        milestone: 'MO_1',
      },
    ],
  },
  {
    flag: 'stays_in_hotel',
    tasks: [
      {
        title: 'Confirm late checkout or baggage storage',
        description: 'Arrange post-race access to your belongings.',
        category: 'Travel',
        milestone: 'D_7',
      },
      {
        title: 'Check hotel breakfast timing',
        description: 'If breakfast starts late, plan an alternative pre-race meal.',
        category: 'Nutrition & Strategy',
        milestone: 'D_7',
      },
    ],
  },
  {
    flag: 'heat_sensitive',
    tasks: [
      {
        title: 'Add salt tabs and extra fluids to pack list',
        description: 'Consider electrolyte tablets and extra water for hot conditions.',
        category: 'Nutrition & Strategy',
        milestone: 'D_7',
      },
      {
        title: 'Pack sun protection gear',
        description: 'Sunscreen, hat/visor, sunglasses.',
        category: 'Gear & Clothing',
        milestone: 'D_7',
      },
    ],
  },
  {
    flag: 'uses_gels',
    tasks: [
      {
        title: 'Pack race gels and confirm carrying strategy',
        description: 'Belt, shorts pockets, or vest. Test in training.',
        category: 'Nutrition & Strategy',
        milestone: 'D_7',
      },
    ],
  },
  {
    flag: 'uses_hydration_pack',
    tasks: [
      {
        title: 'Clean and prepare hydration pack',
        description: 'Check bladder/bottles, test for leaks.',
        category: 'Gear & Clothing',
        milestone: 'D_7',
      },
    ],
  },
  {
    flag: 'uses_headphones',
    tasks: [
      {
        title: 'Confirm headphone rules and prepare device',
        description: 'Some races ban headphones. Check rules and prep playlist.',
        category: 'Personal & Misc',
        milestone: 'D_1',
      },
    ],
  },
];

/**
 * Calculate days until race
 */
export function daysUntilRace(raceDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const race = new Date(raceDate);
  race.setHours(0, 0, 0, 0);
  return Math.ceil((race.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Get the appropriate milestone for a task given days until race.
 * Tasks are rolled forward if their milestone window has passed.
 */
export function getAdjustedMilestone(originalMilestone: Milestone, daysUntil: number): Milestone {
  const originalDays = MILESTONE_DAYS_BEFORE[originalMilestone];
  
  // If the race is far enough out, keep original milestone
  if (daysUntil >= originalDays) {
    return originalMilestone;
  }
  
  // Find the earliest future milestone that makes sense
  for (const milestone of MILESTONE_ORDER) {
    const milestoneDays = MILESTONE_DAYS_BEFORE[milestone];
    if (daysUntil >= milestoneDays || milestone === 'RACE_MORNING') {
      return milestone;
    }
  }
  
  return 'RACE_MORNING';
}

/**
 * Generate default checklist for a new race
 */
export function generateDefaultChecklist(race: Race): Task[] {
  const daysUntil = daysUntilRace(race.date);
  const tasks: Task[] = [];
  let sortOrder = 0;

  for (const def of DEFAULT_TASKS) {
    // Skip conditional tasks that don't apply
    if (def.condition && !def.condition(race)) {
      continue;
    }

    const adjustedMilestone = getAdjustedMilestone(def.milestone, daysUntil);

    tasks.push({
      id: uuidv4(),
      race_id: race.id,
      title: def.title,
      description: def.description,
      category: def.category,
      milestone: adjustedMilestone,
      status: 'NOT_STARTED',
      sort_order: sortOrder++,
      is_default: true,
      is_hidden: false,
    });
  }

  return tasks;
}

/**
 * Apply personalization profile to add/remove tasks
 */
export function applyPersonalization(
  existingTasks: Task[],
  race: Race,
  profile: PersonalizationProfile
): Task[] {
  const daysUntil = daysUntilRace(race.date);
  const tasksToAdd: Task[] = [];
  let maxSortOrder = Math.max(0, ...existingTasks.map((t) => t.sort_order));

  for (const config of PERSONALIZATION_TASKS) {
    const isEnabled = profile[config.flag];
    
    for (const taskDef of config.tasks) {
      // Check if task already exists
      const existing = existingTasks.find((t) => t.title === taskDef.title);
      
      if (isEnabled && !existing) {
        // Add the task
        const adjustedMilestone = getAdjustedMilestone(taskDef.milestone, daysUntil);
        tasksToAdd.push({
          id: uuidv4(),
          race_id: race.id,
          title: taskDef.title,
          description: taskDef.description,
          category: taskDef.category,
          milestone: adjustedMilestone,
          status: 'NOT_STARTED',
          sort_order: ++maxSortOrder,
          is_default: false,
          is_hidden: false,
        });
      } else if (!isEnabled && existing) {
        // Hide the task instead of deleting
        existing.is_hidden = true;
      } else if (isEnabled && existing && existing.is_hidden) {
        // Unhide if re-enabled
        existing.is_hidden = false;
      }
    }
  }

  return [...existingTasks, ...tasksToAdd];
}

/**
 * Get the current milestone based on days until race
 */
export function getCurrentMilestone(daysUntil: number): Milestone {
  for (let i = 0; i < MILESTONE_ORDER.length; i++) {
    const milestone = MILESTONE_ORDER[i];
    const days = MILESTONE_DAYS_BEFORE[milestone];
    if (daysUntil >= days) {
      return milestone;
    }
  }
  return 'RACE_MORNING';
}

/**
 * Determine which tasks are "due now" (current milestone + overdue)
 */
export function getTasksDueNow(tasks: Task[], daysUntil: number): {
  overdue: Task[];
  dueNow: Task[];
  upcoming: Task[];
} {
  const currentMilestone = getCurrentMilestone(daysUntil);
  const currentMilestoneIndex = MILESTONE_ORDER.indexOf(currentMilestone);
  
  const visibleTasks = tasks.filter((t) => !t.is_hidden);
  const incompleteTasks = visibleTasks.filter((t) => t.status !== 'DONE' && t.status !== 'SKIPPED');
  
  const overdue: Task[] = [];
  const dueNow: Task[] = [];
  const upcoming: Task[] = [];
  
  for (const task of incompleteTasks) {
    const taskMilestoneIndex = MILESTONE_ORDER.indexOf(task.milestone);
    
    if (taskMilestoneIndex < currentMilestoneIndex) {
      overdue.push(task);
    } else if (taskMilestoneIndex === currentMilestoneIndex) {
      dueNow.push(task);
    } else {
      upcoming.push(task);
    }
  }
  
  return { overdue, dueNow, upcoming };
}

/**
 * Calculate race progress
 */
export function calculateProgress(tasks: Task[]): {
  total: number;
  done: number;
  percentage: number;
} {
  const visibleTasks = tasks.filter((t) => !t.is_hidden);
  const done = visibleTasks.filter((t) => t.status === 'DONE' || t.status === 'SKIPPED').length;
  const total = visibleTasks.length;
  const percentage = total > 0 ? Math.round((done / total) * 100) : 0;
  
  return { total, done, percentage };
}

/**
 * Duplicate a race and its tasks for use as a template
 */
export function duplicateRace(
  sourceRace: Race,
  sourceTasks: Task[],
  newName: string,
  newDate: string
): { race: Race; tasks: Task[] } {
  const newRaceId = uuidv4();
  const oldDaysUntil = daysUntilRace(sourceRace.date);
  const newDaysUntil = daysUntilRace(newDate);
  
  const newRace: Race = {
    ...sourceRace,
    id: newRaceId,
    name: newName,
    date: newDate,
    created_from_race_id: sourceRace.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  const newTasks: Task[] = sourceTasks.map((task, index) => {
    // Recalculate milestone based on new race date
    const originalMilestoneIndex = MILESTONE_ORDER.indexOf(task.milestone);
    let newMilestone = task.milestone;
    
    // If the original task was adjusted for the old race, try to restore original timing
    // This is a simplified approach - just use the same milestone for now
    newMilestone = getAdjustedMilestone(task.milestone, newDaysUntil);
    
    return {
      ...task,
      id: uuidv4(),
      race_id: newRaceId,
      milestone: newMilestone,
      status: 'NOT_STARTED' as const,
      sort_order: index,
    };
  });
  
  return { race: newRace, tasks: newTasks };
}
