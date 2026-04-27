import { useState } from "react";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import RegisterModal from "./RegisterModal";

export default function QuoteModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false)

  return (
    <>
      <Button onClick={() => setIsRegistered(true)}>Pedir cotización</Button>
      <Modal isOpen={isRegistered} title="Registrate" onClose={() => setIsOpen(false)}>
        <RegisterModal/>
      </Modal>
    </>
  );
}
