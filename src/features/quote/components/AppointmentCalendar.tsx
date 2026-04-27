import { useState, useEffect } from "react";
import Button from "../../../components/ui/Button";
import { getAvailableSlots, bookAppointment } from "../services/appointmentService";

interface AppointmentCalendarProps {
  quoteRequestId: string;
}

interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
}

export default function AppointmentCalendar({ quoteRequestId }: AppointmentCalendarProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSlots();
  }, [quoteRequestId]);

  const loadSlots = async () => {
    try {
      const data = await getAvailableSlots(quoteRequestId);
      setSlots(data);
    } catch (error) {
      console.error("Error cargando horarios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selectedSlot) return;
    
    setIsBooking(true);
    try {
      await bookAppointment(quoteRequestId, selectedSlot.date, selectedSlot.time);
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
  }, {} as Record<string, TimeSlot[]>);

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2>Agenda tu cita</h2>
      
      {Object.entries(groupedByDate).map(([date, daySlots]) => (
        <div key={date} className="ui-card">
          <h3>{new Date(date).toLocaleDateString('es-CO', { 
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
                disabled={!slot.available}
                style={{
                  padding: "0.75rem",
                  border: selectedSlot === slot ? "2px solid #4f46e5" : "1px solid #4a4a4a",
                  borderRadius: "0.5rem",
                  background: slot.available ? "#2a2a2a" : "#1a1a1a",
                  color: slot.available ? "#fff" : "#666",
                  cursor: slot.available ? "pointer" : "not-allowed",
                }}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      ))}

      {selectedSlot && (
        <div style={{ marginTop: "2rem" }}>
          <p>Seleccionaste: {new Date(selectedSlot.date).toLocaleDateString('es-CO')} a las {selectedSlot.time}</p>
          <Button onClick={handleBook} disabled={isBooking}>
            {isBooking ? "Agendando..." : "Confirmar cita"}
          </Button>
        </div>
      )}
    </div>
  );
}