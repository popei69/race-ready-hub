import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  daysUntilRace,
  getAdjustedMilestone,
  generateDefaultChecklist,
  calculateProgress,
} from "@/lib/checklist-engine";
import type { Race, Task } from "@/types/race";

function makeRace(overrides: Partial<Race> = {}): Race {
  return {
    id: "race-1",
    name: "Test Marathon",
    distance: "MARATHON",
    date: "2025-06-15",
    is_travel_race: false,
    created_at: "2025-01-01T00:00:00.000Z",
    updated_at: "2025-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("checklist-engine", () => {
  describe("daysUntilRace", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns positive days when race is tomorrow", () => {
      vi.setSystemTime(new Date("2025-02-01T12:00:00Z"));
      expect(daysUntilRace("2025-02-02")).toBe(1);
    });

    it("returns 0 when race is today", () => {
      vi.setSystemTime(new Date("2025-02-01T12:00:00Z"));
      expect(daysUntilRace("2025-02-01")).toBe(0);
    });

    it("returns negative days when race is in the past", () => {
      vi.setSystemTime(new Date("2025-02-01T12:00:00Z"));
      expect(daysUntilRace("2025-01-31")).toBe(-1);
    });
  });

  describe("getAdjustedMilestone", () => {
    it("returns original milestone when days until race >= milestone window", () => {
      expect(getAdjustedMilestone("D_7", 10)).toBe("D_7");
      expect(getAdjustedMilestone("D_7", 7)).toBe("D_7");
      expect(getAdjustedMilestone("MO_3", 100)).toBe("MO_3");
      expect(getAdjustedMilestone("ASAP_6MO", 200)).toBe("ASAP_6MO");
    });

    it("returns rolled-forward milestone when past window (e.g. RACE_MORNING when race is today)", () => {
      expect(getAdjustedMilestone("D_7", 0)).toBe("RACE_MORNING");
      expect(getAdjustedMilestone("D_1", 0)).toBe("RACE_MORNING");
      expect(getAdjustedMilestone("D_7", 1)).toBe("D_1");
      expect(getAdjustedMilestone("MO_1", 10)).toBe("D_7");
      expect(getAdjustedMilestone("MO_1", 5)).toBe("D_1");
    });
  });

  describe("generateDefaultChecklist", () => {
    it("returns tasks with race_id, required fields, and expected length", () => {
      const race = makeRace({ id: "my-race", is_travel_race: false });
      const tasks = generateDefaultChecklist(race);

      expect(tasks.length).toBeGreaterThan(0);
      tasks.forEach((t) => {
        expect(t.race_id).toBe("my-race");
        expect(t.id).toBeDefined();
        expect(t.title).toBeDefined();
        expect(t.category).toBeDefined();
        expect(t.milestone).toBeDefined();
        expect(t.status).toBe("NOT_STARTED");
        expect(typeof t.sort_order).toBe("number");
        expect(t.is_default).toBe(true);
        expect(t.is_hidden).toBe(false);
      });
    });

    it("includes fewer tasks when is_travel_race is false (no travel-only tasks)", () => {
      const raceNoTravel = makeRace({ id: "r1", is_travel_race: false });
      const raceTravel = makeRace({ id: "r2", is_travel_race: true });
      const tasksNoTravel = generateDefaultChecklist(raceNoTravel);
      const tasksTravel = generateDefaultChecklist(raceTravel);

      expect(tasksNoTravel.length).toBeLessThan(tasksTravel.length);
    });

    it("includes travel-related tasks when is_travel_race is true", () => {
      const race = makeRace({ id: "r1", is_travel_race: true });
      const tasks = generateDefaultChecklist(race);
      const travelTitles = tasks
        .filter((t) => t.category === "Travel")
        .map((t) => t.title);
      expect(travelTitles.some((t) => t.toLowerCase().includes("passport") || t.toLowerCase().includes("visa"))).toBe(true);
      expect(travelTitles.some((t) => t.toLowerCase().includes("flight") || t.toLowerCase().includes("accommodation"))).toBe(true);
    });
  });

  describe("calculateProgress", () => {
    it("computes total, done, and percentage for mix of DONE, NOT_STARTED, SKIPPED", () => {
      const tasks: Task[] = [
        { id: "1", race_id: "r1", title: "A", category: "Admin & Rules", milestone: "D_7", status: "DONE", sort_order: 0, is_default: true, is_hidden: false },
        { id: "2", race_id: "r1", title: "B", category: "Admin & Rules", milestone: "D_7", status: "NOT_STARTED", sort_order: 1, is_default: true, is_hidden: false },
        { id: "3", race_id: "r1", title: "C", category: "Admin & Rules", milestone: "D_7", status: "SKIPPED", sort_order: 2, is_default: true, is_hidden: false },
      ];
      const progress = calculateProgress(tasks);
      expect(progress.total).toBe(3);
      expect(progress.done).toBe(2); // DONE + SKIPPED
      expect(progress.percentage).toBe(67); // 2/3 rounded
    });

    it("excludes hidden tasks from total and done", () => {
      const tasks: Task[] = [
        { id: "1", race_id: "r1", title: "A", category: "Admin & Rules", milestone: "D_7", status: "DONE", sort_order: 0, is_default: true, is_hidden: false },
        { id: "2", race_id: "r1", title: "B", category: "Admin & Rules", milestone: "D_7", status: "DONE", sort_order: 1, is_default: true, is_hidden: true },
      ];
      const progress = calculateProgress(tasks);
      expect(progress.total).toBe(1);
      expect(progress.done).toBe(1);
      expect(progress.percentage).toBe(100);
    });

    it("returns 0 percentage when no visible tasks", () => {
      const progress = calculateProgress([]);
      expect(progress.total).toBe(0);
      expect(progress.done).toBe(0);
      expect(progress.percentage).toBe(0);
    });
  });
});
