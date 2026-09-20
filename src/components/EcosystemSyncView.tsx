import React, { useState } from 'react';
import { CalendarEvent, UserProfile } from '../types';
import { Calendar, Bell, Clock, Plus, Check, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

interface EcosystemSyncViewProps {
  events: CalendarEvent[];
  userProfile: UserProfile;
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onTriggerEventReminder: (event: CalendarEvent) => void;
  onToggleCalendarSync: () => void;
  onToggleAlarmSync: () => void;
}

export const EcosystemSyncView: React.FC<EcosystemSyncViewProps> = ({
  events,
  userProfile,
  onAddEvent,
  onTriggerEventReminder,
  onToggleCalendarSync,
  onToggleAlarmSync,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('02:00 PM');
  const [endTime, setEndTime] = useState('03:30 PM');
  const [category, setCategory] = useState<CalendarEvent['category']>('exam');
  const [location, setLocation] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddEvent({
      title: title.trim(),
      startTime,
      endTime,
      category,
      syncedFrom: 'google_calendar',
      location: location.trim() || undefined,
    });
    setTitle('');
    setLocation('');
    setIsAdding(false);
  };

  return (
    <div className="w-full glass-card rounded-3xl p-5 sm:p-7 shadow-xl border border-white/70 dark:border-white/10 space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <span>Ecosystem & Schedule Sync</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {userProfile.partnerName} syncs with your Google Calendar & Alarms to send context-aware proactive reminders.
          </p>
        </div>

        <button
          id="sync-add-event-toggle-btn"
          onClick={() => setIsAdding(!isAdding)}
          className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Synced Event</span>
        </button>
      </div>

      {/* Sync Services Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Google Calendar Card */}
        <div className="p-4 rounded-2xl bg-white/60 dark:bg-zinc-800/50 border border-white/80 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Google Calendar</h4>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Syncs tests, assignments & meetings
              </p>
            </div>
          </div>

          <button
            id="toggle-google-cal-btn"
            onClick={onToggleCalendarSync}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              userProfile.calendarSynced
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-zinc-100 text-zinc-500 border-zinc-200'
            }`}
          >
            {userProfile.calendarSynced ? 'Synced 🟢' : 'Enable Sync'}
          </button>
        </div>

        {/* Native Alarms Card */}
        <div className="p-4 rounded-2xl bg-white/60 dark:bg-zinc-800/50 border border-white/80 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Phone Alarms & Wakeup</h4>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Wakes you up & enforces sleep schedule
              </p>
            </div>
          </div>

          <button
            id="toggle-phone-alarms-btn"
            onClick={onToggleAlarmSync}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              userProfile.alarmsSynced
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-zinc-100 text-zinc-500 border-zinc-200'
            }`}
          >
            {userProfile.alarmsSynced ? 'Synced 🟢' : 'Enable Sync'}
          </button>
        </div>
      </div>

      {/* Add Synced Event Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="p-4 rounded-2xl bg-white/80 dark:bg-zinc-800/90 border border-rose-200 shadow-md animate-fade-in">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3">Add Event to Synced Schedule</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Event Title</label>
              <input
                id="event-title-input"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Physics Semester Exam"
                className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 text-xs bg-white dark:bg-zinc-900"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Category</label>
              <select
                id="event-category-select"
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 text-xs bg-white dark:bg-zinc-900"
              >
                <option value="exam">Exam / Test 📝</option>
                <option value="meeting">Meeting / Sync 💼</option>
                <option value="gym">Gym / Workout 🏋️</option>
                <option value="personal">Personal / Routine ⏰</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Time Slot</label>
              <div className="flex gap-1.5">
                <input
                  id="event-start-time-input"
                  type="text"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-1/2 px-3 py-1.5 rounded-xl border border-zinc-200 text-xs bg-white dark:bg-zinc-900"
                />
                <input
                  id="event-end-time-input"
                  type="text"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-1/2 px-3 py-1.5 rounded-xl border border-zinc-200 text-xs bg-white dark:bg-zinc-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Location / Link</label>
              <input
                id="event-location-input"
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Hall 4 or Zoom"
                className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 text-xs bg-white dark:bg-zinc-900"
              />
            </div>
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-xl text-xs text-zinc-600 hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              id="submit-synced-event-btn"
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 shadow-sm"
            >
              Save & Alert {userProfile.partnerName}
            </button>
          </div>
        </form>
      )}

      {/* Events List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Today's Active Schedule & Companion Alerts
        </h3>

        {events.map(event => (
          <div
            key={event.id}
            id={`event-item-${event.id}`}
            className="p-4 rounded-2xl bg-white/60 dark:bg-zinc-800/40 border border-white/80 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 hover:border-rose-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold text-xs">
                {event.category === 'exam' ? '📝' : event.category === 'meeting' ? '💼' : '⏰'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {event.title}
                  </h4>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-zinc-100 text-zinc-600 font-medium">
                    {event.syncedFrom === 'google_calendar' ? 'Google Cal' : 'Device Alarm'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
                  <span>{event.startTime} - {event.endTime}</span>
                  {event.location && <span>• {event.location}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id={`trigger-reminder-btn-${event.id}`}
                onClick={() => onTriggerEventReminder(event)}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium transition-all flex items-center gap-1.5"
                title="Simulate Lexi's proactive reminder for this event"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Simulate Proactive Nudge</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
