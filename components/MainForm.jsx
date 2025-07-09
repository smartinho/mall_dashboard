// components/MainForm.js
import React from 'react';
import MainFilter from './MainFilter';

export default function MainForm({ data = [], onFilter }) {
  return (
    <aside className="mainform">
      <MainFilter data={data} onFilter={onFilter} />
      <style jsx>{`
        .mainform {
          display: flex;
          flex-direction: row;
          width: 100%;
          padding: 0.3rem;
          align-items: center;
          justify-content: center;
          background: #fafafa;
          border-bottom: 1px solid #ddd;
        }
      `}</style>
    </aside>
  );
}