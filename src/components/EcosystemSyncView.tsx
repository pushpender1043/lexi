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
    <div className="w-full glass rounded-[24px] p-5 sm:p-6 shadow-[var(--shadow-glass)] border border-white/60 dark:border-white/15 space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-[#14121C] dark:text-[#F8F7FC] flex items-center gap-2">
            <span>Ecosystem &amp; Schedule Sync</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#4CB782] shadow-[0_0_10px_rgba(76,183,130,0.85)]" />
          </h2>
          <p className="text-xs text-[#534E68] dark:text-[#C5BED9] mt-0.5">
            {userProfile.partnerName} syncs with your Google Calendar &amp; Alarms to send context-aware proactive reminders.
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
        <div className="p-4 rounded-[18px] bg-white/65 dark:bg-[#191F3C]/58 border border-white/60 dark:border-white/[0.14] shadow-[0_8px_24px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#F3EBFF]/80 dark:bg-white/[0.08] text-[#7C3AED] dark:text-[#C4B5FD] flex items-center justify-center border border-white/60 dark:border-white/[0.14]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-bold text-[#14121C] dark:text-[#F8F7FC]">Google Calendar</h4>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-semibold border border-emerald-400/20">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-[#534E68] dark:text-[#C5BED9]">
                Syncs tests, assignments &amp; meetings
              </p>
            </div>
          </div>

          <button
            id="toggle-google-cal-btn"
            onClick={onToggleCalendarSync}
            className={`px-3 py-1.5 rounded-[12px] text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
              userProfile.calendarSynced
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-400/30 shadow-[0_0_14px_rgba(76,183,130,0.16)]'
                : 'glass-button text-[#7C7692] dark:text-[#C5BED9] border-white/60 dark:border-white/[0.14]'
            }`}
          >
            {userProfile.calendarSynced ? 'Synced 🟢' : 'Enable Sync'}
          </button>
        </div>

        {/* Native Alarms Card */}
        <div className="p-4 rounded-[18px] bg-white/65 dark:bg-[#191F3C]/58 border border-white/60 dark:border-white/[0.14] shadow-[0_8px_24px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#F3EBFF]/80 dark:bg-white/[0.08] text-amber-500 dark:text-amber-300 flex items-center justify-center border border-white/60 dark:border-white/[0.14]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-bold text-[#14121C] dark:text-[#F8F7FC]">Phone Alarms &amp; Wakeup</h4>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-semibold border border-emerald-400/20">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-[#534E68] dark:text-[#C5BED9]">
                Wakes you up &amp; enforces sleep schedule
              </p>
            </div>
          </div>

          <button
            id="toggle-phone-alarms-btn"
            onClick={onToggleAlarmSync}
            className={`px-3 py-1.5 rounded-[12px] text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
              userProfile.alarmsSynced
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-400/30 shadow-[0_0_14px_rgba(76,183,130,0.16)]'
                : 'glass-button text-[#7C7692] dark:text-[#C5BED9] border-white/60 dark:border-white/[0.14]'
            }`}
          >
            {userProfile.alarmsSynced ? 'Synced 🟢' : 'Enable Sync'}
          </button>
        </div>
      </div>

      {/* Add Synced Event Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="p-4 rounded-[18px] glass-strong border border-[#896ABD]/40 dark:border-[#A855F7]/35 shadow-md animate-fade-in space-y-3">
          <h4 className="text-xs sm:text-sm font-bold text-[#14121C] dark:text-[#F8F7FC]">Add Event to Synced Schedule</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#534E68] dark:text-[#C5BED9] mb-1">Event Title</label>
              <input
                id="event-title-input"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Physics Semester Exam"
                className="w-full px-3 py-2 rounded-[12px] glass-input text-xs text-[#14121C] dark:text-[#F8F7FC] placeholder:text-[#7C7692] dark:placeholder:text-[#938CA8]"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#534E68] dark:text-[#C5BED9] mb-1">Category</label>
              <select
                id="event-category-select"
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-[12px] glass-input text-xs text-[#14121C] dark:text-[#F8F7FC]"
              >
                <option value="exam">Exam / Test 📝</option>
                <option value="meeting">Meeting / Sync 💼</option>
                <option value="gym">Gym / Workout 🏋️</option>
                <option value="personal">Personal / Routine ⏰</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#534E68] dark:text-[#C5BED9] mb-1">Time Slot</label>
              <div className="flex gap-1.5">
                <input
                  id="event-start-time-input"
                  type="text"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-1/2 px-2.5 py-2 rounded-[12px] glass-input text-xs text-[#14121C] dark:text-[#F8F7FC]"
                />
                <input
                  id="event-end-time-input"
                  type="text"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-1/2 px-2.5 py-2 rounded-[12px] glass-input text-xs text-[#14121C] dark:text-[#F8F7FC]"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#534E68] dark:text-[#C5BED9] mb-1">Location / Link</label>
              <input
                id="event-location-input"
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Hall 4 or Zoom"
                className="w-full px-3 py-2 rounded-[12px] glass-input text-xs text-[#14121C] dark:text-[#F8F7FC] placeholder:text-[#7C7692] dark:placeholder:text-[#938CA8]"
              />
            </div>
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="glass-button px-3 py-1.5 rounded-[12px] text-xs font-semibold text-[#534E68] dark:text-[#C5BED9] hover:text-[#14121C] dark:hover:text-[#F8F7FC] cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-synced-event-btn"
              type="submit"
              className="btn-primary-purple px-4 py-1.5 rounded-[12px] text-xs font-semibold"
            >
              Save &amp; Alert {userProfile.partnerName}
            </button>
          </div>
        </form>
      )}

      {/* Events List */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#7C7692] dark:text-[#938CA8]">
          Today&apos;s Active Schedule &amp; Companion Alerts
        </h3>

        {events.map((event, index) => (
          <div
            key={event.id ? `${event.id}-${index}` : `event-${index}`}
            id={`event-item-${event.id}`}
            className="p-3.5 sm:p-4 rounded-[18px] bg-white/65 dark:bg-[#191F3C]/58 border border-white/60 dark:border-white/[0.14] flex flex-wrap items-center justify-between gap-3 hover:border-[#896ABD]/45 dark:hover:border-[#A855F7]/45 shadow-[0_8px_24px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-[#F3EBFF]/80 dark:bg-white/[0.08] text-[#7C3AED] dark:text-[#C4B5FD] flex items-center justify-center font-bold text-xs border border-white/60 dark:border-white/[0.14]">
                {event.category === 'exam' ? '📝' : event.category === 'meeting' ? '💼' : '⏰'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-[#14121C] dark:text-[#F8F7FC]">
                    {event.title}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F3EBFF]/80 dark:bg-[#A855F7]/18 text-[#6D28D9] dark:text-[#D8B4FE] font-medium border border-[#896ABD]/20 dark:border-[#A855F7]/25">
                    {event.syncedFrom === 'google_calendar' ? 'Google Cal' : 'Device Alarm'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-[#534E68] dark:text-[#C5BED9]">
                  <span>{event.startTime} - {event.endTime}</span>
                  {event.location && <span>• {event.location}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id={`trigger-reminder-btn-${event.id}`}
                onClick={() => onTriggerEventReminder(event)}
                className="glass-button px-3 py-1.5 rounded-[12px] text-[#7C3AED] dark:text-[#E9DDFB] border border-white/60 dark:border-white/[0.16] text-xs font-medium flex items-center gap-1.5 cursor-pointer"
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
