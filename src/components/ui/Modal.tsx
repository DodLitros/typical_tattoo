import type { PropsWithChildren } from "react";

interface ModalProps extends PropsWithChildren {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
}

export default function Modal({ isOpen, title, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="ui-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="ui-modal-content"
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Modal"}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ui-modal-header">
          {title ? <h2>{title}</h2> : null}
          <button className="ui-modal-close" type="button" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
