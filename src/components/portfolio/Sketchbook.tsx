import { useEffect, useRef, useState } from 'react';
import type { SizeType } from 'page-flip';
import { SketchbookPage, type TattooData } from './SketchbookPage';
import './sketchbook.css';

// Datos de ejemplo
const tatuajes: TattooData[] = [
  { id: 't1', img: '/20210513_222323.jpg', tag: 'Blackwork - Brazo', aguja: '3RL' },
  { id: 't2', img: '/20210513_222323.jpg', tag: 'Tradicional - Pierna', aguja: '9RS' },
  { id: 't3', img: '/20210513_222323.jpg', tag: 'Microrealismo', aguja: '1RL' },
];

export default function Sketchbook() {
  const bookRef = useRef<HTMLDivElement>(null);
  const pageFlipInstance = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false); // Para evitar el salto visual feo

  useEffect(() => {
    let isMounted = true;

    const initBook = async () => {
      if (bookRef.current && !pageFlipInstance.current) {
        try {
          // 1. Importación dinámica (A prueba de balas contra Vite/Astro)
          const module = await import('page-flip');
          const PageFlip = module.PageFlip;

          // width y height aquí definen UNA SOLA HOJA. 
          // 450x650 asegura que la hoja sea en formato vertical (como un libro normal).
          pageFlipInstance.current = new PageFlip(bookRef.current, {
            width: 450, 
            height: 650,
            size: 'stretch' as SizeType,
            minWidth: 315,
            maxWidth: 1000,
            minHeight: 420,
            maxHeight: 1350,
            showCover: true,
            usePortrait: true, // 1 hoja en móvil, 2 hojas (libro abierto) en PC
            mobileScrollSupport: false
          });

          // Seleccionamos las páginas
          const pagesNodes = bookRef.current.querySelectorAll('.page');
          const pagesArray = Array.from(pagesNodes);
          
          pageFlipInstance.current.loadFromHTML(pagesArray);
          
          if (isMounted) setIsLoaded(true); // Mostramos el libro cuando ya está armado

        } catch (error) {
          console.error("Error al cargar PageFlip:", error);
        }
      }
    };

    // Un pequeño retraso asegura que el HTML y CSS existan antes de calcular tamaños
    const timer = setTimeout(() => {
      initBook();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (pageFlipInstance.current) {
        pageFlipInstance.current.destroy();
        pageFlipInstance.current = null;
      }
    };
  }, []);

  // 2. MATEMÁTICA DEL LIBRO: Calculamos si necesitamos una página en blanco
  const totalPages = 1 + tatuajes.length + 1; // Portada + Tatuajes + Contraportada
  const needsBlankPage = totalPages % 2 !== 0; // Si es impar, true.

  return (
    <div className="sketchbook-container">
      
      {/* Opacity 0 hasta que cargue para que no se vean las páginas hacia abajo */}
      <div 
        ref={bookRef} 
        className="flip-book"
        style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.5s ease' }}
      >
        
        {/* PÁGINA 1: PORTADA */}
        <div className="page cover page-hard">
          <div className="page-content" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <h1 className="vanguard-font">SKETCHBOOK</h1>
            <p>Portafolio</p>
          </div>
        </div>

        {/* PÁGINAS DE TATUAJES */}
        {tatuajes.map((tatoo, index) => (
          <SketchbookPage 
            key={tatoo.id} 
            tatoo={tatoo} 
            pageNumber={index + 1}
          />
        ))}

        {/* PÁGINA EN BLANCO: Si tenemos hojas impares, agregamos esta para que la librería no crashee */}
        {needsBlankPage && (
          <div className="page ink-page">
            <div className="page-content" style={{ justifyContent: 'center', alignItems: 'center' }}>
              <p style={{ opacity: 0.3 }}>Espacio para bocetos...</p>
            </div>
          </div>
        )}

        {/* CONTRAPORTADA */}
        <div className="page cover page-hard">
          <div className="page-content" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <h2 className="vanguard-font">FIN.</h2>
          </div>
        </div>

      </div>
    </div>
  );
}