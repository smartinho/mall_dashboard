// components/DisplayTypePriceScatter.jsx
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function DisplayTypePriceScatter({ data, width = '100%', height = '100%' }) {
  // 1) Guard
  if (!data || data.length === 0) {
    return <div style={{ padding: 20, textAlign: 'center' }}>No data</div>;
  }

  // 2) Keys
  const dispKey = 'Display Type';
  const priceKey = 'Price[$]';
  const brandKey = 'Brand';

  // 3) Group by Brand
  const brands = useMemo(() => {
    const map = {};
    data.forEach(row => {
      const brand = row[brandKey] || 'Unknown';
      const priceRaw = row[priceKey];
      let price = parseFloat(
        typeof priceRaw === 'string' ? priceRaw.replace(/[^0-9.]/g, '') : priceRaw
      );
      const disp = row[dispKey] || 'Unknown';
      if (isNaN(price)) return;
      if (!map[brand]) map[brand] = { x: [], y: [] };
      map[brand].x.push(price);
      map[brand].y.push(disp);
    });
    return map;
  }, [data]);

  // 4) Build traces
  const traces = useMemo(() => {
    return Object.entries(brands).map(([brand, coords]) => ({
      x: coords.x,
      y: coords.y,
      mode: 'markers',
      type: 'scatter',
      name: brand,
      marker: { size: 8, opacity: 0.7 },
      hovertemplate: `<b>${brand}</b><br>${dispKey}: %{y}<br>${priceKey}: %{x}<extra></extra>`,
    }));
  }, [brands]);

  // 5) Layout
  const layout = {
    autosize: true,
    margin: { l: 0, r: 0, t: 0, b: 20 },
    xaxis: {
      title: priceKey,
      automargin: true,
    },
    yaxis: {
      title: dispKey,
      automargin: true,
      type: 'category',
      automargin: true,
    },
    showlegend: false,
    legend: {
      orientation: 'v',
      x: 1.02,
      y: 1,
      xanchor: 'left',
      bordercolor: '#ccc',
      borderwidth: 1,
    },
    hovermode: 'closest',
  };

  return (
    <Plot
      data={traces}
      layout={layout}
      useResizeHandler
      style={{ width, height}}
      // config={{ displayModeBar: false }}
    />
  );
}
