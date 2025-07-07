// components/Sidebar.js
import React from 'react';
import FilterPanel from './FilterPanel';

export default function Sidebar({ data = [], onFilter }) {
  return (
    <aside className="sidebar">
      <FilterPanel data={data} onFilter={onFilter} />
      <style jsx>{`
        .sidebar {
          flex: 0 0 150px;
          /* width: 240px; */
          padding: 1rem;
          background: #f5f5f5;
          border-right: 1px solid #ddd;
          overflow-y: auto;
        }
      `}</style>
    </aside>
  );
}
