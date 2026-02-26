import { useRef, useEffect } from 'react'

const THUMB_SIZE = 64   // canvas px

export default function TileThumbnail({ tile, isEditing, isSelected, cellColor, onClick, onDelete }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rows = tile.cells.length
    const cols = tile.cells[0]?.length ?? 0
    if (rows === 0 || cols === 0) return

    const cw = THUMB_SIZE / cols
    const ch = THUMB_SIZE / rows

    // Background
    ctx.fillStyle = '#111122'
    ctx.fillRect(0, 0, THUMB_SIZE, THUMB_SIZE)

    // ON cells
    ctx.fillStyle = cellColor
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (tile.cells[r][c]) {
          ctx.fillRect(Math.floor(c * cw), Math.floor(r * ch), Math.ceil(cw), Math.ceil(ch))
        }
      }
    }

    // Grid lines
    ctx.strokeStyle = '#2a2a3e'
    ctx.lineWidth = 0.5
    for (let c = 0; c <= cols; c++) {
      ctx.beginPath(); ctx.moveTo(c * cw, 0); ctx.lineTo(c * cw, THUMB_SIZE); ctx.stroke()
    }
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath(); ctx.moveTo(0, r * ch); ctx.lineTo(THUMB_SIZE, r * ch); ctx.stroke()
    }
  }, [tile.cells, cellColor])

  let borderStyle = 'transparent'
  if (isEditing) borderStyle = '#4a9eff'
  else if (isSelected) borderStyle = '#ff6b35'

  return (
    <div
      className="thumbnail"
      style={{ borderColor: borderStyle }}
      onClick={onClick}
      title={tile.name}
    >
      <canvas
        ref={canvasRef}
        width={THUMB_SIZE}
        height={THUMB_SIZE}
        className="thumbnail__canvas"
      />
      <span className="thumbnail__name">{tile.name}</span>
      <button
        className="thumbnail__delete"
        onClick={e => { e.stopPropagation(); onDelete() }}
        title="Delete tile"
      >×</button>
    </div>
  )
}
