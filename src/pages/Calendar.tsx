import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import c from "./Calendar.module.scss"

type Booking = {
  id: string;
  date: string;
  time: string;
  status: string;
  service_title: string;
  duration_min: number;
  name: string;
};

const SLOT_MINUTES = 15;
const DAY_START = 8 * 60;
const DAY_END = 20 * 60;
const DAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (base: Date, days: number) => {
  const next = new Date(base);
  next.setDate(base.getDate() + days);
  return next;
};

const startOfWeek = (date: Date) => {
  const base = new Date(date);
  const weekday = (base.getDay() + 6) % 7;
  base.setDate(base.getDate() - weekday);
  base.setHours(0, 0, 0, 0);
  return base;
};

const minutesToTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${`${hours}`.padStart(2, "0")}:${`${mins}`.padStart(2, "0")}`;
};

const timeToMinutes = (value: string) => {
  const [hours, mins] = value.split(":");
  return Number(hours) * 60 + Number(mins);
};

export function Calendar() {
  const navigate = useNavigate();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);

  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);
  const slots = useMemo(() => {
    const count = (DAY_END - DAY_START) / SLOT_MINUTES;
    return Array.from({ length: count }, (_, index) => minutesToTime(DAY_START + index * SLOT_MINUTES));
  }, []);

  const weekLabel = `${days[0].getDate().toString().padStart(2, "0")}.${(days[0].getMonth() + 1)
    .toString()
    .padStart(2, "0")} - ${days[6].getDate().toString().padStart(2, "0")}.${(days[6].getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;

  useEffect(() => {
    setError(null);
    Promise.all(
      days.map((day) => apiRequest<Booking[]>(`/bookings?date=${formatDate(day)}`))
    )
      .then((data) => setBookings(data.flat()))
      .catch((err) => setError(err instanceof Error ? err.message : "Buchungen konnten nicht geladen werden."));
  }, [weekStart]);

  const busySlots = useMemo(() => {
    const map = new Set<string>();
    bookings
      .filter((booking) => booking.status !== "cancelled")
      .forEach((booking) => {
        const start = timeToMinutes(String(booking.time).slice(0, 5));
        const duration = booking.duration_min || SLOT_MINUTES;
        const end = start + duration;
        for (let time = start; time < end; time += SLOT_MINUTES) {
          if (time < DAY_START || time >= DAY_END) continue;
          const key = `${booking.date}-${minutesToTime(time)}`;
          map.add(key);
        }
      });
    return map;
  }, [bookings]);

  const handleSlotClick = (date: Date, time: string) => {
    navigate(`/bookings/new?date=${formatDate(date)}&time=${time}`);
  };

  const isPastSlot = (date: Date, time: string) => {
    const slot = new Date(`${formatDate(date)}T${time}`);
    return slot.getTime() < Date.now();
  };

  const bookingBlocks = useMemo(() => {
    return bookings
      .filter((booking) => booking.status !== "cancelled")
      .map((booking) => {
        const dayIndex = days.findIndex((day) => formatDate(day) === booking.date);
        if (dayIndex === -1) return null;
        const startMinutes = timeToMinutes(String(booking.time).slice(0, 5));
        const offset = Math.max(startMinutes - DAY_START, 0);
        const rowStart = Math.floor(offset / SLOT_MINUTES) + 1;
        const span = Math.max(Math.ceil((booking.duration_min || SLOT_MINUTES) / SLOT_MINUTES), 1);
        return (
          <div
            key={booking.id}
            className={`${c.calendar__booking} calendar__booking--${booking.status}`}
            style={{
              gridColumn: dayIndex + 2,
              gridRow: `${rowStart} / ${rowStart + span}`,
            }}
          >
            <strong>
              {String(booking.time).slice(0, 5)} · {booking.name}
            </strong>
            <span>{booking.service_title}</span>
          </div>
        );
      })
      .filter(Boolean);
  }, [bookings, days]);

  return (
    <div className={c.calendar__page}>
      <div className="calendar-toolbar">
        <button className="button button--ghost" onClick={() => setWeekStart(addDays(weekStart, -7))}>
          ◀
        </button>
        <div className="calendar-toolbar__label">
          <h1>Kalender</h1>
          <p>{weekLabel}</p>
        </div>
        <button className="button button--ghost" onClick={() => setWeekStart(addDays(weekStart, 7))}>
          ▶
        </button>
      </div>

      {error ? <p className="form__error">{error}</p> : null}

      <div className={c.calendar__weekdays}>
        <div />
        {days.map((day, index) => (
          <div key={formatDate(day)} className="calendar-weekdays__item">
            <span>{DAY_LABELS[index]}</span>
            <strong>{day.getDate().toString().padStart(2, "0")}</strong>
          </div>
        ))}
      </div>

      <div className="calendar-scroll">
        <div className="calendar-grid">
          {slots.map((time, index) => {
            const isHour = index % 4 === 0;
            return (
              <div key={time} className={`calendar-time ${isHour ? "calendar-time--hour" : ""}`} style={{ gridRow: index + 1 }}>
                {isHour ? time : ""}
              </div>
            );
          })}

          {days.map((day, dayIndex) =>
            slots.map((time, slotIndex) => {
              const key = `${formatDate(day)}-${time}`;
              const isBusy = busySlots.has(key);
              const isPast = isPastSlot(day, time);
              return (
                <button
                  key={key}
                  type="button"
                  className="calendar-slot"
                  style={{ gridColumn: dayIndex + 2, gridRow: slotIndex + 1 }}
                  disabled={isBusy || isPast}
                  onClick={() => handleSlotClick(day, time)}
                />
              );
            })
          )}

          {bookingBlocks}
        </div>
      </div>
    </div>
  );
}
