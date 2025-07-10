import FilterPanel from './FilterPanel';

export default function Sidebar({ data = [], onFilter, isOpen, onClose }) {
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
          <FilterPanel data={data} onFilter={onFilter} />
        </div>
      </div>

      <style jsx>{`
        .sidebar-wrapper {
          display: inline-block;
        }

        .sidebar {
          background: #f5f5f5;
          border: 1px solid #ddd;
          padding: 2.5rem 1rem 1rem 1rem; /* 상단 패딩 추가로 닫기 버튼 공간 확보 */
          border-radius: 8px;
          box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
          position: relative;
          z-index: 100;
          min-width: 180px;
        }

        .close-button {
          position: absolute;
          top: 8px;
          right: 8px;
          // background: #0c011b;
          color: black;
          border: none;
          font-size: 1rem;
          padding: 0.4rem 0.8rem;
          border-radius: 50%;
          cursor: pointer;
          z-index: 101;
        }

        .filter-container {
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}
