import type { FormEvent } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import ImageUploader from "./ImageUploader";
import AudioRecorder from "./AudioRecorder";
import { useQuoteForm } from "../hooks/useQuoteForm";
import { createQuoteRequest } from "../services/quoteService";

export default function QuoteForm() {
  const { values, isSubmitting, setIsSubmitting, updateField, reset } = useQuoteForm();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const { error } = await createQuoteRequest(values);
    if (!error) {
      console.log(error)
      reset();
    }

    setIsSubmitting(false);
  };

  return (
    <form className="quote-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Nombre completo</span>
        <Input
          value={values.fullName}
          onChange={(event) => updateField("fullName", event.target.value)}
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

      {/* <label className="field">
        <span>Descripción del tatuaje</span>
        <textarea
          className="ui-textarea"
          value={values.description}
          onChange={(event) => updateField("description", event.target.value)}
          placeholder="Idea, estilo, tamaño y ubicación"
        />
      </label> */}

      <ImageUploader />
      <AudioRecorder />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar cotización"}
      </Button>
    </form>
  );
}
