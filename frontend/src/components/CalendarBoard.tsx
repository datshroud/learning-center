import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { usePreferences } from '../contexts/PreferencesContext';
import { dayLabel } from '../lib/api';
import type { Schedule } from '../types/domain';

type CalendarSchedule = Schedule & {
  classRoom?: Schedule['classRoom'] & {
    name?: string;
  };
};

const days = [1, 2, 3, 4, 5, 6, 0];
const timeSlots = ['07:00', '09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00'];

const palette = [
  'border-sky-200 bg-sky-50 text-sky-900',
  'border-emerald-200 bg-emerald-50 text-emerald-900',
  'border-amber-200 bg-amber-50 text-amber-900',
  'border-violet-200 bg-violet-50 text-violet-900',
  'border-rose-200 bg-rose-50 text-rose-900',
  'border-cyan-200 bg-cyan-50 text-cyan-900'
];

function toMinutes(time: string) {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

function slotRange(slot: string) {
  const start = toMinutes(slot);
  return {
    start,
    end: start + 120
  };
}

function belongsToSlot(schedule: CalendarSchedule, slot: string) {
  const range = slotRange(slot);
  const start = toMinutes(schedule.startTime);
  const end = toMinutes(schedule.endTime);
  return start < range.end && range.start < end;
}

export function CalendarBoard({
  schedules,
  title = 'Lịch học tuần'
}: {
  schedules: CalendarSchedule[];
  title?: string;
}) {
  const { t } = usePreferences();

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-sky-700" />
          <h2 className="text-base font-semibold text-slate-950">{t(title)}</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="h-2 w-2 rounded-full bg-sky-600" />
          {t('Tương tự Google Calendar, chia theo thứ và khung giờ')}
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[980px]">
          <div className="grid grid-cols-[90px_repeat(7,minmax(120px,1fr))] border-b border-slate-200 bg-slate-50">
            <div className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">{t('Giờ')}</div>
            {days.map((day) => (
              <div key={day} className="border-l border-slate-200 px-3 py-3 text-sm font-semibold text-slate-800">
                {t(dayLabel(day))}
              </div>
            ))}
          </div>
          {timeSlots.map((slot) => (
            <div key={slot} className="grid min-h-28 grid-cols-[90px_repeat(7,minmax(120px,1fr))] border-b border-slate-100 last:border-b-0">
              <div className="bg-slate-50 px-3 py-3 text-xs font-medium text-slate-500">{slot}</div>
              {days.map((day, dayIndex) => {
                const items = schedules.filter((schedule) => schedule.dayOfWeek === day && belongsToSlot(schedule, slot));
                return (
                  <div key={`${slot}-${day}`} className="border-l border-slate-100 p-2">
                    <div className="grid gap-2">
                      {items.map((schedule) => (
                        <div
                          key={`${schedule.id}-${slot}`}
                          className={`rounded-md border px-2.5 py-2 text-xs shadow-sm ${palette[dayIndex % palette.length]}`}
                        >
                          <p className="line-clamp-2 font-semibold">{schedule.classRoom?.name ?? t('Lớp học')}</p>
                          <p className="mt-1 flex items-center gap-1 text-[11px] opacity-80">
                            <Clock className="h-3 w-3" />
                            {schedule.startTime} - {schedule.endTime}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-[11px] opacity-80">
                            <MapPin className="h-3 w-3" />
                            {schedule.room?.name ?? t('Chưa có phòng')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
