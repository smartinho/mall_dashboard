// components/SidebarFilter.jsx
import { useState, useRef, useEffect } from 'react';

export default function SidebarFilter({ col, data = [], onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  // 사이드바 전용 고정 옵션 (메인 필터 우선 적용)
  const fixedOptionsMap = {
    Brand: ['Samsung', 'LG', 'TCL', 'Hisense', 'Sony', 'VIZIO', 'Roku'],
    'Screen Size': ['32', '43', '50', '55', '65', '70', '75', '85', '100'],
  };
  const fixedOptions = fixedOptionsMap[col] || null;

  // 데이터 기반 옵션
  const options = Array.from(
    new Set(data.map(r => r[col] ?? '').filter(x => x))
  ).sort((a, b) =>
    a.toString().localeCompare(b.toString(), undefined, { numeric: true })
  );

  // 검색어에 따른 필터링
  const filtered = options.filter(v =>
    v.toString().toLowerCase().includes(search.toLowerCase())
  );

  // 사이드바 선택 변경 시 메인 필터 고정 옵션 우선 로직
  const applyChange = vals => {
    const next = (fixedOptions && vals.length === 0)
      ? fixedOptions
      : vals;
    setSelected(next);
    onChange(next);
  };

  // 선택 상태
  const [selected, setSelected] = useState(
    () => fixedOptions ? [...fixedOptions] : []
  );
  
  // 외부 클릭 시 닫기
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

  const toggleValue = val => {
    const vals = selected.includes(val)
      ? selected.filter(x => x !== val)
      : [...selected, val];
    applyChange(vals);
  };

  const isAllChecked = options.length > 0 && selected.length === options.length;
  const toggleAll = () => {
    if (isAllChecked) applyChange([]);
    else applyChange(options);
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
            <input
              type="checkbox"
              checked={isAllChecked}
              onChange={toggleAll}
            />
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
        .filter-wrapper { margin-bottom: 12px; }
        .filter-button { width: 100%; padding: 6px 12px; background: #3182ce; color: #fff; border: none; border-radius: 50px; cursor: pointer; text-align: center; }
        .filter-button.active { background: #38a169; }
        .filter-dropdown { position: static; margin-top: 4px; background: #fff; border: 1px solid #ddd; border-radius: 4px; padding: 8px; max-height: 200px; overflow-y: auto; }
        .filter-search { width: 100%; padding: 4px 8px; margin-bottom: 8px; border: 1px solid #ddd; border-radius: 4px; }
        .filter-all { display: flex; align-items: center; margin-bottom: 8px; font-size: 0.9rem; }
        .filter-all input { margin-right: 8px; }
        .filter-list { display: flex; flex-direction: column; gap: 4px; }
        .filter-list label { display: flex; align-items: center; padding: 4px 8px; border-radius: 4px; cursor: pointer; }
        .filter-list label.selected { background: #eef; }
        .no-results { padding: 4px 8px; color: #999; font-size: 0.9rem; }
      `}</style>
    </div>
  );
}
