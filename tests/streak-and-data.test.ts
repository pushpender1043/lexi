import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getTodayDateString,
  shiftDateString,
  getWeekDaysForDate,
  calculateStreak,
  HabitLogEntry,
} from '../src/utils/streak';
import {
  DEFAULT_HABITS,
  DEFAULT_MESSAGES,
  DEFAULT_CALL_RECORDS,
  DEFAULT_CALENDAR_EVENTS,
  DEFAULT_MEMORIES,
  DEFAULT_USER_PROFILE,
} from '../src/data/defaults';

describe('Streak & Timezone-Aware Data Invariants', () => {
  it('DEFAULT datasets contain pure empty production baselines (no mock/demo values)', () => {
    assert.strictEqual(DEFAULT_HABITS.length, 0, 'DEFAULT_HABITS must be empty');
    assert.strictEqual(DEFAULT_MESSAGES.length, 0, 'DEFAULT_MESSAGES must be empty');
    assert.strictEqual(DEFAULT_CALL_RECORDS.length, 0, 'DEFAULT_CALL_RECORDS must be empty');
    assert.strictEqual(DEFAULT_CALENDAR_EVENTS.length, 0, 'DEFAULT_CALENDAR_EVENTS must be empty');
    assert.strictEqual(DEFAULT_MEMORIES.length, 0, 'DEFAULT_MEMORIES must be empty');
    assert.strictEqual(DEFAULT_USER_PROFILE.streakDays, 0, 'Default streak must start at 0');
    assert.strictEqual(DEFAULT_USER_PROFILE.bestStreak, 0, 'Default best streak must start at 0');
  });

  it('getTodayDateString produces valid YYYY-MM-DD format across standard timezones', () => {
    const defaultDate = getTodayDateString();
    assert.match(defaultDate, /^\d{4}-\d{2}-\d{2}$/);

    const istDate = getTodayDateString('Asia/Kolkata');
    assert.match(istDate, /^\d{4}-\d{2}-\d{2}$/);

    const utcDate = getTodayDateString('UTC');
    assert.match(utcDate, /^\d{4}-\d{2}-\d{2}$/);
  });

  it('shiftDateString shifts days accurately across month and leap day boundaries', () => {
    assert.strictEqual(shiftDateString('2026-03-01', -1), '2026-02-28');
    assert.strictEqual(shiftDateString('2024-03-01', -1), '2024-02-29'); // Leap year
    assert.strictEqual(shiftDateString('2026-12-31', 1), '2027-01-01');
  });

  it('getWeekDaysForDate generates exactly 7 days starting from Monday', () => {
    // 2026-10-28 is a Wednesday
    const week = getWeekDaysForDate('2026-10-28');
    assert.strictEqual(week.length, 7);
    assert.strictEqual(week[0].fullLabel, 'Mon');
    assert.strictEqual(week[0].date, '2026-10-26');
    assert.strictEqual(week[2].fullLabel, 'Wed');
    assert.strictEqual(week[2].isToday, true);
    assert.strictEqual(week[2].date, '2026-10-28');
    assert.strictEqual(week[6].fullLabel, 'Sun');
    assert.strictEqual(week[6].date, '2026-11-01');
  });

  it('getWeekDaysForDate ensures future days can NEVER be marked completed', () => {
    const today = '2026-10-28'; // Wednesday
    const thursdayDate = '2026-10-29';
    const fridayDate = '2026-10-30';

    // Even if an errant log exists for future dates, week strip forbids future completion
    const logs: Record<string, HabitLogEntry> = {
      '2026-10-26': {
        date: '2026-10-26',
        completedHabitIds: ['h1'],
        totalHabitsCount: 1,
        completedCrucialCount: 1,
        totalCrucialCount: 1,
        completedAllCrucial: true,
        updatedAt: '2026-10-26T12:00:00Z',
      },
      [fridayDate]: {
        date: fridayDate,
        completedHabitIds: ['h1'],
        totalHabitsCount: 1,
        completedCrucialCount: 1,
        totalCrucialCount: 1,
        completedAllCrucial: true,
        updatedAt: '2026-10-30T12:00:00Z',
      },
    };

    const week = getWeekDaysForDate(today, logs);
    const mon = week.find((d) => d.date === '2026-10-26');
    const wed = week.find((d) => d.date === today);
    const thu = week.find((d) => d.date === thursdayDate);
    const fri = week.find((d) => d.date === fridayDate);

    assert.strictEqual(mon?.completed, true, 'Monday past log must be marked completed');
    assert.strictEqual(wed?.isToday, true, 'Wednesday must be marked today');
    assert.strictEqual(thu?.isFuture, true, 'Thursday must be future');
    assert.strictEqual(thu?.completed, false, 'Thursday must NOT be completed');
    assert.strictEqual(fri?.isFuture, true, 'Friday must be future');
    assert.strictEqual(fri?.completed, false, 'Future Friday must NEVER be completed');
  });

  it('calculateStreak calculates real consecutive days stepping back from today', () => {
    const today = '2026-10-28';
    const yesterday = '2026-10-27';
    const twoDaysAgo = '2026-10-26';

    const logs: Record<string, HabitLogEntry> = {
      [twoDaysAgo]: {
        date: twoDaysAgo,
        completedHabitIds: ['h1'],
        totalHabitsCount: 1,
        completedCrucialCount: 1,
        totalCrucialCount: 1,
        completedAllCrucial: true,
        updatedAt: '2026-10-26T12:00:00Z',
      },
      [yesterday]: {
        date: yesterday,
        completedHabitIds: ['h1'],
        totalHabitsCount: 1,
        completedCrucialCount: 1,
        totalCrucialCount: 1,
        completedAllCrucial: true,
        updatedAt: '2026-10-27T12:00:00Z',
      },
    };

    // Case 1: Today not done yet, yesterday was done -> current streak is 2 (grace period during today)
    const res1 = calculateStreak(today, logs);
    assert.strictEqual(res1.currentStreak, 2);

    // Case 2: Today completed -> current streak is 3
    logs[today] = {
      date: today,
      completedHabitIds: ['h1'],
      totalHabitsCount: 1,
      completedCrucialCount: 1,
      totalCrucialCount: 1,
      completedAllCrucial: true,
      updatedAt: '2026-10-28T12:00:00Z',
    };
    const res2 = calculateStreak(today, logs);
    assert.strictEqual(res2.currentStreak, 3);
    assert.strictEqual(res2.bestStreak, 3);

    // Case 3: Gap day broke streak
    const brokenLogs: Record<string, HabitLogEntry> = {
      '2026-10-20': {
        date: '2026-10-20',
        completedHabitIds: ['h1'],
        totalHabitsCount: 1,
        completedCrucialCount: 1,
        totalCrucialCount: 1,
        completedAllCrucial: true,
        updatedAt: '2026-10-20T12:00:00Z',
      },
    };
    const res3 = calculateStreak(today, brokenLogs);
    assert.strictEqual(res3.currentStreak, 0);

    // Case 4: Month boundary streak calculation (Oct 31 -> Nov 1)
    const nov1 = '2026-11-01';
    const oct31 = '2026-10-31';
    const monthLogs: Record<string, HabitLogEntry> = {
      [oct31]: {
        date: oct31,
        completedHabitIds: ['h1'],
        totalHabitsCount: 1,
        completedCrucialCount: 1,
        totalCrucialCount: 1,
        completedAllCrucial: true,
        updatedAt: '2026-10-31T20:00:00Z',
      },
      [nov1]: {
        date: nov1,
        completedHabitIds: ['h1'],
        totalHabitsCount: 1,
        completedCrucialCount: 1,
        totalCrucialCount: 1,
        completedAllCrucial: true,
        updatedAt: '2026-11-01T09:00:00Z',
      },
    };
    const res4 = calculateStreak(nov1, monthLogs);
    assert.strictEqual(res4.currentStreak, 2, 'Consecutive streak across month boundary must equal 2');

    // Case 5: Year boundary streak calculation (Dec 31 -> Jan 1)
    const jan1 = '2027-01-01';
    const dec31 = '2026-12-31';
    const yearLogs: Record<string, HabitLogEntry> = {
      [dec31]: {
        date: dec31,
        completedHabitIds: ['h1'],
        totalHabitsCount: 1,
        completedCrucialCount: 1,
        totalCrucialCount: 1,
        completedAllCrucial: true,
        updatedAt: '2026-12-31T22:00:00Z',
      },
      [jan1]: {
        date: jan1,
        completedHabitIds: ['h1'],
        totalHabitsCount: 1,
        completedCrucialCount: 1,
        totalCrucialCount: 1,
        completedAllCrucial: true,
        updatedAt: '2027-01-01T10:00:00Z',
      },
    };
    const res5 = calculateStreak(jan1, yearLogs);
    assert.strictEqual(res5.currentStreak, 2, 'Consecutive streak across year boundary must equal 2');
  });
});
