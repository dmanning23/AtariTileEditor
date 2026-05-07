import { describe, it, expect } from 'vitest'
import { resampleGrid } from './tileUtils'

function makeGrid(rows, fill = false) {
  return Array.from({ length: rows }, () => new Array(40).fill(fill))
}

describe('resampleGrid', () => {
  it('upscales by duplicating rows (8-line → 4-line: 24→48 rows)', () => {
    const grid = Array.from({ length: 24 }, (_, r) =>
      new Array(40).fill(r % 2 === 0)
    )
    const result = resampleGrid(grid, 8, 4)
    expect(result).toHaveLength(48)
    for (let d = 0; d < 48; d++) {
      expect(result[d]).toEqual(grid[Math.floor(d / 2)])
    }
  })

  it('upscales by factor 4 (8-line → 1-line: 24→192 rows)', () => {
    const grid = makeGrid(24)
    grid[3][7] = true
    const result = resampleGrid(grid, 8, 1)
    expect(result).toHaveLength(192)
    // source row 3 maps to dest rows 12–15
    for (let d = 12; d < 16; d++) expect(result[d][7]).toBe(true)
    expect(result[11][7]).toBe(false)
    expect(result[16][7]).toBe(false)
  })

  it('downscales by OR-merging rows (4-line → 8-line: 48→24 rows)', () => {
    const grid = makeGrid(48)
    grid[0][5] = true   // first row of block 0 is ON
    const result = resampleGrid(grid, 4, 8)
    expect(result).toHaveLength(24)
    expect(result[0][5]).toBe(true)
    expect(result[0][0]).toBe(false)
  })

  it('OR-merge: any ON cell in a source block turns dest cell ON', () => {
    const grid = makeGrid(48)
    grid[1][3] = true   // second row of block 0
    const result = resampleGrid(grid, 4, 8)
    expect(result[0][3]).toBe(true)
  })

  it('returns a copy (no mutation) when kernel is unchanged', () => {
    const grid = makeGrid(48)
    grid[5][7] = true
    const result = resampleGrid(grid, 4, 4)
    expect(result).toHaveLength(48)
    expect(result[5][7]).toBe(true)
    expect(result).not.toBe(grid)
    expect(result[5]).not.toBe(grid[5])
  })
})
