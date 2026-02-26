import TileGrid from './TileGrid'

// Size each cell so the editor fits comfortably in the sidebar (~180px wide)
function computeCellSize(cols, rows) {
  const MAX_PX = 180
  return Math.max(4, Math.floor(MAX_PX / Math.max(cols, rows)))
}

export default function TileEditorPanel({ tile, onToggleCell }) {
  const cols = tile.cells[0]?.length ?? 1
  const rows = tile.cells.length
  const cellSize = computeCellSize(cols, rows)

  return (
    <div className="tile-editor-panel">
      <div className="tile-editor-panel__header">
        Editing: <span className="tile-editor-panel__name">{tile.name}</span>
      </div>
      <TileGrid
        grid={tile.cells}
        onToggle={onToggleCell}
        cols={cols}
        rows={rows}
        tool="pen"
        cellSize={cellSize}
      />
    </div>
  )
}
