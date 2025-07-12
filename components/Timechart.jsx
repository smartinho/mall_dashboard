import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Papa from 'papaparse';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function Timechart({ data = [], selectedKey = null }) {
  const [csvData, setCsvData] = useState([]);

  // ▶ CSV는 마운트 시 한 번만 로드합니다.
  useEffect(() => {
    async function loadCsvFiles() {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const results = await Promise.all(
        months.map(month =>
          fetch(`/data/Product_Data_${month}.csv`)
            .then(res => res.text())
            .then(text => ({ month, rows: Papa.parse(text, { header: true }).data }))
        )
      );
      setCsvData(results);
    }
    loadCsvFiles();
    window.dispatchEvent(new Event('resize'));
  }, []);

  // ▶ Brand__Model 에 매핑된 가격 시리즈 생성
  const baseSeries = useMemo(() => {
    const map = {};
    csvData.forEach(({ month, rows }) => {
      rows.forEach(row => {
        const brand = row['Brand'];
        const model = row['Model Name'];
        const price = parseFloat((row['Price[$]']||'').replace(/[^0-9.]/g, ''));
        if (!brand || !model || isNaN(price)) return;
        const key = `${brand}__${model}`;
        if (!map[key]) map[key] = { brand, model, prices: {} };
        map[key].prices[month] = price;
      });
    });
    return Object.values(map);
  }, [csvData]);

  // ▶ 필터링된 data 를 기준으로 표시할 시리즈 결정
  const filterKeys = useMemo(
    () => new Set(data.map(r => `${r['Brand']}__${r['Model Name']}`)),
    [data]
  );
  const timeSeries = useMemo(() => {
    if (!data.length) return baseSeries;
    return baseSeries.filter(ts => filterKeys.has(`${ts.brand}__${ts.model}`));
  }, [baseSeries, filterKeys, data]);

  // ▶ Plotly trace 생성
  const traces = useMemo(() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return timeSeries.map(({ brand, model, prices }) => ({
      x: months,
      y: months.map(m => prices[m] ?? null),
      name: `${brand} ${model}`,
      type: 'scatter',
      mode: 'lines+markers',
      hovertemplate: `<b>${brand} ${model}</b><br>%{x}: %{y}<extra></extra>`
    }));
  }, [timeSeries]);

  // ▶ 선택된 시리즈만 보이게, text 레이블 추가
  const displayTraces = useMemo(() => {
    if (selectedKey) {
      const target = selectedKey.replace('__', ' ');
      return traces.map(trace => trace.name === target
        ? {
            ...trace,
            mode: 'lines+markers+text',
            text: trace.y.map(v => (v!=null ? v.toFixed(2) : '')),
            textposition: 'top center'
          }
        : { ...trace, visible: 'legendonly' }
      );
    }
    return traces;
  }, [traces, selectedKey]);

  const layout = useMemo(() => ({
    autosize: true,
    margin: { l:0, r:0, t:40, b:20 },
    xaxis: { title: 'Month', automargin: true },
    yaxis: { title: 'Price [$]', automargin: true },
    hovermode: 'closest',
    title: 'Time Chart(Brand & Model)',
    showlegend: false,
  }), []);

  return (
    <div className="timechart-wrapper">
      <Plot
        data={displayTraces}
        layout={layout}
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
      />
      <style jsx>{`
        .timechart-wrapper {
          flex: 1;
          width: 100%;
          height: 100%;
          position: relative;
        }
        /* Legend 스크롤 유지 */
        .timechart-wrapper :global(.legend) {
          overflow-x: auto;
          overflow-y: auto;
          max-height: 60px;
        }
      `}</style>
    </div>
  );
}
