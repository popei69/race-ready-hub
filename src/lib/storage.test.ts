import { describe, it, expect, beforeEach } from "vitest";
import {
  getRaces,
  getRace,
  saveRace,
  deleteRace,
  getTasks,
  getTasksForRace,
  saveTask,
  saveTasks,
  deleteTask,
  getProfile,
  saveProfile,
  getSettings,
  saveSettings,
  exportAllData,
  importData,
} from "@/lib/storage";
import type { Race, Task, PersonalizationProfile } from "@/types/race";

const STORAGE_KEYS = ["rpc_races", "rpc_tasks", "rpc_profiles", "rpc_settings"];

function clearStorage(): void {
  STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

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

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    race_id: "race-1",
    title: "Test task",
    category: "Admin & Rules",
    milestone: "D_7",
    status: "NOT_STARTED",
    sort_order: 0,
    is_default: true,
    is_hidden: false,
    ...overrides,
  };
}

function makeProfile(overrides: Partial<PersonalizationProfile> = {}): PersonalizationProfile {
  return {
    race_id: "race-1",
    international_travel: false,
    stays_in_hotel: false,
    heat_sensitive: false,
    uses_gels: false,
    uses_hydration_pack: false,
    uses_headphones: false,
    has_dependents: false,
    ...overrides,
  };
}

describe("storage", () => {
  beforeEach(() => {
    clearStorage();
  });

  describe("getRaces / saveRace / getRace / deleteRace", () => {
    it("getRaces() returns empty array initially", () => {
      expect(getRaces()).toEqual([]);
    });

    it("saveRace() then getRaces() returns the race", () => {
      const race = makeRace();
      saveRace(race);
      const races = getRaces();
      expect(races).toHaveLength(1);
      expect(races[0].id).toBe(race.id);
      expect(races[0].name).toBe(race.name);
    });

    it("getRace(id) returns the race when present", () => {
      const race = makeRace({ id: "my-race" });
      saveRace(race);
      expect(getRace("my-race")).toBeDefined();
      expect(getRace("my-race")?.id).toBe("my-race");
    });

    it("getRace(id) returns undefined when not present", () => {
      expect(getRace("nonexistent")).toBeUndefined();
    });

    it("deleteRace(id) removes the race and associated tasks and profiles", () => {
      const race = makeRace({ id: "r1" });
      saveRace(race);
      saveTask(makeTask({ id: "t1", race_id: "r1" }));
      saveTask(makeTask({ id: "t2", race_id: "other" }));
      saveProfile(makeProfile({ race_id: "r1" }));
      saveProfile(makeProfile({ race_id: "other" }));

      deleteRace("r1");

      expect(getRaces()).toHaveLength(0);
      expect(getRace("r1")).toBeUndefined();
      const tasks = getTasks();
      expect(tasks.find((t) => t.race_id === "r1")).toBeUndefined();
      expect(tasks.find((t) => t.race_id === "other")).toBeDefined();
      expect(getProfile("r1")).toBeUndefined();
      expect(getProfile("other")).toBeDefined();
    });
  });

  describe("tasks: getTasksForRace, saveTask, saveTasks, deleteTask", () => {
    it("getTasksForRace(raceId) returns tasks for that race sorted by sort_order", () => {
      saveRace(makeRace({ id: "r1" }));
      saveTask(makeTask({ id: "t1", race_id: "r1", sort_order: 2 }));
      saveTask(makeTask({ id: "t2", race_id: "r1", sort_order: 0 }));
      saveTask(makeTask({ id: "t3", race_id: "r2", sort_order: 0 }));

      const forR1 = getTasksForRace("r1");
      expect(forR1).toHaveLength(2);
      expect(forR1[0].sort_order).toBe(0);
      expect(forR1[1].sort_order).toBe(2);
      expect(getTasksForRace("r2")).toHaveLength(1);
      expect(getTasksForRace("r-none")).toHaveLength(0);
    });

    it("saveTask() adds new task and updates existing", () => {
      saveRace(makeRace({ id: "r1" }));
      const t = makeTask({ id: "t1", race_id: "r1", title: "Original" });
      saveTask(t);
      expect(getTasks()).toHaveLength(1);
      expect(getTasks()[0].title).toBe("Original");

      saveTask({ ...t, title: "Updated" });
      expect(getTasks()).toHaveLength(1);
      expect(getTasks()[0].title).toBe("Updated");
    });

    it("saveTasks() merges with existing tasks by id", () => {
      saveTask(makeTask({ id: "t1", race_id: "r1", title: "Old" }));
      saveTasks([
        makeTask({ id: "t2", race_id: "r1", title: "New task" }),
        makeTask({ id: "t1", race_id: "r1", title: "Updated t1" }),
      ]);
      const tasks = getTasks();
      expect(tasks).toHaveLength(2);
      const t1 = tasks.find((t) => t.id === "t1");
      const t2 = tasks.find((t) => t.id === "t2");
      expect(t1?.title).toBe("Updated t1");
      expect(t2?.title).toBe("New task");
    });

    it("deleteTask(id) removes the task", () => {
      saveTask(makeTask({ id: "t1", race_id: "r1" }));
      saveTask(makeTask({ id: "t2", race_id: "r1" }));
      deleteTask("t1");
      expect(getTasks()).toHaveLength(1);
      expect(getTasks()[0].id).toBe("t2");
    });
  });

  describe("exportAllData / importData", () => {
    it("exportAllData() returns object with races, tasks, profiles, settings, exported_at", () => {
      const exported = exportAllData();
      expect(exported).toHaveProperty("races");
      expect(exported).toHaveProperty("tasks");
      expect(exported).toHaveProperty("profiles");
      expect(exported).toHaveProperty("settings");
      expect(exported).toHaveProperty("exported_at");
      expect(Array.isArray(exported.races)).toBe(true);
      expect(Array.isArray(exported.tasks)).toBe(true);
      expect(Array.isArray(exported.profiles)).toBe(true);
      expect(typeof exported.exported_at).toBe("string");
    });

    it("importData() with valid payload updates storage and getRaces/getTasks reflect it", () => {
      const payload = {
        races: [makeRace({ id: "imp-1", name: "Imported Race" })],
        tasks: [makeTask({ id: "imp-t1", race_id: "imp-1", title: "Imported task" })],
        profiles: [makeProfile({ race_id: "imp-1" })],
        settings: { notifications_enabled: true },
        exported_at: new Date().toISOString(),
      };
      importData(payload);

      expect(getRaces()).toHaveLength(1);
      expect(getRace("imp-1")?.name).toBe("Imported Race");
      expect(getTasks()).toHaveLength(1);
      expect(getTasks()[0].title).toBe("Imported task");
      expect(getProfile("imp-1")).toBeDefined();
      expect(getSettings().notifications_enabled).toBe(true);
    });

    it("importData() with empty object does not throw and leaves storage unchanged or cleared", () => {
      saveRace(makeRace({ id: "before" }));
      expect(() => importData({} as ReturnType<typeof exportAllData>)).not.toThrow();
      // Current implementation only sets keys that are truthy; empty object sets nothing
      expect(getRaces()).toHaveLength(1);
    });

    it("importData() with partial payload (missing fields) does not throw", () => {
      saveRace(makeRace({ id: "before" }));
      expect(() =>
        importData({
          races: [],
          // tasks, profiles, settings omitted
        } as ReturnType<typeof exportAllData>)
      ).not.toThrow();
      expect(getRaces()).toEqual([]);
    });
  });
});
