// components/Filter.jsx
import { useState, useRef, useEffect } from 'react';

// 메인 필터 전용 Filter 컴포넌트
export default function Filter({ col, data = [], onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // 고정 옵션 정의
  const fixedOptionsMap = {
    Brand: ['Samsung', 'LG', 'TCL', 'Hisense', 'VIZIO'],
    'Screen Size': ['32', '43', '50', '55', '65', '70', '75', '85', '100'],
  };

  const fixedOptions = fixedOptionsMap[col] || null;
  const dynamicOptions = Array.from(
    new Set(data.map(r => r[col] ?? '').filter(x => x))
  ).sort((a, b) =>
    a.toString().localeCompare(b.toString(), undefined, { numeric: true })
  );
  const options = fixedOptions || dynamicOptions;

  const [selected, setSelected] = useState(
    () => (fixedOptions ? [...fixedOptions] : [])
  );

  useEffect(() => {
    if (fixedOptions && data.length) {
      setSelected(fixedOptions);
      onChange(fixedOptions);
    }
  }, [data]);

  const wrapperRef = useRef();
  useEffect(() => {
    if (!open) return;
    const onClickOutside = e => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const filtered = options.filter(v =>
    v.toString().toLowerCase().includes(search.toLowerCase())
  );

  const toggleValue = val => {
    const next = selected.includes(val)
      ? selected.filter(x => x !== val)
      : [...selected, val];
    setSelected(next);
    onChange(next);
  };

  const isAllChecked = options.length > 0 && selected.length === options.length;
  const toggleAll = () => {
    const next = isAllChecked ? [] : options;
    setSelected(next);
    onChange(next);
  };

  return (
    <div className="filter-wrapper" ref={wrapperRef}>
      <button
        className={`filter-button ${open || selected.length ? 'active' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        {col}
      </button>

      {open && (
        <div className="filter-dropdown">
          <input
            type="text"
            className="filter-search"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <label className="filter-all">
            <input checked={isAllChecked} onChange={toggleAll} type="checkbox" />
            All
          </label>

          <div className="filter-list">
            {filtered.length ? (
              filtered.map(v => (
                <label key={v} className={selected.includes(v) ? 'selected' : ''}>
                  <input
                    type="checkbox"
                    checked={selected.includes(v)}
                    onChange={() => toggleValue(v)}
                  />
                  {v}
                </label>
              ))
            ) : (
              <div className="no-results">No results</div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .filter-wrapper { position: relative; z-index: 1000; }
        .filter-button {
          width: 100%;
          padding: 6px 12px;
          background: #3182ce;
          color: #fff;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          text-align: left;
          white-space: nowrap;
        }
        .filter-button.active { background: #38a169; }
        .filter-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          background: #fff;color: #000;
          border: 1px solid #cbd5e0;
          border-radius: 8px;
          padding: 8px;
          max-height: 240px;
          overflow-y: auto;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .filter-search {
          width: calc(100% - 16px);
          padding: 4px 8px;
          margin-bottom: 8px;
          border: 1px solid #cbd5e0;
          border-radius: 4px;
        }
        .filter-all {
          display: flex;
          align-items: center;
          padding: 4px 8px;
          margin-bottom: 8px;
          font-size: 0.9rem;
          cursor: pointer;
        }
        .filter-all input { margin-right: 8px; width: 16px; height: 16px; }
        .filter-list { display: flex; flex-direction: column; gap: 4px; }
        .filter-list label {
          display: flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
        }
        .filter-list label.selected { background: #bee3f8; }
        .filter-list input { margin-right: 8px; }
        .no-results {
          padding: 4px 8px;
          color: #999;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
