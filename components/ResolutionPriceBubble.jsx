// components/ResolutionPriceBubble.jsx
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function ResolutionPriceBubble({
  data,
  width = '100%',
  height = '100%',
}) {
  if (!data || data.length === 0) {
    return <div style={{ padding: 20, textAlign: 'center' }}>No data</div>;
  }

  // 모든 해상도 카테고리 수집 (y축 고정용)
  const allResCats = useMemo(() =>
    Array.from(new Set(data.map(row => row.Resolution).filter(Boolean))),
    [data]
  );

  // 브랜드별 해상도 카운트 및 평균 가격 계산
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
  
      const key = `${brand}__${resCat}`;
      if (!map[key]) {
        map[key] = { brand, resCat, priceSum: 0, count: 0 };
      }
      map[key].priceSum += price;
      map[key].count += 1;
    });
  
    return Object.values(map).map(({ brand, resCat, priceSum, count }) => ({
      brand,
      resCat,
      count,
      avgPrice: priceSum / count,
    }));
  }, [data]);  

  const totalCount = useMemo(
    () => summary.reduce((sum, e) => sum + e.count, 0),
    [summary]
  );

  const traces = useMemo(
    () =>
      summary.map((e) => {
        const ratio = e.count / totalCount;
        const size = Math.max(ratio * 100, 10);
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

  const layout = {
    autosize: true,
    margin: { l: 0, r: 0, t: 0, b: 20 },
    xaxis: { title: 'Price [$]', automargin: true },
    yaxis: {
      title: 'Resolution',
      type: 'category',
      categoryorder: 'array',
      categoryarray: allResCats,
      automargin: true,
    },
    showlegend: false,
    hovermode: 'closest',
  };

  return (
    <Plot
      data={traces}
      layout={layout}
      useResizeHandler
      style={{ width, height }}
    />
  );
}

