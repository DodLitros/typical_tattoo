// src/components/portfolio/SketchbookPage.tsx
import { forwardRef } from 'react';

// 1. Definimos la estructura de los datos que recibirá la página (TypeScript)
export interface TattooData {
  id: string | number;
  img: string;
  tag: string;
  aguja: string;
  // Puedes añadir más cosas: fecha, horas de sesión, etc.
}

interface SketchbookPageProps {
  tatoo: TattooData;
  pageNumber: number;
}

// 2. Usamos forwardRef para que page-flip pueda manipular este DIV
export const SketchbookPage = forwardRef<HTMLDivElement, SketchbookPageProps>(
  ({ tatoo, pageNumber }, ref) => {
    return (
      <div className="page ink-page" ref={ref}>
        <div className="page-content">
          
          {/* Imagen del tatuaje */}
          <div className="tattoo-image-container">
            <img 
              src={tatoo.img} 
              alt={`Tatuaje: ${tatoo.tag}`} 
              className="tattoo-img" 
              loading="lazy" // Buena práctica para rendimiento
            />
          </div>

          {/* Detalles técnicos tipo collage */}
          <div className="tattoo-labels">
            <div className="label-tape typewriter-font">
              {tatoo.tag}
            </div>
            <div className="needle-spec">
              <span className="icon">💉</span> {tatoo.aguja}
            </div>
          </div>

          {/* Número de página en la esquina */}
          <div className="page-number">{pageNumber}</div>
        </div>
      </div>
    );
  }
);

// Esto es útil para debuggear en React DevTools
SketchbookPage.displayName = 'SketchbookPage';