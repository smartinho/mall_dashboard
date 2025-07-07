// components/FilterPanel.jsx
import React, { useState } from 'react';
import Filter from './Filter';

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
    cols.forEach(col => onFilter(col, [])); // 빈 배열 전달 → no-filter 상태
    setClearCount(prev => prev + 1);
  };

  return (
    <div className="filter-panel">
      {cols.map(col => (
        <div key={`${col}-${clearCount}`} className="filter-item">
          <Filter
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
        .filter-item {
            width: 100%;
        }
        .filter-item :global(button) {
            width: 100% !important;
            box-sizing: border-box;
            /* 가운데 정렬 */
            display: inline-flex;
            justify-content: center;
        }
        .filter.clear-btn {
            width: 100%
            align-self: center;
            background: #FED7D7;
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
