// components/ShoppingMallBrandChart.jsx
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

// HSL 기반 고유 색상 생성
const getColor = (index, total) => {
  const hue = Math.round((index / total) * 2000) % 360;
  return `hsl(${hue}, 65%, 50%)`;
};

export default function ShoppingMallBrandChart({
  data,
  width = '100%',
  height = '100%',
}) {
  // 1) 쇼핑몰, 브랜드 목록
  const malls = useMemo(
    () => Array.from(new Set(data.map(d => d['Shopping Mall']))),
    [data]
  );
  const brands = useMemo(
    () => Array.from(new Set(data.map(d => d['Brand']))),
    [data]
  );

  // 2) 브랜드별 총 카운트 → 내림차순 정렬
  const totalByBrand = useMemo(() => {
    const map = {};
    data.forEach(({ Brand }) => {
      map[Brand] = (map[Brand] || 0) + 1;
    });
    return map;
  }, [data]);
  const sortedBrands = useMemo(
    () =>
      [...brands].sort(
        (a, b) => (totalByBrand[b] || 0) - (totalByBrand[a] || 0)
      ),
    [brands, totalByBrand]
  );

  // 3) 쇼핑몰별 총합 계산 (각 막대 위에 표시할 라벨)
  const totals = useMemo(
    () =>
      malls.map(
        m => data.filter(d => d['Shopping Mall'] === m).length
      ),
    [malls, data]
  );

  // 4) Plotly trace 생성 (브랜드별 하나씩, 세로 방향)
  const traces = useMemo(
    () =>
      sortedBrands.map((brand, idx) => ({
        type: 'bar',
        name: brand,
        x: malls,
        y: malls.map(m =>
          data.filter(
            d => d['Shopping Mall'] === m && d['Brand'] === brand
          ).length
        ),
        marker: { color: getColor(idx, sortedBrands.length) },
        hovertemplate:
          `<b>%{x}</b><br>` +
          `Brand: ${brand}<br>` +
          `Count: %{y}` +
          `<extra></extra>`,
      })),
    [sortedBrands, malls, data]
  );

  // 5) 레이아웃 설정 (수직 누적 + 라벨)
  const layout = useMemo(() => ({
    autosize: true,
    barmode: 'stack',
    margin: { l: 20, r: 20, t: 0, b: 10 },
    xaxis: {
      title: '',
      tickangle: 0,
      automargin: true,
    },
    yaxis: {
      title: '',
      showgrid: true,
      zeroline: true,
    },
    showlegend: false,
    hovermode: 'closest',
    annotations: malls.map((m, i) => ({
      x: m,
      y: totals[i],
      text: totals[i].toString(),
      xanchor: 'center',
      yanchor: 'bottom',
      showarrow: false,
      font: { size: 12 },
    })),
  }),
  [malls, totals]
  );

  return (
    <Plot
      data={traces}
      layout={layout}
      useResizeHandler
      style={{ width, height }}
      config={{ 
          displayModeBar: false,
          responsive: true
        }}
    />
  );
}
