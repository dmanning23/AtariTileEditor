import { useCallback, useRef } from 'react'

export default function TileGrid({ grid, onToggle, cols, rows }) {
  // Track whether we're currently dragging and what value we're painting
  const isDragging = useRef(false)
  const paintValue = useRef(null)

  const handleMouseDown = useCallback((row, col, e) => {
    e.preventDefault()
    isDragging.current = true
    paintValue.current = !grid[row][col]
    onToggle(row, col)
  }, [grid, onToggle])

  const handleMouseEnter = useCallback((row, col) => {
    if (isDragging.current) {
      // Only paint if the cell isn't already the target value
      if (grid[row][col] !== paintValue.current) {
        onToggle(row, col)
      }
    }
  }, [grid, onToggle])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    paintValue.current = null
  }, [])

  return (
    <div
      className="grid-wrapper"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="grid"
        style={{ '--cols': cols, '--rows': rows }}
      >
        {grid.map((row, r) =>
          row.map((on, c) => (
            <div
              key={`${r}-${c}`}
              className={`cell${on ? ' cell--on' : ''}`}
              onMouseDown={(e) => handleMouseDown(r, c, e)}
              onMouseEnter={() => handleMouseEnter(r, c)}
            />
          ))
        )}
      </div>
    </div>
  )
}
