import { useState } from 'react';
import FilterPanel from './FilterPanel';

export default function Sidebar({ data = [], onFilter }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="toggle-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Filters"
      >
        ☰
      </button>

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <FilterPanel data={data} onFilter={onFilter} />
      </aside>

      <style jsx>{`
        .toggle-button {
          display: none;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
        }

        .sidebar {
          flex: 0 0 150px;
          padding: 1rem;
          background: #f5f5f5;
          border-right: 1px solid #ddd;
          overflow-y: auto;
        }

        @media (max-width: 768px) {
          .toggle-button {
            display: block;
            position: fixed;
            color: white;
            top: 5rem;
            left: 1rem;
            z-index: 1100;
          }

          .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            width: 240px;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            z-index: 1000;
          }

          .sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
