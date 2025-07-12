// components/DisplayTypeBrandBar.jsx
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const getColor = (index, total) => {
  const hue = Math.round((index / total) * 360) % 360;
  return `hsl(${hue}, 65%, 50%)`;
};

export default function DisplayTypePriceBar({ data, width = '100%', height = '100%' }) {
  const brands = useMemo(() => Array.from(new Set(data.map(d => d['Brand']))), [data]);
  const displayTypes = useMemo(() => Array.from(new Set(data.map(d => d['Display Type']))), [data]);

  const traces = useMemo(() => {
    return displayTypes.map((type, idx) => {
      const x = brands;
      const y = brands.map(brand => {
        const count = data.filter(d => d['Brand'] === brand && d['Display Type'] === type).length;
        return count;
      });

      return {
        type: 'bar',
        name: type,
        x,
        y,
        marker: { color: getColor(idx, displayTypes.length) },
        hovertemplate: `Brand: %{x}<br>Display Type: ${type}<br>Count: %{y}<extra></extra>`,
      };
    });
  }, [brands, displayTypes, data]);

  const layout = useMemo(() => ({
    autosize: true,
    barmode: 'group',
    margin: { l: 0, r: 0, t: 0, b: 10 },
    xaxis: {
      title: 'Brand',
      tickangle: 0,
      automargin: true,
    },
    yaxis: {
      title: 'Count',
      automargin: true,
    },
    showlegend: true,
    hovermode: 'closest',
  }), []);

  return (
    <Plot
      data={traces}
      layout={layout}
      style={{ width, height }}
      useResizeHandler={true}
      config={{ 
          displayModeBar: false,
          responsive: true
        }}
    />
  );
}
