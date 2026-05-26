import { useState, useEffect, useMemo } from "react";
import Button from "../../../components/ui/Button";
import { getAvailableSlots, bookAppointment, rescheduleAppointment, getExistingAppointment, canReschedule, type AvailableSlot, type ExistingAppointment } from "../services/appointmentService";
import { supabase } from "../../../lib/supabaseClient";

interface AppointmentCalendarProps {
  quoteRequestId: string;
}

interface QuoteInfo {
  price: number | null;
  notes: string | null;
}

type ViewMode = "loading" | "booking" | "has_appointment_locked" | "has_appointment_reschedulable" | "success";

export default function AppointmentCalendar({ quoteRequestId }: AppointmentCalendarProps) {
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [quoteInfo, setQuoteInfo] = useState<QuoteInfo | null>(null);
  const [existingAppointment, setExistingAppointment] = useState<ExistingAppointment | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("loading");
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    loadData();
  }, [quoteRequestId]);

  const loadData = async () => {
    try {
      let durationMinutes: number | null = null;

      const { data: qr } = await supabase
        .from("quote_response")
        .select("duration_minutes, price, notes")
        .eq("quote_request_id", quoteRequestId)
        .single();

      if (qr) {
        setQuoteInfo({ price: qr.price, notes: qr.notes });
        durationMinutes = qr.duration_minutes;
      }

      const apt = await getExistingAppointment(quoteRequestId);
      setExistingAppointment(apt);

      if (apt) {
        if (canReschedule(apt)) {
          const slotData = await getAvailableSlots(quoteRequestId);
          setSlots(slotData);
          setViewMode("has_appointment_reschedulable");
        } else {
          setViewMode("has_appointment_locked");
        }
      } else {
        const slotData = await getAvailableSlots(quoteRequestId);
        setSlots(slotData);
        setViewMode("booking");
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
      setViewMode("booking");
    }
  };

  const handleBook = async () => {
    if (!selectedSlot) return;
    setIsBooking(true);
    try {
      await bookAppointment(quoteRequestId, selectedSlot.date, selectedSlot.time, null);
      setViewMode("success");
    } catch (error: any) {
      alert(error.message || "Error al agendar. Intenta de nuevo.");
    } finally {
      setIsBooking(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedSlot) return;
    setIsBooking(true);
    try {
      await rescheduleAppointment(quoteRequestId, selectedSlot.date, selectedSlot.time, null);
      setViewMode("success");
    } catch (error: any) {
      alert(error.message || "Error al cambiar la cita. Intenta de nuevo.");
    } finally {
      setIsBooking(false);
    }
  };

  const formatFullDate = (date: string) => {
    return new Date(date + "T12:00:00").toLocaleDateString("es-CO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => time.slice(0, 5);

  const availableDates = useMemo(() => {
    return [...new Set(slots.map((s) => s.date))].sort();
  }, [slots]);

  const timesForDate = useMemo(() => {
    if (!selectedDate) return [];
    return slots.filter((s) => s.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time));
  }, [slots, selectedDate]);

  const isReschedule = viewMode === "has_appointment_reschedulable";

  if (viewMode === "loading") return <div>Cargando horarios...</div>;

  if (viewMode === "success") {
    return (
      <div style={{ textAlign: "center", padding: "2em" }}>
        <h3 style={{ color: "#4CAF50" }}>
          {isReschedule ? "¡Cita actualizada! ✓" : "¡Cita agendada! ✓"}
        </h3>
        <p>Te confirmamos por WhatsApp</p>
      </div>
    );
  }

  if (viewMode === "has_appointment_locked" && existingAppointment) {
    return (
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <h2>Tu cita está confirmada</h2>
        <div className="ui-card" style={{ padding: "1.5rem", marginTop: "1rem" }}>
          <p><strong>Fecha:</strong> {formatFullDate(existingAppointment.appointment_date)}</p>
          <p><strong>Hora:</strong> {formatTime(existingAppointment.start_time)}</p>
          <div style={{ marginTop: "1rem", padding: "1rem", background: "#3a2a1a", borderRadius: "0.5rem", borderLeft: "4px solid #f0ad4e" }}>
            <p style={{ color: "#f0ad4e", margin: 0, fontSize: "0.9rem" }}>
              Esta cita ya no se puede modificar. Solo puedes cambiarla hasta 2 días antes de la fecha agendada.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const showCalendar = viewMode === "booking" || viewMode === "has_appointment_reschedulable";
  if (!showCalendar) return null;

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
      <h2>{isReschedule ? "Cambiar cita" : "Agenda tu cita"}</h2>

      {isReschedule && existingAppointment && (
        <div className="ui-card" style={{ padding: "1rem", marginBottom: "1rem", borderLeft: "4px solid #f0ad4e" }}>
          <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>Ya tienes una cita agendada:</p>
          <p>{formatFullDate(existingAppointment.appointment_date)} a las {formatTime(existingAppointment.start_time)}</p>
          <p style={{ color: "#f0ad4e", fontSize: "0.85rem", marginTop: "0.5rem" }}>
            Al cambiar la fecha, ese espacio de tiempo se liberará para que otra persona pueda agendarlo.
          </p>
        </div>
      )}

      {quoteInfo && quoteInfo.price != null && (
        <div className="ui-card" style={{ marginBottom: "1rem", padding: "1rem" }}>
          <p><strong>Precio:</strong> ${Number(quoteInfo.price).toLocaleString("es-CO")}</p>
          {quoteInfo.notes && (
            <p style={{ fontSize: "0.9rem", color: "#aaa" }}>{quoteInfo.notes}</p>
          )}
        </div>
      )}

      {availableDates.length === 0 ? (
        <div className="ui-card" style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: "#aaa", fontSize: "1.1rem" }}>
            No hay horarios disponibles en los próximos 60 días.
          </p>
          <p style={{ color: "#888", fontSize: "0.9rem" }}>
            El artista no tiene jornadas activas o están completamente ocupadas.
          </p>
        </div>
      ) : (
        <>
          <div className="ui-card" style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", fontSize: "0.9rem" }}>
              Selecciona un día
            </label>
            <select
              value={selectedDate || ""}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSlot(null);
              }}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                background: "#2a2a2a",
                color: "#fff",
                border: "1px solid #4a4a4a",
                fontSize: "1rem",
              }}
            >
              <option value="" disabled>
                — Elige un día —
              </option>
              {availableDates.map((date) => (
                <option key={date} value={date}>
                  {formatFullDate(date)}
                </option>
              ))}
            </select>
          </div>

          {selectedDate && (
            <div className="ui-card" style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", fontSize: "0.9rem" }}>
                Selecciona una hora
              </label>
              <select
                value={selectedSlot ? `${selectedSlot.date}-${selectedSlot.time}` : ""}
                onChange={(e) => {
                  const slot = timesForDate.find(
                    (s) => `${s.date}-${s.time}` === e.target.value
                  );
                  setSelectedSlot(slot || null);
                }}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "0.5rem",
                  background: "#2a2a2a",
                  color: "#fff",
                  border: "1px solid #4a4a4a",
                  fontSize: "1rem",
                }}
              >
                <option value="" disabled>
                  — Elige una hora —
                </option>
                {timesForDate.map((slot) => (
                  <option key={`${slot.date}-${slot.time}`} value={`${slot.date}-${slot.time}`}>
                    {formatTime(slot.time)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      )}

      {selectedSlot && (
        <div className="ui-card" style={{ padding: "1rem" }}>
          <p style={{ fontWeight: "bold" }}>
            {isReschedule ? "Nueva cita:" : "Tu cita:"} {formatFullDate(selectedSlot.date)} a las {formatTime(selectedSlot.time)}
          </p>
          {isReschedule && (
            <p style={{ color: "#f0ad4e", fontSize: "0.85rem", marginTop: "0.5rem" }}>
              Al confirmar, tu cita anterior se cancelará y ese horario quedará libre.
            </p>
          )}
          <div style={{ marginTop: "1rem" }}>
            <Button onClick={isReschedule ? handleReschedule : handleBook} disabled={isBooking}>
              {isBooking ? (isReschedule ? "Cambiando..." : "Agendando...") : (isReschedule ? "Confirmar cambio de cita" : "Confirmar cita")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}