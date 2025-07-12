// components/InchPriceBoxPlot.jsx
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function InchPriceBoxPlot({
  data,
  width = '100%',
  height = '100%',
}) {
  // 1) No data guard
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        No data
      </div>
    );
  }

  // 2) Column names
  const inchKey = 'Screen Size';
  const priceKey = 'Price[$]';

  // 3) Group prices by inch
  const groups = useMemo(() => {
    const map = {};
    data.forEach(row => {
      const inch = parseFloat(row[inchKey]);
      const price = parseFloat(
        typeof row[priceKey] === 'string'
          ? row[priceKey].replace(/[^0-9.]/g, '')
          : row[priceKey]
      );
      if (isNaN(inch) || isNaN(price)) return;
      map[inch] = map[inch] || [];
      map[inch].push(price);
    });
    return Object.entries(map)
      .map(([inch, prices]) => ({ inchLabel: `${inch}"`, prices }))
      .sort((a, b) => parseFloat(a.inchLabel) - parseFloat(b.inchLabel));
  }, [data]);

  // 4) Build one trace per inch
  const traces = useMemo(
    () =>
      groups.map(({ inchLabel, prices }) => ({
        type: 'box',
        orientation: 'h',
        name: inchLabel,
        x: prices,
        y: Array(prices.length).fill(inchLabel),
        boxpoints: 'outliers',
        marker: { opacity: 0.6 },
        line: { width: 1 },
        hovertemplate:
          `<b>${inchLabel}</b><br>Price: %{x}<extra></extra>`,
      })),
    [groups]
  );

  // 5) Responsive layout with margins
  const layout = useMemo(() => ({
    autosize: true,
    margin: { l: 0, r: 0, t: 0, b: 20 },
    xaxis: { title: 'Price [$]', automargin: true },
    yaxis: { title: 'Screen Size (Inch)', automargin: true },
    showlegend: false,
    autosize: true,
    hovermode: 'closest',
  }), []);

  return (
      <Plot
        data={traces}
        layout={layout}
        useResizeHandler
        style={{ width, height}}
        config={{ 
          displayModeBar: false,
          responsive: true
        }}
      />
  );
}
