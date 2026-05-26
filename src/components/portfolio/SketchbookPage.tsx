import { forwardRef } from 'react';
import type { TimelineMedia, DesignInfo } from '../../features/portfolio/services/portfolioService';

export interface TattooData {
  id: string | number;
  img: string;
  tag: string;
  needle: string;
  clientName: string | null;
  description: string | null;
  bodyPlacement: string | null;
  appointmentDate: string | null;
  price: number | null;
  durationMinutes: number | null;
  notes: string | null;
  timeline: TimelineMedia[];
  design: DesignInfo | null;
}

interface SketchbookPageProps {
  tatoo: TattooData;
  pageNumber: number;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

export const SketchbookPage = forwardRef<HTMLDivElement, SketchbookPageProps>(
  ({ tatoo, pageNumber }, ref) => {
    const referenceMedia = tatoo.timeline.filter(m => m.media_role === 'reference');
    const designMedia = tatoo.timeline.filter(m => m.media_role === 'design');
    const finalMedia = tatoo.timeline.filter(m => m.media_role === 'final');

    const getImageUrl = (media: TimelineMedia | undefined): string | null => {
      if (!media) return null;
      return media.thumbnail_url || media.storage_url;
    };

    return (
      <div className="page ink-page" ref={ref}>
        <div className="page-content">

          <div className="tattoo-main-image">
            <img
              src={tatoo.img}
              alt={`Tatuaje: ${tatoo.tag}`}
              className="tattoo-img"
              loading="lazy"
            />
          </div>

          <div className="tattoo-info-section">
            <div className="tattoo-header-info">
              <div className="label-tape typewriter-font">{tatoo.tag}</div>
              {tatoo.needle && (
                <div className="needle-spec">{tatoo.needle}</div>
              )}
            </div>

            {tatoo.clientName && (
              <div className="tattoo-client typewriter-font">
                <span className="info-label">Cliente:</span> {tatoo.clientName}
              </div>
            )}

            {tatoo.appointmentDate && (
              <div className="tattoo-date typewriter-font">
                <span className="info-label">Fecha:</span> {formatDate(tatoo.appointmentDate)}
              </div>
            )}

            {tatoo.description && (
              <div className="tattoo-description typewriter-font">
                <span className="info-label">Descripción:</span> {tatoo.description}
              </div>
            )}

            {tatoo.notes && (
              <div className="tattoo-notes typewriter-font">
                <span className="info-label">Notas:</span> {tatoo.notes}
              </div>
            )}
          </div>

          {(referenceMedia.length > 0 || designMedia.length > 0 || finalMedia.length > 0 || tatoo.design?.storage_url) && (
            <div className="tattoo-timeline">
              <div className="timeline-label typewriter-font">Proceso</div>
              <div className="timeline-items">
                {referenceMedia.length > 0 && referenceMedia.map((media) => {
                  const url = getImageUrl(media);
                  if (!url) return null;
                  return (
                    <div key={media.id} className="timeline-item timeline-reference" title="Referencia del cliente">
                      <img src={url} alt="Referencia" className="timeline-img" loading="lazy" />
                      <span className="timeline-badge">Ref</span>
                    </div>
                  );
                })}

                {(designMedia.length > 0 || (tatoo.design && getImageUrl({ storage_url: tatoo.design.storage_url, thumbnail_url: tatoo.design.thumbnail_url, media_role: 'design', id: '', media_type: 'image', sort_order: null }))) && (
                  <>
                    {designMedia.map((media) => {
                      const url = getImageUrl(media);
                      if (!url) return null;
                      return (
                        <div key={media.id} className="timeline-item timeline-design" title="Diseño aprobado">
                          <img src={url} alt="Diseño" className="timeline-img" loading="lazy" />
                          <span className="timeline-badge">Diseño</span>
                        </div>
                      );
                    })}
                    {!designMedia.length && tatoo.design?.storage_url && (
                      <div className="timeline-item timeline-design" title="Diseño aprobado">
                        <img src={tatoo.design.storage_url} alt="Diseño" className="timeline-img" loading="lazy" />
                        <span className="timeline-badge">Diseño</span>
                      </div>
                    )}
                  </>
                )}

                {finalMedia.map((media) => {
                  const url = getImageUrl(media);
                  if (!url) return null;
                  return (
                    <div key={media.id} className="timeline-item timeline-final" title="Resultado final">
                      <img src={url} alt="Final" className="timeline-img" loading="lazy" />
                      <span className="timeline-badge">Final</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="page-number">{pageNumber}</div>
        </div>
      </div>
    );
  }
);

SketchbookPage.displayName = 'SketchbookPage';