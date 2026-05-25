import { useState, useEffect } from "react";
import Button from "../../../components/ui/Button";
import { getAvailableSlots, bookAppointment, rescheduleAppointment, getExistingAppointment, getEffectiveDuration, canReschedule, type AvailableSlot, type ExistingAppointment } from "../services/appointmentService";
import { supabase } from "../../../lib/supabaseClient";

interface AppointmentCalendarProps {
  quoteRequestId: string;
}

interface QuoteInfo {
  duration_minutes: number | null;
  price: number | null;
  notes: string | null;
}

type ViewMode = "loading" | "booking" | "has_appointment_locked" | "has_appointment_reschedulable" | "success";

export default function AppointmentCalendar({ quoteRequestId }: AppointmentCalendarProps) {
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
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

      const { data } = await supabase
        .from("quote_response")
        .select("duration_minutes, price, notes")
        .eq("quote_request_id", quoteRequestId)
        .single();
      if (data) setQuoteInfo(data);
    } catch (error) {
      console.error("Error cargando datos:", error);
      setViewMode("booking");
    }
  };

  const handleBook = async () => {
    if (!selectedSlot) return;
    setIsBooking(true);
    try {
      await bookAppointment(quoteRequestId, selectedSlot.date, selectedSlot.time, quoteInfo?.duration_minutes);
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
      await rescheduleAppointment(quoteRequestId, selectedSlot.date, selectedSlot.time, quoteInfo?.duration_minutes);
      setViewMode("success");
    } catch (error: any) {
      alert(error.message || "Error al cambiar la cita. Intenta de nuevo.");
    } finally {
      setIsBooking(false);
    }
  };

  const effectiveDuration = getEffectiveDuration(quoteInfo?.duration_minutes ?? null);
  const isFallbackDuration = !quoteInfo?.duration_minutes || quoteInfo.duration_minutes > 480 || quoteInfo.duration_minutes <= 0;

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}min`;
    if (h > 0) return `${h}h`;
    return `${m}min`;
  };

  const formatDateTime = (date: string, time: string) => {
    const d = new Date(date + "T12:00:00");
    return `${d.toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} a las ${time.slice(0, 5)}`;
  };

  const groupedByDate = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, AvailableSlot[]>);

  if (viewMode === "loading") return <div>Cargando horarios...</div>;

  if (viewMode === "success") {
    return (
      <div style={{ textAlign: "center", padding: "2em" }}>
        <h3 style={{ color: "#4CAF50" }}>
          {existingAppointment && viewMode !== "success" ? "¡Cita actualizada! ✓" : "¡Cita agendada! ✓"}
        </h3>
        <p>Te confirmamos por WhatsApp</p>
      </div>
    );
  }

  if (viewMode === "has_appointment_locked" && existingAppointment) {
    return (
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h2>Tu cita está confirmada</h2>
        <div className="ui-card" style={{ padding: "1.5rem", marginTop: "1rem" }}>
          <p><strong>Fecha:</strong> {formatDateTime(existingAppointment.appointment_date, existingAppointment.start_time)}</p>
          {existingAppointment.duration_minutes && (
            <p><strong>Duración:</strong> {formatDuration(existingAppointment.duration_minutes)}</p>
          )}
          <div style={{ marginTop: "1rem", padding: "1rem", background: "#3a2a1a", borderRadius: "0.5rem", borderLeft: "4px solid #f0ad4e" }}>
            <p style={{ color: "#f0ad4e", margin: 0 }}>
              Esta cita ya no se puede modificar. Solo puedes cambiarla hasta 2 días antes de la fecha agendada.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "has_appointment_reschedulable" && existingAppointment) {
    return (
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h2>Cambiar cita</h2>

        <div className="ui-card" style={{ padding: "1rem", marginBottom: "1rem", borderLeft: "4px solid #f0ad4e" }}>
          <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>Ya tienes una cita agendada:</p>
          <p>{formatDateTime(existingAppointment.appointment_date, existingAppointment.start_time)}</p>
          <p style={{ color: "#f0ad4e", fontSize: "0.9rem", marginTop: "0.5rem" }}>
            Si seleccionas una nueva fecha, tu cita anterior se cancelará y se agendará la nueva.
          </p>
        </div>

        {quoteInfo && (
          <div className="ui-card" style={{ marginBottom: "1rem", padding: "1rem" }}>
            {!isFallbackDuration && quoteInfo.duration_minutes && (
              <p><strong>Duración:</strong> {formatDuration(quoteInfo.duration_minutes)}</p>
            )}
            {isFallbackDuration && (
              <p style={{ color: "#f0ad4e", fontSize: "0.9rem" }}>
                Duración por confirmar. Se agendará un bloque de {formatDuration(effectiveDuration)}.
              </p>
            )}
            {quoteInfo.price != null && (
              <p><strong>Precio:</strong> ${Number(quoteInfo.price).toLocaleString("es-CO")}</p>
            )}
            {quoteInfo.notes && (
              <p style={{ fontSize: "0.9rem", color: "#aaa" }}>{quoteInfo.notes}</p>
            )}
          </div>
        )}

        {slots.length === 0 ? (
          <div className="ui-card" style={{ textAlign: "center", padding: "2rem" }}>
            <p style={{ color: "#aaa", fontSize: "1.1rem" }}>
              No hay horarios disponibles en los próximos 60 días.
            </p>
          </div>
        ) : (
          Object.entries(groupedByDate).map(([date, daySlots]) => (
            <div key={date} className="ui-card">
              <h3>{new Date(date + "T12:00:00").toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "0.5rem", marginTop: "1rem" }}>
                {daySlots.map((slot) => (
                  <button
                    key={`${slot.date}-${slot.time}`}
                    onClick={() => setSelectedSlot(slot)}
                    style={{
                      padding: "0.75rem",
                      border: selectedSlot?.date === slot.date && selectedSlot?.time === slot.time ? "2px solid #f0ad4e" : "1px solid #4a4a4a",
                      borderRadius: "0.5rem",
                      background: "#2a2a2a",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    {slot.time.slice(0, 5)}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}

        {selectedSlot && (
          <div style={{ marginTop: "2rem" }}>
            <p>Nueva cita: {formatDateTime(selectedSlot.date, selectedSlot.time)}</p>
            <p style={{ color: "#aaa", fontSize: "0.9rem" }}>
              Duración: {formatDuration(effectiveDuration)} (hasta las {selectedSlot.end_time.slice(0, 5)})
            </p>
            <Button onClick={handleReschedule} disabled={isBooking}>
              {isBooking ? "Cambiando..." : "Confirmar cambio de cita"}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // viewMode === "booking"
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2>Agenda tu cita</h2>

      {quoteInfo && (
        <div className="ui-card" style={{ marginBottom: "1rem", padding: "1rem" }}>
          {!isFallbackDuration && quoteInfo.duration_minutes && (
            <p><strong>Duración:</strong> {formatDuration(quoteInfo.duration_minutes)}</p>
          )}
          {isFallbackDuration && (
            <p style={{ color: "#f0ad4e", fontSize: "0.9rem" }}>
              Duración por confirmar. Se agendará un bloque de {formatDuration(effectiveDuration)}.
            </p>
          )}
          {quoteInfo.price != null && (
            <p><strong>Precio:</strong> ${Number(quoteInfo.price).toLocaleString("es-CO")}</p>
          )}
          {quoteInfo.notes && (
            <p style={{ fontSize: "0.9rem", color: "#aaa" }}>{quoteInfo.notes}</p>
          )}
        </div>
      )}

      {slots.length === 0 ? (
        <div className="ui-card" style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: "#aaa", fontSize: "1.1rem" }}>
            No hay horarios disponibles en los próximos 60 días.
          </p>
          <p style={{ color: "#888", fontSize: "0.9rem" }}>
            El artista no tiene jornadas activas o están completamente ocupadas.
          </p>
        </div>
      ) : (
        Object.entries(groupedByDate).map(([date, daySlots]) => (
          <div key={date} className="ui-card">
            <h3>{new Date(date + "T12:00:00").toLocaleDateString('es-CO', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "0.5rem", marginTop: "1rem" }}>
              {daySlots.map((slot) => (
                <button
                  key={`${slot.date}-${slot.time}`}
                  onClick={() => setSelectedSlot(slot)}
                  style={{
                    padding: "0.75rem",
                    border: selectedSlot?.date === slot.date && selectedSlot?.time === slot.time ? "2px solid #4f46e5" : "1px solid #4a4a4a",
                    borderRadius: "0.5rem",
                    background: "#2a2a2a",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  {slot.time.slice(0, 5)}
                </button>
              ))}
            </div>
          </div>
        ))
      )}

      {selectedSlot && (
        <div style={{ marginTop: "2rem" }}>
          <p>Seleccionaste: {formatDateTime(selectedSlot.date, selectedSlot.time)}</p>
          <p style={{ color: "#aaa", fontSize: "0.9rem" }}>
            Duración: {formatDuration(effectiveDuration)} (hasta las {selectedSlot.end_time.slice(0, 5)})
          </p>
          <Button onClick={handleBook} disabled={isBooking}>
            {isBooking ? "Agendando..." : "Confirmar cita"}
          </Button>
        </div>
      )}
    </div>
  );
}