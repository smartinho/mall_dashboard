// pages/index.js
import { useState, useEffect } from 'react';
import { parse } from 'csv-parse/browser/esm/sync';

import Sidebar from '../components/Sidebar';
import UploadForm from '../components/UploadForm';
import MainFilter from '../components/MainFilter';
import ChartCard from '../components/ChartCard';
import Timechart from '../components/Timechart';
import SummaryTable from '../components/SummaryTable';
import InchPriceBoxPlot from '../components/InchPriceBoxPlot';
import ShoppingMallBrandChart from '../components/ShoppingMallBrandChart';
import BrandDisplayTypePie from '../components/BrandDisplayTypePie';
import DisplayTypePriceScatter from '../components/DisplayTypePriceScatter';
import ResolutionPriceBubble from '../components/ResolutionPriceBubble';
import DisplayTypeBrandBar from '../components/DisplayTypeBrandBar';
import DataTable from '../components/DataTable';

// Fixed options 정의 (Brand, Screen Size)
const fixedOptionsMap = {
  Brand: ['Samsung', 'LG', 'TCL', 'Hisense'],
  'Screen Size': ['50', '55', '65', '70', '75'],
  'Display Type': ['LED', 'Mini-LED', 'OLED', 'QLED'],
  Resolution: ['4K UHD', 'FHD', 'HD'],
  Platform: ['Fire', 'Smart TV', 'Tizen', 'webOS'],
};

