// components/DataTable.js
import { useState, useEffect, useMemo } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default function DataTable({ data }) {
  const requiredColumns = [
    "Shopping Mall","Brand","Model Name","Screen Size","Display Type",
    "Resolution","Refresh Rate","Brightness","Platform","Price[$]",
    "Features","Image","URL"
  ];

  const renderValue = (val) => {
    const s = String(val).trim();
    if (s === '' || s.toLowerCase() === 'nan' || val == null) return 'None';
    return val;
  };

  // 데이터 정규화
  const normalized = useMemo(
    () => data.map(row => {
      const out = {};
      requiredColumns.forEach(col => {
        out[col] = renderValue(row[col]);
      });
      return out;
    }),
    [data]
  );

  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const perPage = 30;

  // 유효성 검사 및 초기화
  useEffect(() => {
    if (normalized.length === 0) {
      setError('');
      setRows([]);
      return;
    }
    const allKeys = Object.keys(normalized[0]);
    const missing = requiredColumns.filter(c => !allKeys.includes(c));
    if (missing.length) {
      setError('파일의 데이터 형식이 맞지 않습니다.');
      setRows([]);
      return;
    }
    setError('');
    setRows(normalized);
    setPage(0);
  }, [normalized]);

  const pageCount = Math.ceil(rows.length / perPage) || 1;
  const slice = rows.slice(page * perPage, (page + 1) * perPage);

  const shortenURL = (url) => {
    try {
      const u = new URL(url);
      const txt = u.hostname + u.pathname;
      return txt.length > 30 ? txt.slice(0,30) + '…' : txt;
    } catch {
      return url;
    }
  };

  const [downloading, setDownloading] = useState(false);
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data');

      const today = new Date();
      const yy = String(today.getFullYear()).slice(2);
      const mm = String(today.getMonth()+1).padStart(2,'0');
      const dd = String(today.getDate()).padStart(2,'0');
      const fileName = `쇼핑몰 데이터_${yy}${mm}${dd}.xlsx`;

      const columns = Object.keys(rows[0] || {});
      worksheet.columns = columns.map(col => ({ header: col, key: col, width: 20 }));

      const rowsData = rows.map(row =>
        columns.map(col => (
          (col === 'Image' || col === 'URL')
            ? { text: row[col], hyperlink: row[col] }
            : row[col]
        ))
      );

      worksheet.addTable({
        name: 'ShoppingData',
        ref: 'A1',
        headerRow: true,
        style: { theme: 'TableStyleMedium2', showRowStripes: true },
        columns: columns.map(col => ({ name: col, filterButton: true })),
        rows: rowsData,
      });

      worksheet.getRow(1).eachCell(cell => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern', pattern: 'solid',
          fgColor: { argb: 'FFA6DDA8' },
        };
        const border = { style: 'thin' };
        cell.border = { top: border, left: border, bottom: border, right: border };
      });

      worksheet.eachRow((row, rowNum) => {
        if (rowNum === 1) return;
        row.eachCell(cell => {
          const border = { style: 'thin' };
          cell.border = { top: border, left: border, bottom: border, right: border };
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      saveAs(blob, fileName);
    } catch (err) {
      alert('❌ Download failed: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  if (error) {
    return <div style={{ color: 'red', padding: '1rem' }}>{error}</div>;
  }

  return (
    <div className="data-table">
      <div style={{ textAlign: 'right', marginBottom: '0.5rem' }}>
        <button
          onClick={handleDownload}
          disabled={rows.length === 0}
          style={{
            background: downloading ? '#38a169' : '#2b6cb0',
            color: '#fff',
            border: 'none',
            padding: '6px 12px',
            marginTop: '10px',
            borderRadius: '50px',
            cursor: 'pointer'
          }}
        >
          {downloading ? '다운로드 중...' : '다운로드'}
        </button>
      </div>

      <div style={{ overflow: 'auto', maxHeight: '60vh' }}>
        <table>
          <thead>
            <tr>
              {requiredColumns.map(col => (
                <th
                  key={col}
                  style={{
                    position: 'sticky',
                    top: 0,
                    backgroundColor: '#f1f1f1',
                    zIndex: 2,
                    padding: '0.6rem',
                    borderBottom: '1px solid #ccc',
                    textAlign: 'center'   // 중앙 정렬로 변경
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((row, ri) => (
              <tr key={ri}>
                {requiredColumns.map(col => {
                  const val = row[col];
                  if (col === 'Image') {
                    return (
                      <td key={col} style={{ padding: '0.6rem' }}>
                        <a href={val} target="_blank" rel="noreferrer">
                          <img
                            src={val}
                            width={80}
                            height={60}
                            alt="img"
                            onError={e => {
                              e.target.onerror = null;
                              e.target.src = 'data:image/svg+xml;utf8,📺';
                            }}
                          />
                        </a>
                      </td>
                    );
                  }
                  if (col === 'URL') {
                    return (
                      <td key={col} style={{ padding: '0.6rem' }}>
                        <a href={val} target="_blank" rel="noreferrer">
                          {shortenURL(val)}
                        </a>
                      </td>
                    );
                  }
                  return <td key={col} style={{ padding: '0.6rem' }}>{val}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          onClick={() => setPage(p => Math.max(p - 1, 0))}
          disabled={page === 0}
        >
          이전
        </button>
        <span style={{ margin: '0 0.5rem' }}>
          {page+1} / {pageCount}
        </span>
        <button onClick={() => setPage(p => Math.min(p+1, pageCount-1))} disabled={page>=pageCount-1}>
          다음
        </button>
      </div>
      <style jsx>{`
        table {
          border-collapse: collapse;
          width: 100%;
          min-width: 600px;
        }
        thead tr {
          background: #f1f1f1;
        }
        thead th {
          position: sticky;
          top: 0;
          z-index: 1;
          padding: 0.75rem;
          border-bottom: 2px solid #ccc;
          font-weight: bold;
        }

        tbody tr:nth-child(even) {
          background: #fafafa;
        }

        tbody td {
          padding: 0.6rem;
          border-bottom: 1px solid #eee;
        }
        .pagination {
          margin-top: 8px;
          display: flex;
          justify-content: center;
          gap: 12px;
        }
        .pagination button {
          padding: 4px 8px;
          border: none;
          background: #3182ce;
          color: #fff;
          border-radius: 50px;
          cursor: pointer;
        }
        .pagination button:disabled {
          background: #a0a0a0;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
