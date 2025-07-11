// pages/index.js
import { useState, useEffect } from 'react';
import { parse } from 'csv-parse/browser/esm/sync';
import Sidebar from '../components/Sidebar';
import UploadForm from '../components/UploadForm';
import MainFilter from '../components/MainFilter';
import ChartCard from '../components/ChartCard';
import Timechart from '../components/Timechart';
import InchPriceBoxPlot from '../components/InchPriceBoxPlot';
import ShoppingMallBrandChart from '../components/ShoppingMallBrandChart';
import BrandDisplayTypePie from '../components/BrandDisplayTypePie';
import DisplayTypePriceScatter from '../components/DisplayTypePriceScatter';
import ResolutionPriceBubble from '../components/ResolutionPriceBubble';
import DisplayTypeBrandBar from '../components/DisplayTypeBrandBar';
import DataTable from '../components/DataTable';

export default function Home() {
  const [data, setData] = useState([]);
  const [filterSelections, setFilterSelections] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/data/Product_Data_20250628.csv')
      .then(res => res.text())
      .then(csv => {
        const records = parse(csv, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        });
        handleData(records);
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
              <MainFilter data={data} onFilter={handleFilter} />
          </div>
          <div className="upload-filter">
            <UploadForm onData={handleData} />
          </div>
      </header>
      <div className="content">
        <Sidebar
          data={data}
          onFilter={handleFilter}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="dashboard">
          <div className="charts">
            <ChartCard title="Time Chart(Brand & Model)">
              <Timechart data={filteredData} />
            </ChartCard>
            <ChartCard title="Shopping Mall vs Brand">
              <ShoppingMallBrandChart data={filteredData} />
            </ChartCard>
            <ChartCard title="Inch vs Price">
              <InchPriceBoxPlot data={filteredData} />
            </ChartCard>
            <ChartCard title="Brand vs Display Type">
              <BrandDisplayTypePie data={filteredData} limit={7} />
            </ChartCard>
            <ChartCard title="Display Type vs Price">
              <DisplayTypePriceScatter data={filteredData} />
            </ChartCard>
            <ChartCard title="Resolution vs Price">
              <ResolutionPriceBubble data={filteredData} />
            </ChartCard>
            <ChartCard title="Display Type vs Brand">
              <DisplayTypeBrandBar data={filteredData} />
            </ChartCard>
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
        .content { display: flex; flex: 1; overflow: hidden; }
        .dashboard { flex: 1; padding: 1rem; overflow: auto; }
        .charts {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          width: 100%;
          padding: 20px;
          box-sizing: border-box;
        }
        @media (max-width: 900px) {
          .charts { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); }
        }
        @media (max-width: 600px) {
          .charts { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
