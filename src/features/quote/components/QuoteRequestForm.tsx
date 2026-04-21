import { useState, useRef, useEffect } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { updateQuoteRequest, uploadQuoteMedia } from "../services/quoteService";

registerPlugin(FilePondPluginImagePreview, FilePondPluginFileValidateType);

interface QuoteRequestFormProps {
  quoteRequestId: string;
}

interface FormValues {
  description: string;
  body_placement: string;
  size_hint: string;
  preferred_date: string;
}

const initialValues: FormValues = {
  description: "",
  body_placement: "",
  size_hint: "",
  preferred_date: "",
};

export default function QuoteRequestForm({ quoteRequestId }: QuoteRequestFormProps) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const filePondRef = useRef(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    debugger;
    try {
      // Actualizar quote_request
      await updateQuoteRequest(quoteRequestId, {
        description: values.description,
        body_placement: values.body_placement || undefined,
        size_hint: values.size_hint || undefined,
        preferred_date: values.preferred_date || undefined,
      });

      // Subir archivos si existen
      if (files.length > 0) {
        debugger;
        await uploadQuoteMedia(quoteRequestId, files);
        debugger;
      }

      setSubmitSuccess(true);
      console.log("Cotización guardada exitosamente");

      // Redirigir después de 2 segundos
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      console.error("Error al guardar cotización:", error);
      alert("Error al guardar la cotización. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div style={{ textAlign: "center", padding: "2em" }}>
        <h3 style={{ color: "#4CAF50", marginBottom: "1em" }}>
          ¡Cotización guardada exitosamente! ✓
        </h3>
        <p style={{ color: "#666" }}>Serás redirigido en unos momentos...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2>Completa tu solicitud de cotización</h2>

      <div className="field">
        <label>
          <span>Descripción</span>
          <textarea
            name="description"
            value={values.description}
            onChange={handleInputChange}
            placeholder="Describe tu tatuaje, estilo, ideas..."
            required
            style={{
              width: "100%",
              minHeight: "150px",
              padding: "0.75em",
              borderRadius: "4px",
              border: "1px solid #ddd",
              fontFamily: "inherit",
              fontSize: "inherit",
            }}
          />
        </label>
      </div>

      <div className="field">
        <label>
          <span>Ubicación en el cuerpo</span>
          <Input
            name="body_placement"
            value={values.body_placement}
            onChange={handleInputChange}
            placeholder="Ej: Brazo, espalda, pecho..."
          />
        </label>
      </div>

      <div className="field">
        <label>
          <span>Tamaño aproximado</span>
          <Input
            name="size_hint"
            value={values.size_hint}
            onChange={handleInputChange}
            placeholder="Ej: Pequeño (5cm), Mediano (10cm)..."
          />
        </label>
      </div>

      <div className="field">
        <label>
          <span>Fecha preferida</span>
          <Input
            type="date"
            name="preferred_date"
            value={values.preferred_date}
            onChange={handleInputChange}
          />
        </label>
      </div>

      <div className="field">
        <label>
          <span>Imágenes de referencia</span>
          <div style={{ marginTop: "1em" }}>
            <FilePond
              ref={filePondRef}
              files={files}
              onupdatefiles={(fileItems) => {
                setFiles(fileItems.map((item) => item.file) as File[]);
              }}
              allowMultiple={true}
              maxFiles={5}
            //   maxFileSize="5MB"
              acceptedFileTypes={["image/jpeg", "image/png", "image/webp"]}
              labelIdle='Arrastra imágenes aquí o <span class="filepond--label-action">selecciona archivos</span>'
            />
          </div>
        </label>
      </div>

      <div style={{ marginTop: "2em" }}>
        <Button type="submit" disabled={isSubmitting || !values.description}>
          {isSubmitting ? "Guardando..." : "Guardar cotización"}
        </Button>
      </div>
    </form>
  );
}
