import { useState, useCallback, useRef, memo } from 'react'

function snapToTile(r, c, tileW, tileH) {
  return {
    r: Math.floor(r / tileH) * tileH,
    c: Math.floor(c / tileW) * tileW,
  }
}

const Cell = memo(function Cell({ on, isPreview, onMouseDown, onMouseEnter }) {
  let cls = 'cell'
  if (on) cls += ' cell--on'
  if (isPreview) cls += ' cell--stamp-preview'
  return (
    <div
      className={cls}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
    />
  )
})

export default function TileGrid({
  grid,
  onToggle,
  onStamp,
  cols,
  rows,
  tool = 'pen',
  stampTile = null,
  tileWidth = 1,
  tileHeight = 1,
  // cellSize: number → fixed px per cell (tile editor mode)
  // cellSize: null  → responsive aspect-ratio mode (main canvas)
  cellSize = null,
}) {
  const isDragging = useRef(false)
  const paintValue = useRef(null)
  const lastStampPos = useRef(null)
  const [hoverCell, setHoverCell] = useState(null)

  // --- Stamp preview set (computed during render, not memoised) ---
  let previewSet = null
  if (tool === 'stamp' && stampTile && hoverCell) {
    const snapped = snapToTile(hoverCell.r, hoverCell.c, tileWidth, tileHeight)
    previewSet = new Set()
    for (let r = 0; r < stampTile.cells.length; r++) {
      for (let c = 0; c < (stampTile.cells[0]?.length ?? 0); c++) {
        if (stampTile.cells[r][c]) {
          previewSet.add(`${snapped.r + r},${snapped.c + c}`)
        }
      }
    }
  }

  // --- Event handlers ---
  const handleMouseDown = useCallback((r, c, e) => {
    e.preventDefault()
    isDragging.current = true

    if (tool === 'pen') {
      paintValue.current = !grid[r][c]
      onToggle(r, c)
    } else if (tool === 'stamp' && onStamp) {
      const snapped = snapToTile(r, c, tileWidth, tileHeight)
      lastStampPos.current = `${snapped.r},${snapped.c}`
      onStamp(snapped.r, snapped.c)
    }
  }, [tool, grid, onToggle, onStamp, tileWidth, tileHeight])

  const handleMouseEnter = useCallback((r, c) => {
    if (tool === 'stamp') setHoverCell({ r, c })

    if (!isDragging.current) return

    if (tool === 'pen') {
      if (grid[r][c] !== paintValue.current) onToggle(r, c)
    } else if (tool === 'stamp' && onStamp) {
      const snapped = snapToTile(r, c, tileWidth, tileHeight)
      const key = `${snapped.r},${snapped.c}`
      if (lastStampPos.current !== key) {
        lastStampPos.current = key
        onStamp(snapped.r, snapped.c)
      }
    }
  }, [tool, grid, onToggle, onStamp, tileWidth, tileHeight])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    paintValue.current = null
    lastStampPos.current = null
  }, [])

  const handleMouseLeave = useCallback(() => {
    isDragging.current = false
    paintValue.current = null
    lastStampPos.current = null
    if (tool === 'stamp') setHoverCell(null)
  }, [tool])

  // --- Grid sizing ---
  // Fixed mode (tile editor): each cell is cellSize × cellSize px, square
  // Responsive mode (main canvas): aspect-ratio driven, fills container
  const gridStyle = cellSize != null
    ? { '--cols': cols, '--rows': rows, '--cell-size': `${cellSize}px` }
    : { '--cols': cols, '--rows': rows, aspectRatio: `${cols * 2} / ${rows}` }

  const gridClass = `grid${cellSize != null ? ' grid--fixed' : ''}${tool === 'stamp' ? ' grid--stamp' : ''}`

  return (
    <div
      className="grid-wrapper"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div className={gridClass} style={gridStyle}>
        {grid.map((row, r) =>
          row.map((on, c) => (
            <Cell
              key={`${r}-${c}`}
              on={on}
              isPreview={previewSet?.has(`${r},${c}`) ?? false}
              onMouseDown={(e) => handleMouseDown(r, c, e)}
              onMouseEnter={() => handleMouseEnter(r, c)}
            />
          ))
        )}
      </div>
    </div>
  )
}
