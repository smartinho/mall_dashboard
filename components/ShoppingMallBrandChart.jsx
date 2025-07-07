// components/ShoppingMallBrandChart.jsx
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

// Plotly.js 클라이언트 전용 로드 (SSR 비활성화)
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

// HSL 기반 고유 색상 생성
const getColor = (index, total) => {
  const hue = Math.round((index / total) * 1500) % 360;
  return `hsl(${hue}, 65%, 50%)`;
};

export default function ShoppingMallBrandChart({
  data,
  // ChartCard의 cloneElement에서 넘겨줄 width/height props 받기
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
      brands.sort(
        (a, b) => (totalByBrand[b] || 0) - (totalByBrand[a] || 0)
      ),
    [brands, totalByBrand]
  );

  // 3) Plotly trace 생성 (브랜드별 하나씩)
  const traces = useMemo(
    () =>
      sortedBrands.map((brand, idx) => ({
        type: 'bar',
        name: brand,
        x: malls.map(m =>
          data.filter(
            d => d['Shopping Mall'] === m && d['Brand'] === brand
          ).length
        ),
        y: malls,
        orientation: 'h',
        marker: { color: getColor(idx, sortedBrands.length) },
        hovertemplate:
          `<b>%{y}</b><br>` +
          `Brand: ${brand}<br>` +
          `Count: %{x}` +
          `<extra></extra>`,
      })),
    [sortedBrands, malls, data]
  );

  // 4) 레이아웃 설정
  const layout = useMemo(
    () => ({
      barmode: 'stack',
      margin: { l: 0, r: 0, t: 0, b: 20 },
      xaxis: { showgrid: true, zeroline: true, title: '' },
      yaxis: { automargin: true, title: '' },
      showlegend: false,
      hovermode: 'closest',
    }),
    []
  );

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
