// pages/index.js
import { useState, useEffect } from 'react'
import { parse } from 'csv-parse/browser/esm/sync'
import Sidebar from '../components/Sidebar'
import UploadForm from '../components/UploadForm'
import MainFilter  from '../components/MainFilter'
import ChartCard from '../components/ChartCard'
import InchPriceBoxPlot from '../components/InchPriceBoxPlot'
import ShoppingMallBrandChart from '../components/ShoppingMallBrandChart'
import BrandDisplayTypePie from '../components/BrandDisplayTypePie'
import DisplayTypePriceScatter from '../components/DisplayTypePriceScatter'
import ResolutionPriceBubble from '../components/ResolutionPriceBubble'
import DisplayTypeBrandBar from '../components/DisplayTypeBrandBar'
import DataTable from '../components/DataTable'

export default function Home() {
  const [data, setData] = useState([])
  const [filterSelections, setFilterSelections] = useState({})
  const [filteredData, setFilteredData] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetch('/data/Product_Data_20250628.csv')  // 여기에 파일명 변경 가능
      .then(res => res.text())
      .then(csv => {
        const records = parse(csv, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        })
        handleData(records)
      })
  }, [])

  const handleData = (jsonData) => {
    setData(jsonData)
    const init = {}
    if (jsonData.length) {
      Object.keys(jsonData[0]).forEach(col => {
        init[col] = new Set(jsonData.map(r => r[col]).filter(x => x != null))
      })
    }
    setFilterSelections(init)
  }

  useEffect(() => {
    if (!data.length) {
      setFilteredData([])
      return
    }
    let tmp = data
    for (const [col, sel] of Object.entries(filterSelections)) {
      if (sel && sel.size) {
        tmp = tmp.filter(r => sel.has(r[col]))
      }
    }
    setFilteredData(tmp)
  }, [data, filterSelections])

  const handleFilter = (col, selectedValues) => {
    setFilterSelections(prev => ({
      ...prev,
      [col]: new Set(selectedValues),
    }))
  }

  return (
    <div>
      <header className="header">
        <h2 className="division">MS모듈구매담당</h2>
        <h1>Mall Dashboard</h1>
      </header>

      <div className="main">
        <div className="center-container">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open Sidebar"
            title="Full Filter"
          >
            ☰
          </button>
        
          <div className="upload-filter-wrapper">
            <UploadForm onData={handleData} />
            <MainFilter data={data} onFilter={handleFilter} />
          </div>
        </div>        
      </div>
        <div className="content">
          <Sidebar 
            data={data} 
            onFilter={handleFilter}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <div className="dashboard">
            <div className="charts">
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
        .main { 
          display: flex;
          padding: 1rem;
        }
        .center-container {
          display: flex;
          align-items: center;
          gap: 12px;
          // width: 100%;
        }
        .sidebar-toggle {
          background: #0c011b;
          color: white;
          border: none;
          font-size: 1rem;
          padding: 0.5rem 1rem;
          border-radius: 10px;
          cursor: pointer;
        }
        @media (max-width: 768px) {
          .sidebar-toggle {
            position: relative;
            z-index: 1200;
          }
        }
        .upload-filter-wrapper {
          display: flex;
          gap: 12px;
          align-items: center;
          margin: 0 auto;
        }
        @media (max-width: 767px) {
          .upload-filter-wrapper {
            display: none; /* ✅ 모바일에서는 Upload + Filter 숨김 */
          }
        }
        .content { display: flex; flex: 1; overflow: hidden; }
        .dashboard { flex: 1; padding: 1rem; overflow: auto; }
        .charts {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          width: 100%;
          hight: 100%;
          padding: 20px;
          box-sizing: border-box;
        }
        @media (max-width: 900px) {
          .charts {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          }
        }
        @media (max-width: 600px) {
          .charts {
            grid-template-columns: 1fr;
          }
        }        
        .header {
          position: relative; 
          height: 80px;
          display: flex; 
          align-items: center; 
          justify-content: center;
          background: #0c011b; 
          color: #fff; 
          padding: 1rem;
        }
        .header .division { 
          position: absolute; 
          top: 0; 
          left: 1rem; 
        }
        .header h1 { margin: 0; font-size: 4rem; }

        @media (max-width: 768px) {
          .header h1 {
            font-size: 3rem;
            text-align: center;
          }
        
          .header .division {
            position: absolute; 
            font-size: 1rem;
          }
        
          .header {
            flex-direction: column;
            height: auto;
            padding: 2rem 0.5rem;
          }
        }    

      `}</style>
    </div>
  )
}
