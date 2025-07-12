import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_INDEX = MONTHS.reduce((acc, m, i) => { acc[m] = i + 1; return acc; }, {});
const COL_KEY_MAP = {
  'Q1[$]':'Q1','Q2[$]':'Q2','Q3[$]':'Q3','Q4[$]':'Q4',
  '전월比[$]':'prevMonthDiff','전분기比[$]':'prevQuarterDiff','전년比[$]':'prevYearDiff'
};

export default function SummaryTable({ data = [], selectedKey = null, onRowClick = () => {} }) {
  const [csvData, setCsvData] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    async function loadCsvFiles() {
      const promises = MONTHS.map(month =>
        fetch(`/data/Product_Data_${month}.csv`)
          .then(res => res.text())
          .then(text => ({ month, rows: Papa.parse(text, { header: true }).data }))
          .catch(() => null)
      );
      const results = await Promise.all(promises);
      setCsvData(results.filter(Boolean));
    }
    loadCsvFiles();
  }, []);

  const baseSeries = useMemo(() => {
    const map = {};
    csvData.forEach(({ month, rows }) =>
      rows.forEach(row => {
        const brand = row['Brand'];
        const model = row['Model Name'];
        const price = parseFloat((row['Price[$]']||'').replace(/[^0-9.\\-]/g,''));
        if (!brand || !model || isNaN(price)) return;
        const key = `${brand}__${model}`;
        if (!map[key]) {
          map[key] = {
            brand,
            model,
            screenSize: row['Screen Size'],
            displayType: row['Display Type'],
            prices: {}
          };
        }
        map[key].prices[month] = price;
      })
    );
    return Object.values(map);
  }, [csvData]);

  const filterKeys = useMemo(
    () => new Set(data.map(r => `${r['Brand']}__${r['Model Name']}`)),
    [data]
  );
  const series = useMemo(
    () => data.length ? baseSeries.filter(ts => filterKeys.has(`${ts.brand}__${ts.model}`)) : baseSeries,
    [baseSeries, filterKeys, data]
  );

  const summaryRows = useMemo(() => series.map(ts => {
    const prices = ts.prices;
    const quarters = [
      ['Jan','Feb','Mar'],
      ['Apr','May','Jun'],
      ['Jul','Aug','Sep'],
      ['Oct','Nov','Dec'],
    ].map((arr) => {
      const vals = arr.map(m => prices[m]).filter(v => v != null);
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    });

    const available = Object.keys(prices).sort((a, b) => MONTH_INDEX[a] - MONTH_INDEX[b]);
    const last = available.slice(-1)[0];
    const prevM = MONTHS[MONTH_INDEX[last] - 2];
    const prevMD = prevM && prices[prevM] != null ? prices[last] - prices[prevM] : null;

    const lastQ = Math.ceil(MONTH_INDEX[last] / 3);
    const prevQ = lastQ > 1 ? lastQ - 1 : null;
    const prevQD = prevQ && quarters[lastQ - 1] != null && quarters[prevQ - 1] != null
      ? quarters[lastQ - 1] - quarters[prevQ - 1]
      : null;

    return {
      brand: ts.brand,
      model: ts.model,
      screenSize: ts.screenSize,
      displayType: ts.displayType,
      Q1: quarters[0],
      Q2: quarters[1],
      Q3: quarters[2],
      Q4: quarters[3],
      prevMonthDiff: prevMD,
      prevQuarterDiff: prevQD,
      prevYearDiff: null,
    };
  }), [series]);

  const stats = useMemo(() => {
    const mins = {};
    const maxs = {};
    Object.values(COL_KEY_MAP).forEach(k => {
      const vals = summaryRows.map(r => r[k]).filter(v => v != null);
      mins[k] = vals.length ? Math.min(...vals) : null;
      maxs[k] = vals.length ? Math.max(...vals) : null;
    });
    return { mins, maxs };
  }, [summaryRows]);

  const cols = expanded
    ? ['Brand','Model Name','Screen Size','Display Type', ...Object.keys(COL_KEY_MAP)]
    : ['Model Name', ...Object.keys(COL_KEY_MAP)];

  return (
    <div className="summary-container">
      <button className="toggle-btn" onClick={() => setExpanded(e => !e)}>
        {expanded ? '-' : '+'}
      </button>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {cols.map(col => (
                <th key={col}>
                  {col}
                  {expanded && COL_KEY_MAP[col] && (
                    <div className="minmax">
                      Min: {stats.mins[COL_KEY_MAP[col]]?.toFixed(2)}
                      <br />
                      Max: {stats.maxs[COL_KEY_MAP[col]]?.toFixed(2)}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {summaryRows.map(r => {
              const key = `${r.brand}__${r.model}`;
              const sel = selectedKey === key;
              return (
                <tr key={key} className={sel ? 'selected' : ''} onClick={() => onRowClick(key)}>
                  {cols.map(col => {
                    if (['Brand','Model Name','Screen Size','Display Type'].includes(col)) {
                      const val =
                        col === 'Brand' ? r.brand :
                        col === 'Model Name' ? r.model :
                        col === 'Screen Size' ? r.screenSize :
                        r.displayType;
                      return <td key={col}>{val}</td>;
                    }
                    const k = COL_KEY_MAP[col];
                    const v = r[k];
                    let txt = '-'; let cls = '';
                    if (v != null) {
                      if (v < 0) { cls = 'negative'; txt = `△${Math.abs(v).toFixed(2)}`; }
                      else { txt = v.toFixed(2); }
                    }
                    return <td key={col} className={cls}>{txt}</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <style jsx>{`
        .summary-container { 
        position: relative; 
        width: 100%;
        display: flex;
        flex-direction: column;
        height: 100%;
        }
        .toggle-btn { 
        position: absolute; 
        top: 8px; 
        left: 8px; 
        background: none; 
        border: none; 
        font-size: 1.2rem; 
        cursor: pointer; 
        }
        .table-wrapper { 
        margin-top: 0; 
        overflow-x: auto; 
        overflow-y: auto; 
        max-height: 250px; 
        }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
        thead th { background: #f5f5f5; font-weight: bold; }
        tr:hover { background: #f0f8ff; cursor: pointer; }
        tr.selected { background: #ddeeff; }
        .minmax { display: block; font-size: 0.7em; color: #006400; margin-top: 4px; }
        .negative { color: red; }
      `}</style>
    </div>
  );
}
