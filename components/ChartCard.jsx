// components/ChartCard.jsx
import { useState, cloneElement } from 'react';
import { ZoomIn } from 'lucide-react';

export default function ChartCard({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);

  const renderModalChild = () =>
    cloneElement(children, {
      style: { width: '100%', height: '100%' },
      // useResizeHandler: true,
      limit: undefined,
    });

  return (
    <div className="chart-card">
      {/* 제목 + 아이콘 정렬 */}
      <div className="chart-header">
        <h4 className="chart-title">{title}</h4>
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Zoom Chart"
          className="zoom-button"
        >
          <ZoomIn size={20} />
        </button>
      </div>

      {/* 4:3 비율 박스 */}
      <div className="aspect-ratio-box">
        <div className="chart-container">
          {children}
        </div>
      </div>

      {/* 모달 */}
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
            <div className="modal-chart">
              {renderModalChild()}
            </div>
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
          justify-content: space-between;
          align-items: center;
        }

        .chart-title {
          margin: 0;
        }

        .zoom-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          color: #555;
        }
        .zoom-button:hover {
          color: #000;
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
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
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
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
        }
        .modal-close {
          position: absolute;
          top: 8px;
          right: 12px;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
        }
        .modal-chart {
          flex: 1;
          width: 100%;
          height: 100%;
          overflow: auto;
        }
      `}</style>
    </div>
  );
}
