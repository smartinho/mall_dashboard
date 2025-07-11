// components/Filter.jsx
import { useState, useRef, useEffect } from 'react';

export default function Filter({
  col,
  data = [],
  selectedValues = [],  // Parent에서 내려주는 체크된 값
  onChange,             // Parent에 변경된 값 전달
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // 메인 필터 고정 옵션
  const fixedOptionsMap = {
    Brand: ['Samsung', 'LG', 'TCL', 'Hisense'],
    'Screen Size': ['50', '55', '65', '70', '75'],
    'Display Type': ['LED', 'Mini-LED', 'OLED', 'QLED'],
    Resolution: ['4K UHD', 'FHD', 'HD'],
    Platform: ['Fire', 'Smart TV', 'Tizen', 'webOS'],
  }
  const fixedOptions = fixedOptionsMap[col] || null;

  // 데이터 기반 동적 옵션
  const dynamicOptions = Array.from(
    new Set(data.map(r => r[col] ?? '').filter(x => x))
  ).sort((a, b) =>
    a.toString().localeCompare(b.toString(), undefined, { numeric: true })
  );

  // 실제 표시할 옵션 (고정 옵션이 있으면 그것을, 아니면 동적 옵션)
  const options = fixedOptions || dynamicOptions;

  // 완전 컨트롤: 오직 selectedValues prop만이 체크 상태
  const selected = selectedValues;

  // 전체 토글
  const isAllChecked = options.length > 0 && selected.length === options.length;
  const toggleAll = () => {
    onChange(isAllChecked ? [] : options);
  };

  // 개별 토글
  const toggleValue = val => {
    const next = selected.includes(val)
      ? selected.filter(x => x !== val)
      : [...selected, val];
    onChange(next);
  };

  // 드롭다운 외부 클릭 시 닫기
  const wrapperRef = useRef();
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = e => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // 검색어 필터링
  const filtered = options.filter(v =>
    v.toLowerCase().includes(search.toLowerCase())
  );

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
        position: relative; 
        z-index: 1000; 
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
        position: absolute; 
        top: calc(100% + 4px); 
        left: 0; background: #fff; 
        color: #000; 
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
        .filter-all input { 
        margin-right: 8px; 
        width: 16px; 
        height: 16px;
         }
        .filter-list { 
        display: flex; 
        flex-direction: column; 
        gap: 4px;
        white-space: nowrap;  
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
        .no-results { 
        padding: 4px 8px; 
        color: #999; 
        font-size: 0.9rem; 
        }
      `}</style>
    </div>
  );
}