import { useState, useCallback, useEffect, useRef } from 'react'
import TileGrid from './TileGrid'
import TileLibrary from './TileLibrary'
import TileEditorPanel from './TileEditorPanel'
import { exportAsm } from './exportAsm'
import { createTile, resizeAllTiles, stampTileOntoGrid } from './tileUtils'
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
  const stored = loadFromStorage()

  const [name, setName]               = useState(() => stored?.name       ?? 'untitled')
  const [grid, setGrid]               = useState(() => stored?.cells      ?? createEmptyGrid())
  const [tiles, setTiles]             = useState(() => stored?.tiles      ?? [])
  const [tileWidth, setTileWidth]     = useState(() => stored?.tileWidth  ?? 8)
  const [tileHeight, setTileHeight]   = useState(() => stored?.tileHeight ?? 8)
  const [selectedTileId, setSelectedTileId] = useState(null)
  const [editingTileId, setEditingTileId]   = useState(null)
  const [activeTool, setActiveTool]   = useState('pen')
  const [cellColor, setCellColor]     = useState('#f0e040')
  const fileInputRef = useRef(null)

  // Auto-save
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      name, cols: COLS, rows: ROWS, cells: grid,
      tiles, tileWidth, tileHeight,
    }))
  }, [name, grid, tiles, tileWidth, tileHeight])

  // Derived
  const selectedTile = tiles.find(t => t.id === selectedTileId) ?? null
  const editingTile  = tiles.find(t => t.id === editingTileId)  ?? null

  // --- Main canvas ---
  const toggleMainCell = useCallback((row, col) => {
    setGrid(prev => {
      const next = prev.map(r => r.slice())
      next[row][col] = !next[row][col]
      return next
    })
  }, [])

  const stampOntoMain = useCallback((tileRow, tileCol) => {
    if (!selectedTile) return
    setGrid(prev => stampTileOntoGrid(prev, selectedTile.cells, tileRow, tileCol))
  }, [selectedTile])

  const clearGrid = useCallback(() => setGrid(createEmptyGrid()), [])
  const fillGrid  = useCallback(() =>
    setGrid(Array.from({ length: ROWS }, () => new Array(COLS).fill(true))), [])

  // --- Tile library ---
  const addTile = useCallback(() => {
    const tile = createTile(tileWidth, tileHeight)
    setTiles(prev => [...prev, tile])
    setEditingTileId(tile.id)
  }, [tileWidth, tileHeight])

  const deleteTile = useCallback((id) => {
    setTiles(prev => prev.filter(t => t.id !== id))
    setEditingTileId(prev => prev === id ? null : prev)
    setSelectedTileId(prev => prev === id ? null : prev)
  }, [])

  const selectTile = useCallback((id) => {
    setEditingTileId(id)
    if (activeTool === 'stamp') setSelectedTileId(id)
  }, [activeTool])

  const handleChangeTool = useCallback((tool) => {
    setActiveTool(tool)
    if (tool === 'stamp' && editingTileId) setSelectedTileId(editingTileId)
  }, [editingTileId])

  const toggleTileCell = useCallback((row, col) => {
    if (!editingTileId) return
    setTiles(prev => prev.map(t => {
      if (t.id !== editingTileId) return t
      const cells = t.cells.map(r => r.slice())
      cells[row][col] = !cells[row][col]
      return { ...t, cells }
    }))
  }, [editingTileId])

  const handleTileWidthChange = useCallback((w) => {
    const clamped = Math.max(1, Math.min(40, w))
    setTileWidth(clamped)
    setTiles(prev => resizeAllTiles(prev, clamped, tileHeight))
  }, [tileHeight])

  const handleTileHeightChange = useCallback((h) => {
    const clamped = Math.max(1, Math.min(48, h))
    setTileHeight(clamped)
    setTiles(prev => resizeAllTiles(prev, tileWidth, clamped))
  }, [tileWidth])

  // --- Save / Load / Export ---
  const handleSave = useCallback(() => {
    const data = { name, cols: COLS, rows: ROWS, cells: grid, tiles, tileWidth, tileHeight }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `${name || 'untitled'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [name, grid, tiles, tileWidth, tileHeight])

  const handleExportAsm = useCallback(() => {
    const asm  = exportAsm(name, grid)
    const blob = new Blob([asm], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
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
        if (data.cells)                setGrid(data.cells)
        if (data.name)                 setName(data.name)
        if (data.tileWidth)            setTileWidth(data.tileWidth)
        if (data.tileHeight)           setTileHeight(data.tileHeight)
        if (Array.isArray(data.tiles)) setTiles(data.tiles)
        setSelectedTileId(null)
        setEditingTileId(null)
      } catch {
        alert('Failed to load file — make sure it is a valid tile map JSON.')
      }
    }
    reader.readAsText(file)
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

      <div className="workspace">
        <aside className="sidebar">
          <TileLibrary
            tiles={tiles}
            tileWidth={tileWidth}
            tileHeight={tileHeight}
            selectedTileId={selectedTileId}
            editingTileId={editingTileId}
            activeTool={activeTool}
            cellColor={cellColor}
            onSelectTile={selectTile}
            onAddTile={addTile}
            onDeleteTile={deleteTile}
            onTileWidthChange={handleTileWidthChange}
            onTileHeightChange={handleTileHeightChange}
            onChangeTool={handleChangeTool}
          />
          {editingTile && (
            <TileEditorPanel
              tile={editingTile}
              onToggleCell={toggleTileCell}
            />
          )}
        </aside>

        <main className="main">
          <TileGrid
            grid={grid}
            onToggle={toggleMainCell}
            onStamp={stampOntoMain}
            cols={COLS}
            rows={ROWS}
            tool={activeTool}
            stampTile={selectedTile}
            tileWidth={tileWidth}
            tileHeight={tileHeight}
          />
        </main>
      </div>
    </div>
  )
}
