// components/FilterPanel.jsx
import React, { useState } from 'react';
import SidebarFilter from './SidebarFilter';

export default function FilterPanel({ data = [], onFilter }) {
  const cols = [
    'Shopping Mall',
    'Brand',
    'Model Name',
    'Screen Size',
    'Display Type',
    'Resolution',
    'Refresh Rate',
    'Brightness',
    'Platform',
    'Price[$]'
  ];

  const [clearCount, setClearCount] = useState(0);
  const handleClearAll = () => {
    cols.forEach(col => onFilter(col, []));
    setClearCount(c => c + 1);
  };

  return (
    <div className="filter-panel">
      {cols.map(col => (
        <div key={`${col}-${clearCount}`} className="filter-item">
          <SidebarFilter
            col={col}
            data={data}
            onChange={vals => onFilter(col, vals)}
          />
        </div>
      ))}
      
      <button className="filter clear-btn" onClick={handleClearAll}>
        All Clear
      </button>

      <style jsx>{`
        .filter-panel {
          margin-bottom: 1rem;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
          max-height: calc(100vh - 120px);
          padding: 8px 0;
        }
        .clear-btn {
          width: 100%;
          background: #fed7d7;
          color: #721c24;
          padding: 6px 12px;
          border-radius: 50px;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
