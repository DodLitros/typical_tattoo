import { supabase } from "../../../lib/supabaseClient";

interface AvailableSlot {
  id: string;
  block_date: string;
  start_time: string;
  end_time: string;
}

export async function getAvailableSlots(quoteRequestId: string) {
  // Obtener bloques de disponibilidad que no estén reservados
  const { data: blocks, error } = await supabase
    .from("availability_block")
    .select("id, block_date, start_time, end_time")
    .eq("block_type", "available")
    .is("reason", null) // Solo bloques sin razón (disponibles)
    .gte("block_date", new Date().toISOString().split('T')[0]) // Desde hoy en adelante
    .order("block_date", { ascending: true })
    .order("start_time", { ascending: true });
  if (error) throw error;

  // Verificar cuáles ya tienen cita agendada
  const { data: appointments } = await supabase
    .from("appointment")
    .select("appointment_date, start_time")
    .neq("status", "cancelled");

  const bookedSlots = new Set(
    appointments?.map(apt => `${apt.appointment_date}-${apt.start_time}`) || []
  );

  // Marcar disponibilidad
  return (blocks || []).map(block => ({
    id: block.id,
    date: block.block_date,
    time: block.start_time,
    end_time: block.end_time,
    available: !bookedSlots.has(`${block.block_date}-${block.start_time}`)
  }));
}

export async function bookAppointment(
  quoteRequestId: string,
  date: string,
  time: string
) {
  // Obtener info del quote_request para el client_id y descripción
  const { data: quoteData, error: quoteError } = await supabase
    .from("quote_request")
    .select("client_id, description")
    .eq("id", quoteRequestId)
    .single();

  if (quoteError) throw quoteError;

  // Crear la cita
  const { data: appointment, error: appointmentError } = await supabase
    .from("appointment")
    .insert({
      client_id: quoteData.client_id,
      quote_request_id: quoteRequestId,
      appointment_date: date,
      start_time: time,
      status: "confirmed",
      client_notes: quoteData.description,
    })
    .select()
    .single();

  if (appointmentError) throw appointmentError;

  // Bloquear ese slot en availability_block
  const { error: blockError } = await supabase
    .from("availability_block")
    .update({ 
      reason: `Cita agendada - Appointment ID: ${appointment.id}`,
      block_type: "appointment" 
    })
    .eq("block_date", date)
    .eq("start_time", time);
  if (blockError) throw blockError;
  
  return appointment;
}