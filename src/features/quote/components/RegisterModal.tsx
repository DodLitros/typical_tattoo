import type { FormEvent } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { useRegisterForm } from "../hooks/useRegisterForm";
import { signInWithOtp, verifyOtp } from "../services/authService";

export default function RegisterModal() {
    const { 
      values, 
      isSubmitting, 
      setIsSubmitting, 
      updateField, 
      reset,
      otpSent,
      setOtpSent,
      otpCode,
      setOtpCode
    } = useRegisterForm();

    const handleSendOtp = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmitting(true);
  
      const { error } = await signInWithOtp(values.phone, values.full_name);
      
      if (error) {
        console.error("Error enviando OTP:", error);
      } else {
        setOtpSent(true);
      }
  
      setIsSubmitting(false);
    };

    const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmitting(true);
  
      const { data, error } = await verifyOtp(values.phone, otpCode);
      
      if (error) {
        console.error("Error verificando OTP:", error);
      } else {
        console.log("Cliente registrado exitosamente");
        reset();
      }
  
      setIsSubmitting(false);
    };
    
  return (
    <>
      {!otpSent ? (
        <form className="quote-form" onSubmit={handleSendOtp}>
          <label className="field">
            <span>Nombre completo</span>
            <Input
              value={values.full_name}
              onChange={(event) => updateField("full_name", event.target.value)}
              placeholder="Tu nombre"
              required
            />
          </label>

          <label className="field">
            <span>Teléfono</span>
            <Input
              value={values.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="Tu teléfono"
              required
            />
          </label>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando código..." : "Enviar código OTP"}
          </Button>
        </form>
      ) : (
        <form className="quote-form" onSubmit={handleVerifyOtp}>
          <label className="field">
            <span>Código OTP</span>
            <p style={{ fontSize: "0.9em", color: "#666", margin: "0.5em 0" }}>
              Ingresa el código de 6 dígitos enviado a {values.phone}
            </p>
            <Input
              value={otpCode}
              onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              pattern="[0-9]{6}"
              required
            />
          </label>
          <Button type="submit" disabled={isSubmitting || otpCode.length !== 6}>
            {isSubmitting ? "Verificando..." : "Verificar y registrarse"}
          </Button>
          <Button 
            type="button" 
            onClick={() => {
              setOtpSent(false);
              setOtpCode("");
            }}
            disabled={isSubmitting}
            style={{ marginTop: "0.5em" }}
          >
            Volver
          </Button>
        </form>
      )}
    </>
  );
}
