import { useLiveQuery } from 'dexie-react-hooks';
import { MoodCalendarDB, MoodEntry } from '../lib/db';

// Hook to get all mood entries with live updates
export function useMoodEntries() {
  return useLiveQuery(() => MoodCalendarDB.getAllEntries(), []);
}

// Hook to get mood entries for a specific month with live updates
export function useMoodEntriesForMonth(year: number, month: number) {
  return useLiveQuery(
    () => MoodCalendarDB.getEntriesForMonth(year, month),
    [year, month]
  );
}

// Hook to get a specific entry by date with live updates
export function useMoodEntryByDate(date: string) {
  return useLiveQuery(
    () => MoodCalendarDB.getEntryByDate(date),
    [date]
  );
}

// Hook to get statistics with live updates
export function useMoodStats() {
  return useLiveQuery(() => MoodCalendarDB.getStats(), []);
}

// Hook to search entries with live updates
export function useSearchMoodEntries(searchTerm: string) {
  return useLiveQuery(
    () => searchTerm ? MoodCalendarDB.searchEntries(searchTerm) : [],
    [searchTerm]
  );
}

// Hook to get entries in a date range with live updates
export function useMoodEntriesInRange(startDate: string, endDate: string) {
  return useLiveQuery(
    () => MoodCalendarDB.getEntriesInRange(startDate, endDate),
    [startDate, endDate]
  );
}
