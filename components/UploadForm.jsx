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
          display: flex;
          align-items: center;
          gap: 12px;
          white-space: nowrap;
          height: 2rem;
          width: 140px;
        }
        .upload-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 2rem;
          padding: 0 1rem;
          font-size: 1rem;
          background: rgb(0, 61, 107);
          border: none;
          color: #fff;
          border-radius: 20px;
          cursor: pointer;
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
