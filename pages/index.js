// pages/index.js
import { useState, useEffect } from 'react'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import Sidebar from '../components/Sidebar'
import UploadForm from '../components/UploadForm'
import dynamic from 'next/dynamic'
import ChartCard from '../components/ChartCard'
import ShoppingMallBrandChart from '../components/ShoppingMallBrandChart'
import BrandDisplayTypePie from '../components/BrandDisplayTypePie'
import DisplayTypePriceScatter from '../components/DisplayTypePriceScatter'
import ResolutionPriceBubble from '../components/ResolutionPriceBubble'
// import Test from '../components/Test'
import DisplayTypePriceBar from '../components/DisplayTypePriceBar';
import DataTable from '../components/DataTable'

// Plotly chart loads client-side only
const InchPriceBoxPlot = dynamic(
  () => import('../components/InchPriceBoxPlot'),
  { ssr: false, loading: () => <div>Loading chart…</div> }
)

export default function Home({
  initialData,
  initialFileName,       // name of the CSV we loaded server-side
}) {
  const [data, setData] = useState([])
  const [filterSelections, setFilterSelections] = useState({})
  const [filteredData, setFilteredData] = useState([])

  // 1) On first load, initialize via handleData
  useEffect(() => {
    if (initialData.length) {
      handleData(initialData)
    }
  }, [initialData])

  // central data+filter initializer — used both on SSR load and on upload
  const handleData = (jsonData) => {
    setData(jsonData)
    // initialize every column’s filter set to “all”
    const init = {}
    if (jsonData.length) {
      Object.keys(jsonData[0]).forEach(col => {
        init[col] = new Set(jsonData.map(r => r[col]).filter(x => x != null))
      })
    }
    setFilterSelections(init)
  }

  // when filters change, re-filter
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

  // passed into Sidebar
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
        {/* HERE: use handleData, not raw setData */}
        <UploadForm
          initialFileName={initialFileName}
          onData={handleData}
        />

        <div className="content">
          <Sidebar
            data={data}
            onFilter={handleFilter}
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
              {/* <ChartCard title="test">
                <Test data={filteredData} />
              </ChartCard> */}
              <ChartCard title="Display Type vs Brand">
                <DisplayTypePriceBar data={filteredData} />
              </ChartCard>
            </div>
            <DataTable data={filteredData} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .main { padding: 1rem; }
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
          // align-items: stretch;
          // max-width: 1200px;
          // margin: 0 auto;
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
          position: relative; height: 80px;
          display: flex; align-items: center; justify-content: center;
          background: #0c011b; color: #fff; padding: 1rem;
        }
        .header .division { position: absolute; top: 0; left: 1rem; }
        .header h1 { margin: 0; font-size: 4rem; }
      `}</style>

    </div>
  )
}

export async function getServerSideProps() {
  const dir = process.cwd()
  const files = fs.readdirSync(dir).filter(f => /\.csv$/i.test(f))

  // pick latest by YYMMDD or YYYYMMDD in name
  const dated = files
    .map(f => {
      const m8 = f.match(/(\d{8})/)
      const m6 = !m8 && f.match(/(\d{6})/)
      return m8
        ? { file: f, date: m8[1] }
        : m6
        ? { file: f, date: m6[1] }
        : null
    })
    .filter(Boolean)
    .sort((a, b) => b.date.localeCompare(a.date))

  let initialData = []
  let initialFileName = ''

  if (dated.length) {
    const latest = dated[0].file
    initialFileName = latest
    const raw = fs.readFileSync(path.join(dir, latest), 'utf8')
    initialData = parse(raw, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
      relax_column_count: true,
    })
  }

  return {
    props: {
      initialData,
      initialFileName,
    },
  }
}
