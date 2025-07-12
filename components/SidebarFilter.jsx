// components/SidebarFilter.jsx
import { useState, useRef, useEffect } from 'react';

export default function SidebarFilter({
  col,
  data = [],
  selectedValues = [],
  onChange
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // 전체 드롭다운 목록: 데이터 기반 전체 옵션
  const options = Array.from(
    new Set(data.map(r => r[col] ?? '').filter(x => x))
  ).sort((a, b) =>
    a.toString().localeCompare(b.toString(), undefined, { numeric: true })
  );

  // 완전 컨트롤드: selectedValues prop을 단일 상태로 사용
  const selected = selectedValues;

  // 전체 선택/해제
  const isAll = options.length > 0 && selected.length === options.length;
  const toggleAll = () => onChange(isAll ? [] : options);

  // 개별 항목 토글
  const toggleValue = v => {
    const next = selected.includes(v)
      ? selected.filter(x => x !== v)
      : [...selected, v];
    onChange(next);
  };

  // 외부 클릭 시 드롭다운 닫기
  const ref = useRef();
  useEffect(() => {
    if (!open) return;
    const onClickOutside = e => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  // 검색어로 필터링
  const filtered = options.filter(v =>
    v.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="filter-wrapper" ref={ref}>
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
            <input type="checkbox" checked={isAll} onChange={toggleAll} /> All
          </label>

          <div className="filter-list">
            {filtered.length ? (
              filtered.map(v => (
                <label
                  key={v}
                  className={selected.includes(v) ? 'selected' : ''}
                >
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