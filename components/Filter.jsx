// components/Filter.jsx
import { useState, useRef, useEffect } from 'react';

export default function Filter({ col, data = [], onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const wrapperRef = useRef();

  // 외부 클릭 시 드롭다운 닫기
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

  // 옵션 목록(중복 제거 + 정렬)
  const options = Array.from(
    new Set(data.map(r => r[col] ?? '').filter(x => x))
  ).sort((a, b) =>
    a.toString().localeCompare(b.toString(), undefined, { numeric: true })
  );

  // 검색어에 따른 필터링
  const filtered = options.filter(v =>
    v.toString().toLowerCase().includes(search.toLowerCase())
  );

  // 개별 값 토글
  const toggleValue = val => {
    let next;
    if (selected.includes(val)) {
      next = selected.filter(x => x !== val);
    } else {
      next = [...selected, val];
    }
    setSelected(next);
    onChange(next);
  };

  // 전체 선택/해제 토글
  const isAllChecked = options.length > 0 && selected.length === options.length;
  const toggleAll = () => {
    if (isAllChecked) {
      setSelected([]);
      onChange([]);
    } else {
      setSelected(options);
      onChange(options);
    }
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

          {/* All Check / All Clear을 합친 토글 체크박스 */}
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
        .filter-wrapper {
          margin-bottom: 8px;
        }
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
        .filter-button.active {
          background: #38a169;
        }
        .filter-dropdown {
          margin-top: 4px;
          background: #fff;
          border: 1px solid #cbd5e0;
          border-radius: 8px;
          padding: 8px;
          max-height: 240px;
          overflow-y: auto;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
        .filter-all input {
          margin-right: 8px;
          width: 16px;
          height: 16px;
        }
        .filter-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .filter-list label {
          display: flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
        }
        .filter-list label.selected {
          background: #bee3f8;
        }
        .filter-list input {
          margin-right: 8px;
        }
        .no-results {
          padding: 4px 8px;
          color: #999;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
