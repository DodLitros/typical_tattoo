import { useEffect, useRef, useState } from 'react';
import type { SizeType } from 'page-flip';
import { SketchbookPage, type TattooData } from './SketchbookPage';
import { getPublishedPortfolioPosts, type PortfolioPostWithDetails } from '../../features/portfolio/services/portfolioService';
import './sketchbook.css';

function mapPostToTattooData(post: PortfolioPostWithDetails): TattooData {
  const finalMedia = post.timeline.find(m => m.media_role === 'final');
  const coverUrl = post.cover_image_url || finalMedia?.storage_url || '/placeholder.jpg';

  const tagParts: string[] = [];
  if (post.quote?.body_placement) tagParts.push(post.quote.body_placement);
  if (post.tags && post.tags.length > 0) tagParts.push(post.tags.map(t => t.name).join(' · '));

  const price = post.quoteResponse?.price;
  const duration = post.quoteResponse?.duration_minutes;

  let metaText = '';
  if (price) metaText += `$${price}`;
  if (duration) metaText += metaText ? ` · ${duration}min` : `${duration}min`;

  return {
    id: post.id,
    img: coverUrl,
    tag: post.title,
    needle: metaText,
    clientName: post.client?.full_name || null,
    description: post.quote?.description || null,
    bodyPlacement: post.quote?.body_placement || null,
    appointmentDate: post.appointment?.appointment_date || null,
    price: post.quoteResponse?.price || null,
    durationMinutes: post.quoteResponse?.duration_minutes || null,
    notes: post.quoteResponse?.notes || null,
    timeline: post.timeline,
    design: post.design,
  };
}

export default function Sketchbook() {
  const bookRef = useRef<HTMLDivElement>(null);
  const pageFlipInstance = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [tatuajes, setTatuajes] = useState<TattooData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const posts = await getPublishedPortfolioPosts();
        if (!isMounted) return;
        const mapped = posts.map(mapPostToTattooData);
        setTatuajes(mapped);
      } catch (err) {
        if (!isMounted) return;
        console.error('Error loading portfolio:', err);
        setError('No se pudieron cargar los tatuajes');
      }
    };

    const initBook = async () => {
      if (bookRef.current && !pageFlipInstance.current) {
        try {
          const module = await import('page-flip');
          const PageFlip = module.PageFlip;

          pageFlipInstance.current = new PageFlip(bookRef.current, {
            width: 450,
            height: 650,
            size: 'stretch' as SizeType,
            minWidth: 315,
            maxWidth: 1000,
            minHeight: 420,
            maxHeight: 1350,
            showCover: true,
            usePortrait: true,
            mobileScrollSupport: false
          });

          const pagesNodes = bookRef.current.querySelectorAll('.page');
          const pagesArray = Array.from(pagesNodes);

          pageFlipInstance.current.loadFromHTML(pagesArray);

          if (isMounted) setIsLoaded(true);

        } catch (error) {
          console.error("Error al cargar PageFlip:", error);
        }
      }
    };

    loadData().then(() => {
      const timer = setTimeout(() => {
        initBook();
      }, 100);
      return () => clearTimeout(timer);
    });

    return () => {
      isMounted = false;
      if (pageFlipInstance.current) {
        pageFlipInstance.current.destroy();
        pageFlipInstance.current = null;
      }
    };
  }, []);

  if (error) {
    return (
      <div className="sketchbook-container">
        <div className="page cover page-hard">
          <div className="page-content" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <p className="typewriter-font" style={{ color: '#eaddc5' }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (tatuajes.length === 0) {
    return (
      <div className="sketchbook-container">
        <div className="page cover page-hard">
          <div className="page-content" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <h1 className="vanguard-font">SKETCHBOOK</h1>
            <p className="typewriter-font" style={{ color: '#eaddc5', marginTop: '1rem' }}>Próximamente...</p>
          </div>
        </div>
        <div className="page cover page-hard">
          <div className="page-content" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <h2 className="vanguard-font">FIN.</h2>
          </div>
        </div>
      </div>
    );
  }

  const totalPages = 1 + tatuajes.length + 1;
  const needsBlankPage = totalPages % 2 !== 0;

  return (
    <div className="sketchbook-container">

      <div
        ref={bookRef}
        className="flip-book"
        style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.5s ease' }}
      >

        <div className="page cover page-hard">
          <div className="page-content" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <h1 className="vanguard-font">SKETCHBOOK</h1>
            <p>Portafolio</p>
          </div>
        </div>

        {tatuajes.map((tatoo, index) => (
          <SketchbookPage
            key={tatoo.id}
            tatoo={tatoo}
            pageNumber={index + 1}
          />
        ))}

        {needsBlankPage && (
          <div className="page ink-page">
            <div className="page-content" style={{ justifyContent: 'center', alignItems: 'center' }}>
              <p style={{ opacity: 0.3 }}>Espacio para bocetos...</p>
            </div>
          </div>
        )}

        <div className="page cover page-hard">
          <div className="page-content" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <h2 className="vanguard-font">FIN.</h2>
          </div>
        </div>

      </div>
    </div>
  );
}