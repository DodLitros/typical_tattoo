import { useState, useEffect } from "react";
import Button from "../../../components/ui/Button";
import { getAvailableSlots, bookAppointment, type AvailableSlot } from "../services/appointmentService";
import { supabase } from "../../../lib/supabaseClient";

interface AppointmentCalendarProps {
  quoteRequestId: string;
}

interface QuoteInfo {
  duration_minutes: number | null;
  price: number | null;
  notes: string | null;
}

export default function AppointmentCalendar({ quoteRequestId }: AppointmentCalendarProps) {
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [quoteInfo, setQuoteInfo] = useState<QuoteInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, [quoteRequestId]);

  const loadData = async () => {
    try {
      const [slotData] = await Promise.all([
        getAvailableSlots(quoteRequestId),
        loadQuoteInfo(),
      ]);
      setSlots(slotData);
    } catch (error) {
      console.error("Error cargando horarios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuoteInfo = async () => {
    const { data } = await supabase
      .from("quote_response")
      .select("duration_minutes, price, notes")
      .eq("quote_request_id", quoteRequestId)
      .single();
    if (data) setQuoteInfo(data);
  };

  const handleBook = async () => {
    if (!selectedSlot) return;

    setIsBooking(true);
    try {
      await bookAppointment(quoteRequestId, selectedSlot.date, selectedSlot.time, quoteInfo?.duration_minutes);
      setSuccess(true);
    } catch (error) {
      console.error("Error agendando cita:", error);
      alert("Error al agendar. Intenta de nuevo.");
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) return <div>Cargando horarios...</div>;

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "2em" }}>
        <h3 style={{ color: "#4CAF50" }}>¡Cita agendada! ✓</h3>
        <p>Te confirmamos por WhatsApp</p>
      </div>
    );
  }

  const groupedByDate = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, AvailableSlot[]>);

  const durationLabel = quoteInfo?.duration_minutes
    ? `${Math.floor(quoteInfo.duration_minutes / 60)}h ${quoteInfo.duration_minutes % 60 > 0 ? `${quoteInfo.duration_minutes % 60}min` : ""}`
    : null;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2>Agenda tu cita</h2>

      {quoteInfo && (
        <div className="ui-card" style={{ marginBottom: "1rem", padding: "1rem" }}>
          {quoteInfo.duration_minutes && (
            <p><strong>Duración estimada:</strong> {durationLabel}</p>
          )}
          {quoteInfo.price != null && (
            <p><strong>Precio:</strong> ${Number(quoteInfo.price).toLocaleString("es-CO")}</p>
          )}
          {quoteInfo.notes && (
            <p style={{ fontSize: "0.9rem", color: "#aaa" }}>{quoteInfo.notes}</p>
          )}
        </div>
      )}

      {Object.entries(groupedByDate).map(([date, daySlots]) => (
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
      ))}

      {selectedSlot && (
        <div style={{ marginTop: "2rem" }}>
          <p>Seleccionaste: {new Date(selectedSlot.date + "T12:00:00").toLocaleDateString('es-CO')} a las {selectedSlot.time.slice(0, 5)}</p>
          {quoteInfo?.duration_minutes && (
            <p style={{ color: "#aaa", fontSize: "0.9rem" }}>
              La cita será de {durationLabel} (hasta las {selectedSlot.end_time.slice(0, 5)})
            </p>
          )}
          <Button onClick={handleBook} disabled={isBooking}>
            {isBooking ? "Agendando..." : "Confirmar cita"}
          </Button>
        </div>
      )}
    </div>
  );
}