import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });
const getColor = (i, total) => `hsl(${Math.round((i / total) * 360)},65%,50%)`;

export default function BrandDisplayTypePie({
  data,
  width = '100%',
  height = '100%',
  limit,
}) {
  if (!Array.isArray(data) || data.length === 0) {
    return <div style={{ padding: 20, textAlign: 'center' }}>No data</div>;
  }

  const brandMap = useMemo(() => {
    const m = {};
    data.forEach(({ Brand, 'Display Type': dt }) => {
      if (!Brand || !dt) return;
      m[Brand] ||= {};
      m[Brand][dt] = (m[Brand][dt] || 0) + 1;
    });
    return m;
  }, [data]);

  const entries = useMemo(() => {
    return Object.entries(brandMap)
      .map(([brand, dtMap]) => ({
        brand,
        dtMap,
        count: Object.values(dtMap).reduce((a, v) => a + v, 0),
      }))
      .sort((a, b) => b.count - a.count);
  }, [brandMap]);

  const isGrid = limit == null;
  const displayEntries = isGrid ? entries : entries.slice(0, limit);

  const allDT = useMemo(
    () => Array.from(new Set(data.map(r => r['Display Type']).filter(Boolean))),
    [data]
  );
  const colorMap = useMemo(() => {
    const cm = {};
    allDT.forEach((dt, i) => {
      cm[dt] = getColor(i, allDT.length);
    });
    return cm;
  }, [allDT]);

  const traces = [];
  const annotations = [];

  if (isGrid) {
    const N = displayEntries.length;
    const cols = Math.min(10, N);
    const rows = Math.ceil(N / cols);
    const cw = 1 / cols;
    const ch = 1 / rows;
    const gapX = 0.02;
    const gapY = 0.05;
    const maxCount = Math.max(...displayEntries.map(e => e.count));

    displayEntries.forEach((e, idx) => {
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      const cx = col * cw + cw / 2;
      const cy = 1 - (row * ch + ch / 2);
      const w = cw - gapX;
      const h = ch - gapY;
      const x0 = cx - w / 2;
      const x1 = cx + w / 2;
      const y0 = cy - h / 2;
      const y1 = cy + h / 2;

      traces.push({
        type: 'pie',
        labels: Object.keys(e.dtMap),
        values: Object.values(e.dtMap),
        marker: { colors: Object.keys(e.dtMap).map(d => colorMap[d]) },
        domain: { x: [x0, x1], y: [y0, y1] },
        hovertemplate:
          `<b>${e.brand}</b><br>` +
          `%{label}: %{value} (%{percent})<extra></extra>`,
        textinfo: 'none',
        showlegend: false,
      });

      annotations.push({
        text: `${e.brand} (${e.count})`,
        x: cx,
        y: y0 - 0.01,
        xref: 'paper',
        yref: 'paper',
        xanchor: 'center',
        yanchor: 'top',
        showarrow: false,
        font: { size: 10, color: '#000' },
      });
    });
  } else {
    const total = displayEntries.reduce((s, e) => s + e.count, 0);
    const n = displayEntries.length;
    const gap = 0.05;
    const totalGap = gap * (n - 1);
    const effectiveWidth = 1 - totalGap;

    let x0 = 0;
    displayEntries.forEach(e => {
      const frac = e.count / total;
      const w = frac * effectiveWidth;
      const x1 = x0 + w;

      traces.push({
        type: 'pie',
        labels: Object.keys(e.dtMap),
        values: Object.values(e.dtMap),
        marker: { colors: Object.keys(e.dtMap).map(d => colorMap[d]) },
        domain: { x: [x0, x1], y: [0, 1] },
        hovertemplate:
          `<b>${e.brand}</b><br>` +
          `%{label}: %{value} (%{percent})<extra></extra>`,
        textinfo: 'none',
        showlegend: false,
      });

      annotations.push({
        text: `${e.brand} (${e.count})`,
        x: x0 + w / 2,
        y: -0.15,
        xref: 'paper',
        yref: 'paper',
        xanchor: 'center',
        yanchor: 'top',
        showarrow: false,
        font: { size: 12, color: '#000' },
        textangle: 15,
      });

      x0 = x1 + gap;
    });
  }

  const layout = {
    autosize: true,
    margin: { l: 20, r: 20, t: 20, b: isGrid ? 20 : 80 },
    annotations,
  };

  return (
    <Plot
      data={traces}
      layout={layout}
      useResizeHandler
      style={{ width, height }}
      // config={{ displayModeBar: false }}
    />
  );
}
