/**
 * Deterministic timezone-aware streak and week strip calculations.
 * Ensures future days can never be marked "Done", handles midnight rollover,
 * and tracks real streaks from daily completion logs.
 */

export interface HabitLogEntry {
  date: string; // YYYY-MM-DD
  completedHabitIds: string[];
  totalHabitsCount: number;
  completedCrucialCount: number;
  totalCrucialCount: number;
  completedAllCrucial: boolean;
  updatedAt: string;
}

export interface WeekDayStatus {
  label: string; // 'M' | 'T' | 'W' | 'T' | 'F' | 'S' | 'S'
  fullLabel: string;
  date: string; // YYYY-MM-DD
  dayNumber: number;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  completed: boolean;
}

/**
 * Returns current date string in YYYY-MM-DD for a specified or browser timezone.
 */
export function getTodayDateString(timeZone?: string): string {
  try {
    const tz = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date()); // Outputs YYYY-MM-DD in en-CA
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

/**
 * Adds or subtracts days from a YYYY-MM-DD string.
 */
export function shiftDateString(dateStr: string, dayOffset: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + dayOffset));
  return dt.toISOString().slice(0, 10);
}

/**
 * Returns the 7 days of the current week (Monday to Sunday) containing targetDateStr.
 */
export function getWeekDaysForDate(
  todayDateStr: string,
  habitLogs: Record<string, HabitLogEntry> = {}
): WeekDayStatus[] {
  const [y, m, d] = todayDateStr.split('-').map(Number);
  const currentDt = new Date(Date.UTC(y, m - 1, d));
  
  // Day of week: 0 is Sun, 1 is Mon, ..., 6 is Sat.
  // We want Monday (1) as start of week.
  const dayOfWeek = currentDt.getUTCDay();
  const daysFromMonday = (dayOfWeek + 6) % 7; // Mon -> 0, Tue -> 1, ..., Sun -> 6

  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const fullLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const week: WeekDayStatus[] = [];

  for (let i = 0; i < 7; i++) {
    const offset = i - daysFromMonday;
    const dateStr = shiftDateString(todayDateStr, offset);
    const isToday = dateStr === todayDateStr;
    const isFuture = dateStr > todayDateStr;
    const isPast = dateStr < todayDateStr;

    const log = habitLogs[dateStr];
    // A past or today date is completed if logged as completedAllCrucial or completedHabitIds.length >= 1
    const completed =
      !isFuture &&
      Boolean(
        log &&
          (log.completedAllCrucial ||
            (log.completedHabitIds && log.completedHabitIds.length > 0 && log.totalHabitsCount > 0))
      );

    const [,, dayNum] = dateStr.split('-').map(Number);

    week.push({
      label: labels[i],
      fullLabel: fullLabels[i],
      date: dateStr,
      dayNumber: dayNum,
      isToday,
      isPast,
      isFuture,
      completed,
    });
  }

  return week;
}

/**
 * Computes consecutive active streak days stepping backwards from today.
 * Rules:
 * - If today is marked completed: streak = 1 + consecutive previous completed days.
 * - If today is in progress: streak = consecutive previous completed days ending yesterday.
 * - If yesterday was not completed and today is not completed: streak = 0.
 * - Future days are never counted.
 */
export function calculateStreak(
  todayDateStr: string,
  habitLogs: Record<string, HabitLogEntry> = {}
): { currentStreak: number; bestStreak: number } {
  const isDayCompleted = (dateStr: string): boolean => {
    if (dateStr > todayDateStr) return false;
    const log = habitLogs[dateStr];
    if (!log) return false;
    return Boolean(
      log.completedAllCrucial ||
        (log.completedHabitIds && log.completedHabitIds.length > 0 && log.totalHabitsCount > 0)
    );
  };

  let currentStreak = 0;
  const todayDone = isDayCompleted(todayDateStr);

  if (todayDone) {
    currentStreak = 1;
    let step = 1;
    while (true) {
      const prevDate = shiftDateString(todayDateStr, -step);
      if (isDayCompleted(prevDate)) {
        currentStreak++;
        step++;
      } else {
        break;
      }
    }
  } else {
    // Today in progress: check yesterday
    const yesterdayDate = shiftDateString(todayDateStr, -1);
    if (isDayCompleted(yesterdayDate)) {
      currentStreak = 1;
      let step = 2;
      while (true) {
        const prevDate = shiftDateString(todayDateStr, -step);
        if (isDayCompleted(prevDate)) {
          currentStreak++;
          step++;
        } else {
          break;
        }
      }
    } else {
      currentStreak = 0;
    }
  }

  // Calculate best streak across all logged dates
  const allLoggedDates = Object.keys(habitLogs).sort();
  let maxConsecutive = 0;
  let running = 0;
  let lastDate: string | null = null;

  for (const date of allLoggedDates) {
    if (isDayCompleted(date)) {
      if (lastDate && shiftDateString(lastDate, 1) === date) {
        running++;
      } else {
        running = 1;
      }
      lastDate = date;
      if (running > maxConsecutive) {
        maxConsecutive = running;
      }
    } else {
      running = 0;
      lastDate = null;
    }
  }

  const bestStreak = Math.max(currentStreak, maxConsecutive);

  return { currentStreak, bestStreak };
}
