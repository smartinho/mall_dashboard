// components/Timechart.jsx
import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import ChartCard from './ChartCard';
import Papa from 'papaparse';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function Timechart() {
  const [csvData, setCsvData] = useState([]);

  useEffect(() => {
    async function loadCsvFiles() {
      const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
      const promises = months.map(month =>
        fetch(`/data/modified_prices_${month}.csv`)
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
  }, []);

  const timeSeries = useMemo(() => {
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

  const traces = useMemo(() => {
    return timeSeries.map(({ brand, model, prices }) => {
      const months = Object.keys(prices).sort((a, b) => {
        const getMonthNum = m => parseInt(m.replace('월', ''));
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

  const layout = {
    autosize: true,
    margin: { l: 40, r: 20, t: 30, b: 40 },
    xaxis: { title: 'Month', automargin: true },
    yaxis: { title: 'Price [$]', automargin: true },
    hovermode: 'closest',
    title: 'Time Chart(Brand & Model)',
  };

  return (
      <Plot
        data={traces}
        layout={layout}
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
      />
  );
}