// components/Sidebar.jsx
import FilterPanel from './FilterPanel';

export default function Sidebar({
  data = [],
  onFilter,
  filterSelections = {},
  isOpen,
  onClose
}) {
  if (!isOpen) return null;

  return (
    <div className="sidebar-wrapper">
      <div className="sidebar">
        <button
          className="close-button"
          onClick={onClose}
          aria-label="Close Sidebar"
        >
          ◀
        </button>
        <div className="filter-container">
          <FilterPanel
            data={data}
            onFilter={onFilter}
            filterSelections={filterSelections}
          />
        </div>
      </div>

      <style jsx>{`
        .sidebar-wrapper { display: inline-block; }
        .sidebar {
          background: #f5f5f5;
          border: 1px solid #ddd;
          padding: 2.5rem 1rem 1rem 1rem;
          border-radius: 8px;
          box-shadow: 2px 2px 8px rgba(0,0,0,0.1);
          position: relative;
          z-index: 100;
          min-width: 180px;
        }
        .close-button {
          position: absolute;
          top: 8px;
          right: 8px;
          color: black;
          border: none;
          font-size: 1rem;
          padding: 0.4rem 0.8rem;
          border-radius: 50%;
          cursor: pointer;
          z-index: 101;
        }
        .filter-container { margin-top: 0.5rem; }
      `}</style>
    </div>
  );
}