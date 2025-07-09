import { useRef, useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

export default function UploadForm({ onData, initialFileName = '' }) {
  const fileInputRef = useRef()
  const [fileName, setFileName] = useState(initialFileName)
  const [uploadedData, setUploadedData] = useState([])

  useEffect(() => {
    setFileName(initialFileName)
  }, [initialFileName])
  
  const handleUpload = () => {
    const file = fileInputRef.current.files[0]
    if (!file) return

    setFileName(file.name)
    const ext = file.name.split('.').pop().toLowerCase()
    const reader = new FileReader()

    reader.onload = evt => {
      if (ext === 'csv') {
        const text = evt.target.result
        const { data } = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          transformHeader: h => h.trim(),
          transform: v => (typeof v === 'string' ? v.trim() : v),
        })
        setUploadedData(data)
        onData(data)
      } else {
        const array = new Uint8Array(evt.target.result)
        const workbook = XLSX.read(array, { type: 'array' })
        const firstSheet = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheet]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' })
        setUploadedData(jsonData)
        onData(jsonData)
      }
    }
    if (ext === 'csv') reader.readAsText(file, 'utf8')
    else reader.readAsArrayBuffer(file)
  }
  
  return (
    <div className="upload-form">
      <input
        type="file"
        ref={fileInputRef}
        accept=".xlsx, .xls, .csv"
        style={{ display: 'none' }}
        id="file-upload"
        onChange={handleUpload}
      />
      <label htmlFor="file-upload" className="upload-button">
        <span className="icon">＋</span>
        Upload File
      </label>
      {fileName && <span className="file-name">{fileName}</span>}

      <style jsx>{`
        .upload-form {
          padding: 0.3rem;
          width: 100%;
          background: #fafafa;
          border-bottom: 1px solid #ddd;
          display: flex;
          align-items: center;
          white-space: nowrap;
        }
        .upload-button {
          display: inline-flex;
          align-items: center;
          background: rgb(0, 61, 107);
          border: none;
          color: #fff;
          margin-left: 10px;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          cursor: pointer;
          font-size: 1rem;
        }
        .upload-button .icon {
          margin-right: 0.5rem;
          font-size: 1.2rem;
          line-height: 1;
        }
        .file-name {
          margin-left: 12px;
          color: #555;
          font-size: 0.9rem;
          white-space: nowrap;
        }
      `}</style>
    </div>
  )
}
