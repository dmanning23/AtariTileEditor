import { useState, useCallback, useEffect, useRef } from 'react'
import TileGrid from './TileGrid'
import { exportAsm } from './exportAsm'
import './App.css'

const COLS = 40
const ROWS = 48
const STORAGE_KEY = 'atari-tile-editor'

function createEmptyGrid() {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(false))
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export default function App() {
  const [name, setName] = useState(() => loadFromStorage()?.name ?? 'untitled')
  const [grid, setGrid] = useState(() => loadFromStorage()?.cells ?? createEmptyGrid())
  const [cellColor, setCellColor] = useState('#f0e040')
  const fileInputRef = useRef(null)

  // Auto-save to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, cols: COLS, rows: ROWS, cells: grid }))
  }, [name, grid])

  const toggleCell = useCallback((row, col) => {
    setGrid(prev => {
      const next = prev.map(r => r.slice())
      next[row][col] = !next[row][col]
      return next
    })
  }, [])

  const clearGrid = useCallback(() => {
    setGrid(createEmptyGrid())
  }, [])

  const fillGrid = useCallback(() => {
    setGrid(Array.from({ length: ROWS }, () => new Array(COLS).fill(true)))
  }, [])

  const handleSave = useCallback(() => {
    const data = { name, cols: COLS, rows: ROWS, cells: grid }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${name || 'untitled'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [name, grid])

  const handleExportAsm = useCallback(() => {
    const asm = exportAsm(name, grid)
    const blob = new Blob([asm], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${name || 'untitled'}Data.asm`
    a.click()
    URL.revokeObjectURL(url)
  }, [name, grid])

  const handleLoad = useCallback((e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (data.cells) setGrid(data.cells)
        if (data.name) setName(data.name)
      } catch {
        alert('Failed to load file — make sure it is a valid tile map JSON.')
      }
    }
    reader.readAsText(file)
    // Reset so the same file can be re-loaded if needed
    e.target.value = ''
  }, [])

  const activeCells = grid.flat().filter(Boolean).length

  return (
    <div className="app" style={{ '--cell-on': cellColor }}>
      <header className="header">
        <div className="title-group">
          <h1>Atari Tile Editor</h1>
          <input
            className="tile-name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="untitled"
            spellCheck={false}
          />
        </div>
        <div className="controls">
          <span className="cell-count">{activeCells} / {COLS * ROWS} cells on</span>
          <button onClick={clearGrid}>Clear</button>
          <button onClick={fillGrid}>Fill</button>
          <div className="divider" />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => fileInputRef.current.click()}>Load</button>
          <div className="divider" />
          <button onClick={handleExportAsm}>Export ASM</button>
          <div className="divider" />
          <label className="color-label">
            Color
            <input
              type="color"
              value={cellColor}
              onChange={e => setCellColor(e.target.value)}
              className="color-picker"
            />
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleLoad}
          />
        </div>
      </header>
      <main className="main">
        <TileGrid grid={grid} onToggle={toggleCell} cols={COLS} rows={ROWS} />
      </main>
    </div>
  )
}
