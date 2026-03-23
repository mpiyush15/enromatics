export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "completed" | "cancelled";

export interface DailyTask {
  _id?: string;
  id?: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt?: string;
  completedAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
}

const DAILY_TASKS_CACHE_KEY = "enromatics:daily-tasks-cache:v1";
const DAILY_TASKS_UPDATED_EVENT = "enromatics:daily-tasks:updated";

const isBrowser = () => typeof window !== "undefined";

const emitTasksUpdated = () => {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(DAILY_TASKS_UPDATED_EVENT));
};

export const getLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ===== CACHE HELPERS (Local Storage) =====
const readTasksCache = (): DailyTask[] => {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(DAILY_TASKS_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeTasksCache = (tasks: DailyTask[]) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(DAILY_TASKS_CACHE_KEY, JSON.stringify(tasks));
  emitTasksUpdated();
};

// ===== API CALLS =====
const API_BASE = "http://localhost:5050/api/daily-tasks";

export const fetchTasksFromServer = async (): Promise<DailyTask[]> => {
  try {
    const res = await fetch(API_BASE, { credentials: "include" });
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ Failed to fetch tasks. Status: ${res.status}`, errorText);
      throw new Error(`Failed to fetch tasks: ${res.status}`);
    }
    const data = await res.json();
    const tasks = data.tasks || [];
    writeTasksCache(tasks);
    return tasks;
  } catch (err) {
    console.error("❌ Error fetching tasks from server:", err);
    return readTasksCache();
  }
};

export const saveTaskToServer = async (task: DailyTask): Promise<DailyTask | null> => {
  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: task.title,
        date: task.date,
        time: task.time,
        priority: task.priority,
        description: task.description,
      }),
    });
    if (!res.ok) throw new Error("Failed to save task");
    const data = await res.json();
    return data.task;
  } catch (err) {
    console.error("❌ Error saving task:", err);
    return null;
  }
};

export const updateTaskOnServer = async (
  taskId: string,
  updates: Partial<DailyTask>
): Promise<DailyTask | null> => {
  try {
    const res = await fetch(`${API_BASE}/${taskId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update task");
    const data = await res.json();
    return data.task;
  } catch (err) {
    console.error("❌ Error updating task:", err);
    return null;
  }
};

export const deleteTaskFromServer = async (taskId: string): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE}/${taskId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to delete task");
    return true;
  } catch (err) {
    console.error("❌ Error deleting task:", err);
    return false;
  }
};

// ===== PUBLIC API =====
export const readDailyTasks = (): DailyTask[] => {
  return readTasksCache();
};

export const getTasksByDate = (dateKey: string) => {
  return readDailyTasks()
    .filter((task) => task.date === dateKey)
    .sort((a, b) => {
      if (a.status !== b.status) {
        const statusOrder = { pending: 0, completed: 1, cancelled: 2 };
        return (statusOrder[a.status as TaskStatus] || 0) - (statusOrder[b.status as TaskStatus] || 0);
      }

      if ((a.time || "") !== (b.time || "")) {
        return (a.time || "99:99").localeCompare(b.time || "99:99");
      }

      return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime();
    });
};

export const addDailyTask = async (input: {
  title: string;
  date: string;
  time?: string;
  description?: string;
  priority?: TaskPriority;
}) => {
  const newTask: DailyTask = {
    title: input.title.trim(),
    date: input.date,
    time: input.time,
    description: input.description?.trim(),
    priority: input.priority || "medium",
    status: "pending",
  };

  // Save to server
  const savedTask = await saveTaskToServer(newTask);
  if (savedTask) {
    // Update cache
    const tasks = readTasksCache();
    writeTasksCache([savedTask, ...tasks]);
    return savedTask;
  }

  return null;
};

export const updateTaskCompletion = async (taskId: string, status: TaskStatus) => {
  const serverTask = await updateTaskOnServer(taskId, { status });
  if (serverTask) {
    // Update cache
    const tasks = readTasksCache();
    const updated = tasks.map((t) =>
      (t._id === taskId || t.id === taskId) ? serverTask : t
    );
    writeTasksCache(updated);
    return serverTask;
  }
  return null;
};

export const deleteTask = async (taskId: string) => {
  const success = await deleteTaskFromServer(taskId);
  if (success) {
    // Update cache
    const tasks = readTasksCache();
    const updated = tasks.filter((t) => t._id !== taskId && t.id !== taskId);
    writeTasksCache(updated);
  }
  return success;
};

export const dailyTasksUpdatedEventName = DAILY_TASKS_UPDATED_EVENT;
