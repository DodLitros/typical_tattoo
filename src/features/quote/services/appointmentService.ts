import { supabase } from "../../../lib/supabaseClient";

interface DaySchedule {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface BlockedPeriod {
  start_time: string | null;
  end_time: string | null;
  block_type: string;
}

interface BookedSlot {
  start_time: string | null;
  duration_minutes: number | null;
}

export interface AvailableSlot {
  date: string;
  time: string;
  end_time: string;
  available: boolean;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
}

function subtractPeriods(
  windowStart: number,
  windowEnd: number,
  periods: { start: number; end: number }[]
): { start: number; end: number }[] {
  let free = [{ start: windowStart, end: windowEnd }];
  for (const p of periods) {
    if (p.start >= p.end) continue;
    const next: { start: number; end: number }[] = [];
    for (const f of free) {
      if (p.end <= f.start || p.start >= f.end) {
        next.push(f);
      } else {
        if (p.start > f.start) next.push({ start: f.start, end: p.start });
        if (p.end < f.end) next.push({ start: p.end, end: f.end });
      }
    }
    free = next;
  }
  return free;
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function getAvailableSlots(quoteRequestId: string): Promise<AvailableSlot[]> {
  const today = toDateStr(new Date());

  const [
    { data: schedules },
    { data: blocks },
    { data: appointments },
    { data: quoteResponses },
  ] = await Promise.all([
    supabase.from("artist_schedule").select("day_of_week, start_time, end_time").eq("is_active", true),
    supabase.from("availability_block").select("block_date, start_time, end_time, block_type").gte("block_date", today),
    supabase.from("appointment").select("appointment_date, start_time, duration_minutes, status").neq("status", "cancelled").gte("appointment_date", today),
    supabase.from("quote_response").select("duration_minutes").eq("quote_request_id", quoteRequestId),
  ]);

  const daySchedules: Record<number, DaySchedule> = {};
  for (const s of schedules || []) {
    daySchedules[s.day_of_week] = s;
  }

  const durationMinutes = quoteResponses?.[0]?.duration_minutes ?? null;

  const blocksByDate: Record<string, BlockedPeriod[]> = {};
  for (const b of blocks || []) {
    if (!blocksByDate[b.block_date]) blocksByDate[b.block_date] = [];
    blocksByDate[b.block_date].push({
      start_time: b.start_time,
      end_time: b.end_time,
      block_type: b.block_type,
    });
  }

  const appointmentsByDate: Record<string, BookedSlot[]> = {};
  for (const a of appointments || []) {
    if (!appointmentsByDate[a.appointment_date]) appointmentsByDate[a.appointment_date] = [];
    appointmentsByDate[a.appointment_date].push({
      start_time: a.start_time,
      duration_minutes: a.duration_minutes,
    });
  }

  const slots: AvailableSlot[] = [];
  const maxDays = 60;

  for (let i = 0; i < maxDays; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = toDateStr(d);
    const dayOfWeek = d.getDay();
    const schedule = daySchedules[dayOfWeek];
    if (!schedule) continue;

    const dayBlocks = blocksByDate[dateStr] || [];
    if (dayBlocks.some((b) => b.block_type === "full_day")) continue;

    const windowStart = timeToMinutes(schedule.start_time);
    const windowEnd = timeToMinutes(schedule.end_time);

    const busyPeriods: { start: number; end: number }[] = [];

    for (const b of dayBlocks.filter((bl) => bl.block_type === "time_slot" || bl.block_type === "appointment")) {
      if (b.start_time && b.end_time) {
        busyPeriods.push({ start: timeToMinutes(b.start_time), end: timeToMinutes(b.end_time) });
      }
    }

    const dayApts = appointmentsByDate[dateStr] || [];
    for (const a of dayApts) {
      if (!a.start_time) continue;
      const aStart = timeToMinutes(a.start_time);
      const aEnd = a.duration_minutes ? aStart + a.duration_minutes : aStart + 60;
      busyPeriods.push({ start: aStart, end: aEnd });
    }

    busyPeriods.sort((a, b) => a.start - b.start);
    const freeWindows = subtractPeriods(windowStart, windowEnd, busyPeriods);

    const slotInterval = 30;
    for (const w of freeWindows) {
      let t = w.start;
      while (t + (durationMinutes ?? 30) <= w.end) {
        const slotEnd = t + (durationMinutes ?? 30);
        slots.push({
          date: dateStr,
          time: minutesToTime(t),
          end_time: minutesToTime(slotEnd),
          available: true,
        });
        t += slotInterval;
      }
    }
  }

  return slots;
}

export async function bookAppointment(
  quoteRequestId: string,
  date: string,
  time: string,
  durationMinutes?: number | null
) {
  const { data: quoteData, error: quoteError } = await supabase
    .from("quote_request")
    .select("client_id, description")
    .eq("id", quoteRequestId)
    .single();
  if (quoteError) throw quoteError;

  let resolvedDuration = durationMinutes;
  if (!resolvedDuration) {
    const { data: qr } = await supabase
      .from("quote_response")
      .select("duration_minutes")
      .eq("quote_request_id", quoteRequestId)
      .single();
    resolvedDuration = qr?.duration_minutes ?? 60;
  }

  const endTime = minutesToTime(timeToMinutes(time) + resolvedDuration);

  const { data: appointment, error: appointmentError } = await supabase
    .from("appointment")
    .insert({
      client_id: quoteData.client_id,
      quote_request_id: quoteRequestId,
      appointment_date: date,
      start_time: time,
      duration_minutes: resolvedDuration,
      status: "confirmed",
      client_notes: quoteData.description,
    })
    .select()
    .single();
  if (appointmentError) throw appointmentError;

  const { error: blockError } = await supabase.from("availability_block").insert({
    block_date: date,
    start_time: time,
    end_time: endTime,
    block_type: "appointment",
    reason: `Cita agendada - Appointment ID: ${appointment.id}`,
    sync_source: "app",
  });
  if (blockError) throw blockError;

  return appointment;
}