export function createTileCells(width, height) {
  return Array.from({ length: height }, () => new Array(width).fill(false))
}

export function resizeTileCells(cells, newWidth, newHeight) {
  return Array.from({ length: newHeight }, (_, r) =>
    Array.from({ length: newWidth }, (_, c) => cells[r]?.[c] ?? false)
  )
}

export function createTile(width, height) {
  return {
    id: crypto.randomUUID?.() ?? `tile_${Date.now()}_${Math.random()}`,
    name: 'tile',
    cells: createTileCells(width, height),
  }
}

export function resizeAllTiles(tiles, newWidth, newHeight) {
  return tiles.map(tile => ({
    ...tile,
    cells: resizeTileCells(tile.cells, newWidth, newHeight),
  }))
}

export function stampTileOntoGrid(grid, tileCells, tileRow, tileCol) {
  const next = grid.map(r => r.slice())
  const tileH = tileCells.length
  const tileW = tileCells[0]?.length ?? 0
  for (let r = 0; r < tileH; r++) {
    for (let c = 0; c < tileW; c++) {
      const gr = tileRow + r
      const gc = tileCol + c
      if (gr >= 0 && gr < next.length && gc >= 0 && gc < next[0].length) {
        next[gr][gc] = tileCells[r][c]
      }
    }
  }
  return next
}

export function resampleGrid(grid, oldKernelLines, newKernelLines) {
  const oldRows = 192 / oldKernelLines
  const newRows = 192 / newKernelLines
  const cols = grid[0]?.length ?? 40

  if (newRows === oldRows) return grid.map(r => r.slice())

  if (newRows > oldRows) {
    const factor = newRows / oldRows
    return Array.from({ length: newRows }, (_, d) =>
      grid[Math.floor(d / factor)].slice()
    )
  }

  // Downscale: OR-merge `factor` source rows into each dest row
  const factor = oldRows / newRows
  return Array.from({ length: newRows }, (_, d) =>
    Array.from({ length: cols }, (_, c) => {
      for (let f = 0; f < factor; f++) {
        if (grid[d * factor + f][c]) return true
      }
      return false
    })
  )
}
