import React, { useState } from 'react';
import { CalendarEvent, UserProfile } from '../types';
import { Calendar, Bell, Plus } from 'lucide-react';

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
    <div className="w-full glass rounded-[20px] p-5 sm:p-6 shadow-[var(--shadow-glass)] border border-[var(--border)] space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <span>Ecosystem & Schedule Sync</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--success-green)] animate-ping" />
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {userProfile.partnerName} syncs with your Google Calendar & Alarms to send context-aware proactive reminders.
          </p>
        </div>

        <button
          id="sync-add-event-toggle-btn"
          onClick={() => setIsAdding(!isAdding)}
          className="btn-primary-purple px-3.5 py-2 rounded-[12px] text-xs font-semibold flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Synced Event</span>
        </button>
      </div>

      {/* Sync Services Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Google Calendar Card */}
        <div className="p-4 rounded-[16px] glass border border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[var(--light-purple-surface)] text-[var(--primary-purple)] flex items-center justify-center border border-[var(--border)]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Google Calendar</h4>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--success-green)]/15 text-[var(--success-green)] font-semibold">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Syncs tests, assignments & meetings
              </p>
            </div>
          </div>

          <button
            id="toggle-google-cal-btn"
            onClick={onToggleCalendarSync}
            className={`px-3 py-1.5 rounded-[12px] text-xs font-semibold border transition-all ${
              userProfile.calendarSynced
                ? 'bg-[var(--success-green)]/15 text-[var(--success-green)] border-[var(--success-green)]/30'
                : 'glass-button text-[var(--text-muted)] border-[var(--border)]'
            }`}
          >
            {userProfile.calendarSynced ? 'Synced 🟢' : 'Enable Sync'}
          </button>
        </div>

        {/* Native Alarms Card */}
        <div className="p-4 rounded-[16px] glass border border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[var(--light-purple-surface)] text-amber-500 flex items-center justify-center border border-[var(--border)]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Phone Alarms & Wakeup</h4>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--success-green)]/15 text-[var(--success-green)] font-semibold">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Wakes you up & enforces sleep schedule
              </p>
            </div>
          </div>

          <button
            id="toggle-phone-alarms-btn"
            onClick={onToggleAlarmSync}
            className={`px-3 py-1.5 rounded-[12px] text-xs font-semibold border transition-all ${
              userProfile.alarmsSynced
                ? 'bg-[var(--success-green)]/15 text-[var(--success-green)] border-[var(--success-green)]/30'
                : 'glass-button text-[var(--text-muted)] border-[var(--border)]'
            }`}
          >
            {userProfile.alarmsSynced ? 'Synced 🟢' : 'Enable Sync'}
          </button>
        </div>
      </div>

      {/* Add Synced Event Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="p-4 rounded-[16px] glass-strong border border-[var(--primary-purple)]/40 shadow-md animate-fade-in space-y-3">
          <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Add Event to Synced Schedule</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Event Title</label>
              <input
                id="event-title-input"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Physics Semester Exam"
                className="w-full px-3 py-2 rounded-[12px] glass-input text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Category</label>
              <select
                id="event-category-select"
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-[12px] glass-input text-xs"
              >
                <option value="exam">Exam / Test 📝</option>
                <option value="meeting">Meeting / Sync 💼</option>
                <option value="gym">Gym / Workout 🏋️</option>
                <option value="personal">Personal / Routine ⏰</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Time Slot</label>
              <div className="flex gap-1.5">
                <input
                  id="event-start-time-input"
                  type="text"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-1/2 px-2.5 py-2 rounded-[12px] glass-input text-xs"
                />
                <input
                  id="event-end-time-input"
                  type="text"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-1/2 px-2.5 py-2 rounded-[12px] glass-input text-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Location / Link</label>
              <input
                id="event-location-input"
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Hall 4 or Zoom"
                className="w-full px-3 py-2 rounded-[12px] glass-input text-xs"
              />
            </div>
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-[12px] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Cancel
            </button>
            <button
              id="submit-synced-event-btn"
              type="submit"
              className="btn-primary-purple px-4 py-1.5 rounded-[12px] text-xs font-semibold"
            >
              Save & Alert {userProfile.partnerName}
            </button>
          </div>
        </form>
      )}

      {/* Events List */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Today's Active Schedule & Companion Alerts
        </h3>

        {events.map((event, index) => (
          <div
            key={event.id ? `${event.id}-${index}` : `event-${index}`}
            id={`event-item-${event.id}`}
            className="p-3.5 sm:p-4 rounded-[16px] glass border border-[var(--border)] flex flex-wrap items-center justify-between gap-3 hover:border-[var(--primary-purple)]/40 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-[var(--light-purple-surface)] text-[var(--primary-purple)] flex items-center justify-center font-bold text-xs border border-[var(--border)]">
                {event.category === 'exam' ? '📝' : event.category === 'meeting' ? '💼' : '⏰'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                    {event.title}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--light-purple-surface)] text-[var(--primary-purple)] font-medium border border-[var(--border)]">
                    {event.syncedFrom === 'google_calendar' ? 'Google Cal' : 'Device Alarm'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--text-secondary)]">
                  <span>{event.startTime} - {event.endTime}</span>
                  {event.location && <span>• {event.location}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id={`trigger-reminder-btn-${event.id}`}
                onClick={() => onTriggerEventReminder(event)}
                className="glass-button px-3 py-1.5 rounded-[12px] text-[var(--primary-purple)] border border-[var(--border)] text-xs font-medium flex items-center gap-1.5"
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
