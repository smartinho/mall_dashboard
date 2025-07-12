import { useState, cloneElement } from 'react';
import { ZoomIn } from 'lucide-react';

export default function ChartCard({
  title,
  children,
  fullHeight = false,
  onTitleClick = null,
  subtitle = null
}) {
  const [isOpen, setIsOpen] = useState(false);

  const renderModalChild = () =>
    cloneElement(children, {
      style: { width: '100%', height: '100%' },
      limit: undefined,
    });

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h4
          className={`chart-title${onTitleClick ? ' clickable' : ''}`}
          onClick={() => onTitleClick && onTitleClick()}
        >
          {title}
        </h4>
        {subtitle && (
          <div className="chart-subtitle">
            {subtitle}
          </div>
        )}
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Zoom Chart"
          className="zoom-button"
        >
          <ZoomIn size={20} />
        </button>
      </div>

      {fullHeight ? (
        <div className="full-container">{children}</div>
      ) : (
        <div className="aspect-ratio-box">
          <div className="chart-container">{children}</div>
        </div>
      )}

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close"
              className="modal-close"
            >
              ×
            </button>
            <div className="modal-chart">{renderModalChild()}</div>
          </div>
        </div>
      )}

      <style jsx>{`
        .chart-card {
          background: #fff;
          padding: 10px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .chart-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .chart-title {
          margin: 0;
          font-size: 1.1rem;
          flex-shrink: 0;
        }
        .chart-title.clickable {
          cursor: pointer;
        }
        .chart-title.clickable:hover {
          text-decoration: underline;
        }
        .chart-subtitle {
          color: #006400;
          font-size: 0.9rem;
          line-height: 1.2;
        }
        .zoom-button {
          margin-left: auto;
          background: none;
          border: none;
          cursor: pointer;
        }
        .aspect-ratio-box {
          position: relative;
          width: 100%;
          padding-top: 50%;
          overflow: hidden;
          border-radius: 6px;
        }
        .chart-container {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
        }
        .modal-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-content {
          position: relative;
          background: #fff;
          border-radius: 8px;
          padding: 2rem;
          width: 80vw;
          height: 80vh;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
        }
        .modal-close {
          position: absolute;
          top: 8px; right: 12px;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
        }
        .modal-chart {
          flex: 1; width: 100%; height: 100%; overflow: auto;
        }
        /* fullHeight 모드일 때 */
        .full-container {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        .full-container > * {
          flex: 1;
        }
      `}</style>
    </div>
  );
}
