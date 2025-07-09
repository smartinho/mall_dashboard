// components/MainFilter.jsx
import React from 'react';
import Filter from './Filter';

export default function MainFilter({ data = [], onFilter }) {
    const cols = [
        'Brand',
        'Screen Size',
        'Display Type',
        'Resolution',
      ];

    return (
        <div className="main-filter">
        {cols.map(col => (
            <div key={col} className="main-filter-item">
            <Filter
                col={col}
                data={data}
                onChange={vals => onFilter(col, vals)}
            />
            </div>
        ))}

        <style jsx>{`
            .main-filter {
            display: inline-flex;
            gap: 12px;
            padding: 0;
            }
            .main-filter-item {
            flex: 1;
            }
            .main-filter-item :global(button) {
            width: 100% !important;
            box-sizing: border-box;
            display: inline-flex;
            justify-content: center;
            }
        `}</style>
        </div>
    );
}
