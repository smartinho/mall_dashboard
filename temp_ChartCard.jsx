// components/ChartCard.jsx
import { useState, cloneElement } from 'react';
import { ZoomIn } from 'lucide-react';

export default function ChartCard({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);

  const renderModalChild = () =>
    cloneElement(children, {
      width: '100%',
      height: '100%',
      style: { width: '100%', height: '100%' },
      limit: undefined,
    });

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>{title}</h3>
        <button className="zoom-btn" onClick={() => setIsOpen(true)} aria-label="Zoom Chart">
          <ZoomIn size={20} />
        </button>
      </div>
      <div className="chart-content">{children}</div>
      {isOpen && (
        <div className="modal-backdrop" onClick={() => setIsOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsOpen(false)} aria-label="Close">×</button>
            <div className="modal-chart">{renderModalChild()}</div>
          </div>
        </div>
      )}

      <style jsx>{`
        .chart-card {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 8px;
          min-height: 300px;
          // hight: 100%;
          // width: 100%;
          display: flex;
          flex-direction: column;
        }
        .chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #eee;
        }
        .chart-header h3 {
          margin: 0;
          font-size: 1.1rem;
          color: #333;
        }
        .zoom-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #555;
        }
        .zoom-btn:hover {
          color: #000;
        }
        .chart-content {
          flex: 1;
          padding: 1rem;
          // overflow: hidden;
          // width: 100%;
          // height: 100%;
        }
        .modal-backdrop {
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
        }
      `}</style>
    </div>
  );
}
