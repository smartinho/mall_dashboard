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
                display: flex;
                gap: 12px;
                align-items: center;
                height: 2rem;     
            }
            .main-filter-item {
                min-width: 140px;
                max-width: 140px;                
            }
            .main-filter-item :global(button) {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 2rem;
                padding: 0 1rem;
                font-size: 1rem;
                border-radius: 20px;
                border: none;
                background: #228be6;
                color: white;
            }
        `}</style>
        </div>
    );
}
