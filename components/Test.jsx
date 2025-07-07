// components/ResolutionPriceBubble.jsx
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

// Plotly is loaded client-side only
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function ResolutionPriceBubble({
  data,
  width = '100%',
  height = '100%',
}) {
  if (!data || data.length === 0) {
    return <div style={{ padding: 20, textAlign: 'center' }}>No data</div>;
  }

  // 1) Aggregate by brand: count per resolution category and sum of prices
  const summary = useMemo(() => {
    const map = {};
    data.forEach((row) => {
      const brand = row.Brand || 'Unknown';
      const resCat = row.Resolution || 'Unknown';
      const priceRaw = row['Price[$]'];
      const price = parseFloat(
        typeof priceRaw === 'string' ? priceRaw.replace(/[^0-9.]/g, '') : priceRaw
      );
      if (isNaN(price)) return;
      if (!map[brand]) {
        map[brand] = { catCounts: {}, priceSum: 0, count: 0 };
      }
      map[brand].catCounts[resCat] = (map[brand].catCounts[resCat] || 0) + 1;
      map[brand].priceSum += price;
      map[brand].count += 1;
    });

    return Object.entries(map).map(([brand, { catCounts, priceSum, count }]) => {
      // Find most frequent resolution category for this brand
      let topCat = null;
      let maxCatCount = 0;
      for (const [cat, cnt] of Object.entries(catCounts)) {
        if (cnt > maxCatCount) {
          maxCatCount = cnt;
          topCat = cat;
        }
      }
      const avgPrice = priceSum / count;
      return { brand, resCat: topCat, count: maxCatCount, avgPrice };
    });
  }, [data]);

  // 2) Total count for sizing reference
  const totalCount = useMemo(
    () => summary.reduce((sum, e) => sum + e.count, 0),
    [summary]
  );

  // 3) Build scatter traces: x=avgPrice, y=resolution category
  const traces = useMemo(
    () =>
      summary.map((e) => {
        const ratio = e.count / totalCount;
        const size = Math.max(ratio * 100, 10); // size scaled [10..100]
        return {
          x: [e.avgPrice],
          y: [e.resCat],
          mode: 'markers',
          type: 'scatter',
          name: e.brand,
          marker: { size, sizemode: 'area', opacity: 0.8 },
          hovertemplate:
            `<b>${e.brand}</b><br>` +
            `Resolution Count: ${e.count}<br>` +
            `Avg Price: $${e.avgPrice.toFixed(2)}<extra></extra>`,
        };
      }),
    [summary, totalCount]
  );

  // 4) Layout with categorical y-axis
  const layout = {
    autosize: true,
    margin: { l: 0, r: 0, t: 5, b: 10 },
    xaxis: { title: 'Price [$]', automargin: true },
    yaxis: { title: 'Resolution', type: 'category', automargin: true },
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
    <div style={{ width, height }}>
      <Plot
        data={traces}
        layout={layout}
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
        config={{ displayModeBar: false }}
      />
    </div>
  );
}
