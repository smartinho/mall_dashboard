// components/Timechart.jsx
import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Papa from 'papaparse';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function Timechart({ data = [] }) {
  const [csvData, setCsvData] = useState([]);

  // 기존 CSV 로딩은 data prop이 비어있을 때만 실행
  useEffect(() => {
    if (data && data.length > 0) return;
    async function loadCsvFiles() {
      const months = [
        '1월','2월','3월','4월','5월','6월',
        '7월','8월','9월','10월','11월','12월'
      ];
      const promises = months.map(month =>
        fetch(`/data/Product_Data_${month}.csv`)
          .then(res => res.text())
          .then(text => {
            const parsed = Papa.parse(text, { header: true });
            return { month, rows: parsed.data };
          })
          .catch(() => null)
      );
      const results = await Promise.all(promises);
      setCsvData(results.filter(Boolean));
    }
    loadCsvFiles();
  }, [data]);

  // CSV 데이터로부터 월별 시계열 생성
  const baseSeries = useMemo(() => {
    const map = {};
    csvData.forEach(({ month, rows }) => {
      rows.forEach(row => {
        const brand = row['Brand'];
        const model = row['Model Name'];
        const priceStr = row['Price[$]'];
        if (!brand || !model || !priceStr) return;
        const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
        if (isNaN(price)) return;
        const key = `${brand}__${model}`;
        map[key] = map[key] || { brand, model, prices: {} };
        map[key].prices[month] = price;
      });
    });
    return Object.values(map);
  }, [csvData]);

  // MainFilter로부터 전달된 data에서 남길 key 집합
  const filterKeys = useMemo(() => {
    return new Set(data.map(r => `${r['Brand']}__${r['Model Name']}`));
  }, [data]);

  // 필터링된 시리즈
  const timeSeries = useMemo(() => {
    if (!data.length) return baseSeries;
    return baseSeries.filter(ts => filterKeys.has(`${ts.brand}__${ts.model}`));
  }, [baseSeries, filterKeys, data.length]);

  // Plotly trace 생성
  const traces = useMemo(() => {
    return timeSeries.map(({ brand, model, prices }) => {
      const months = Object.keys(prices).sort((a, b) => {
        const getMonthNum = m => parseInt(m.replace('월', ''), 10);
        return getMonthNum(a) - getMonthNum(b);
      });
      return {
        type: 'scatter',
        mode: 'lines+markers',
        name: `${brand} ${model}`,
        x: months,
        y: months.map(m => prices[m]),
        hovertemplate: `<b>${brand} ${model}</b><br>%{x}: %{y}<extra></extra>`,
      };
    });
  }, [timeSeries]);

  // 레이아웃: legend를 하단 중앙에, 가로 배치, 3열 분할 분위기
  const layout = {
    autosize: true,
    margin: { l: 0, r: 0, t: 0, b: 20 },
    xaxis: { title: 'Month', automargin: true },
    yaxis: { title: 'Price [$]', automargin: true },
    hovermode: 'closest',
    title: 'Time Chart(Brand & Model)',
    showlegend: false,
    legend: {
      orientation: 'h',
      x: 0.5,
      xanchor: 'center',
      y: -0.2,
      yanchor: 'top',
      traceorder: 'normal',
      itemwidth: '100%',
      font: { size: 10 },
    },
  };

  return (
    <div className="timechart-wrapper">
      <Plot
        data={traces}
        layout={layout}
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
      />
      <style jsx>{`
        .timechart-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
        }
        /* Plotly 내부 legend 컨테이너 스크롤 허용 */
        .timechart-wrapper :global(.legend) {
          overflow-x: auto;
          overflow-y: auto;
          max-height: 60px;
        }
      `}</style>
    </div>
  );
}
