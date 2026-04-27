import { useState, useEffect } from "react";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import RegisterModal from "./RegisterModal";
import QuoteRequestForm from "./QuoteRequestForm";
import { getCurrentUser, createQuoteRequestForClient } from "../services/quoteService";

export default function QuoteModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quoteRequestId, setQuoteRequestId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const user = await getCurrentUser();
    setIsAuthenticated(!!user);
    setIsLoading(false);
  };

  const handleClick = async () => {
    if (isAuthenticated) {
      // Crear nueva quote_request y obtener el ID
      const quoteRequest = await createQuoteRequestForClient();
      setQuoteRequestId(quoteRequest.id);
    }
    setIsOpen(true);
  };

  if (isLoading) return <Button disabled>Cargando...</Button>;

  return (
    <>
      <Button onClick={handleClick}>Pedir cotización</Button>
      
        {isAuthenticated && quoteRequestId ? (
          <QuoteRequestForm quoteRequestId={quoteRequestId} />
        ) : (
          <Modal 
            isOpen={isOpen} 
            title={isAuthenticated ? "Cotiza tu tatuaje" : "Regístrate"} 
            onClose={() => setIsOpen(false)}
          >
           <RegisterModal />
          </Modal>
        )}
    </>
  );
}