export default function Home() {
  const [data, setData] = useState([]);
  const [filterSelections, setFilterSelections] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [meta, setMeta] = useState(null);

  // summary_table.csv 자동 생성 API 호출
  useEffect(() => {
    fetch('/api/Product_Data_20250628.csv')
      .then(res => res.json())
      .then(data => console.log(data.message));
  }, []);

  // 1) CSV 로드 후 초기 filterSelections 세팅
  useEffect(() => {
    fetch('/data/Product_Data_20250628.csv')
      .then(res => res.text())
      .then(csv => {
        const records = parse(csv, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        });
        // data와 초기 필터 셋팅
        const init = {};
        if (records.length) {
          Object.keys(records[0]).forEach(col => {
            if (fixedOptionsMap[col]) {
              // 고정 옵션이 정의된 컬럼은 fixedOptionsMap 값으로 초기 선택
              init[col] = new Set(fixedOptionsMap[col]);
            } else {
              // 아니면 데이터 기반 전체 옵션으로 초기 선택
              init[col] = new Set(records.map(r => r[col]).filter(x => x != null));
            }
          });
        }
        setData(records);
        setFilterSelections(init);
      });
  }, []);

  const handleData = jsonData => {
    setData(jsonData);
    const init = {};
    if (jsonData.length) {
      Object.keys(jsonData[0]).forEach(col => {
        init[col] = new Set(jsonData.map(r => r[col]).filter(x => x != null));
      });
    }
    setFilterSelections(init);
  };

  // 2) filterSelections 변경 시, data를 재필터링
  useEffect(() => {
    if (!data.length) {
      setFilteredData([]);
      return;
    }
    let tmp = data;
    for (const [col, sel] of Object.entries(filterSelections)) {
      if (sel && sel.size) {
        tmp = tmp.filter(r => sel.has(r[col]));
      }
    }
    setFilteredData(tmp);
  }, [data, filterSelections]);

  const handleFilter = (col, selectedValues) => {
    setFilterSelections(prev => ({
      ...prev,
      [col]: new Set(selectedValues),
    }));
  };

  const handleRowClick = key => {
    if (selectedKey === key) {
      setSelectedKey(null);
      setMeta(null);
    } else {
      setSelectedKey(key);
      const [brand, model] = key.split('__');
      const found = filteredData.find(
        r => r['Brand'] === brand && r['Model Name'] === model
      );
      if (found) {
        setMeta({
          brand,
          model,
          screenSize: found['Screen Size'],
          displayType: found['Display Type'],
        });
      }
    }
  };

  return (
    <div>
      <header className="header">
        <h2 className="division">MS모듈구매담당</h2>
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open Sidebar"
          title="Full Filter"
        >
          ☰
        </button>
        <div className="main-filter">
          <MainFilter
            data={data}
            onFilter={handleFilter}
            filterSelections={filterSelections}
          />
        </div>
        <div className="upload-filter">
          <UploadForm onData={handleData} />
        </div>
      </header>

      <div className="content">
        <Sidebar
          data={data}
          onFilter={handleFilter}
          filterSelections={filterSelections}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="dashboard">
          <div className="charts-wrapper">
            <div className="charts">
              <ChartCard 
                title="Time Chart(Brand & Model)" 
                fullHeight
                onTitleClick={() => {
                  setSelectedKey(null);
                  setMeta(null);
                }}
                subtitle={
                  meta
                    ? `${meta.brand} | ${meta.model} | ${meta.screenSize} | ${meta.displayType}`
                    : null
                }
                >
                <div className="time-summary-wrapper">
                  <div className="chart-area">
                    <Timechart 
                      data={filteredData} 
                      selectedKey={selectedKey} 
                    />
                  </div>
                  <div className="table-area">
                    <SummaryTable
                      data={filteredData}
                      selectedKey={selectedKey}
                      onRowClick={handleRowClick}
                    />
                  </div>
                </div>
              </ChartCard>
              <ChartCard title="Shopping Mall vs Brand" fullHeight>
                <ShoppingMallBrandChart data={filteredData} />
              </ChartCard>
              <ChartCard title="Inch vs Price" fullHeight>
                <InchPriceBoxPlot data={filteredData} />
              </ChartCard>
              <ChartCard title="Brand vs Display Type" fullHeight>
                <BrandDisplayTypePie data={filteredData} limit={7} />
              </ChartCard>
              <ChartCard title="Display Type vs Price" fullHeight>
                <DisplayTypePriceScatter data={filteredData} />
              </ChartCard>
              <ChartCard title="Resolution vs Price" fullHeight>
                <ResolutionPriceBubble data={filteredData} />
              </ChartCard>
              <ChartCard title="Display Type vs Brand" fullHeight>
                <DisplayTypeBrandBar data={filteredData} />
              </ChartCard>
            </div>
          </div>
          <DataTable data={filteredData} />
        </div>
      </div>

      <style jsx>{`
        .header {
          position: relative;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0c011b;
          color: #fff;
          padding: 16px;
        }
        .division {
          position: absolute;
          top: 0;
          left: 1rem;
          font-size: 1rem;
        }
        .sidebar-toggle {
          position: absolute;
          top: 40px;
          left: 1rem;
          background: #0c011b;
          color: white;
          border: none;
          font-size: 1.2rem;
          border-radius: 10px;
          cursor: pointer;
        }
        .main-filter {
          display: flex;
          position: absolute;
          top: 45px;
          align-items: center;
          margin: 0 auto;
        }
        @media (max-width: 767px) {
          .main-filter { display: none; }
        }
        .upload-filter {
          position: absolute;
          top: 40px;
          right: 1rem;
          align-items: center;
          margin: 0 auto;
        }
        @media (max-width: 767px) {
          .upload-filter { display: none; }
        }
        .content { 
        display: flex; 
        overflow-x: hidden;
        height: 100%;
        }
        .dashboard { 
        flex: 1; 
        padding: 1rem; 
        overflow: auto;
        min-width: 0;
        }
        .charts-wrapper {
          overflow-x: auto;
          overflow-y: auto;
          height: 100%;
        }
        .charts {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          grid-auto-rows: 1fr;
          gap: 20px;
          padding: 20px;
          box-sizing: border-box;
          align-items: stretch;
          height: 100%;
        }
        @media (max-width: 800px) {
          .charts {
            grid-template-columns: 1fr;    
          }
        }
        .time-summary-wrapper {
          display: flex;
          flex-direction: column;
          width: 100%;
          flex: 1;
          min-height: 0;
        }
        .chart-area {
          flex: 2;           /* 그래프 영역 비중 (원하는 비율로 조절 가능) */
          display: flex;     
          min-height: 0;     /* flex 자식의 overflow 제어를 위해 필요 */
        }
        .table-area {
          flex: 1;           /* 표 영역 비중 */
          min-height: 0;     /* flex 자식의 overflow 제어를 위해 필요 */
        } 
      `}</style>
    </div>
  );
}
