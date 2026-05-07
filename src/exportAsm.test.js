import { describe, it, expect } from 'vitest'
import { exportAsm } from './exportAsm'

function makeGrid(rows) {
  return Array.from({ length: rows }, () => new Array(40).fill(false))
}

function totalHexBytes(asm) {
  return asm.split('\n')
    .filter(l => l.trim().startsWith('hex'))
    .reduce((sum, l) => sum + l.trim().slice(4).length / 2, 0)
}

describe('exportAsm', () => {
  it('emits 288 total bytes (48×6) for 4-line kernel', () => {
    expect(totalHexBytes(exportAsm('Test', makeGrid(48), 4))).toBe(288)
  })

  it('emits 144 total bytes (24×6) for 8-line kernel', () => {
    expect(totalHexBytes(exportAsm('Test', makeGrid(24), 8))).toBe(144)
  })

  it('emits 576 total bytes (96×6) for 2-line kernel', () => {
    expect(totalHexBytes(exportAsm('Test', makeGrid(96), 2))).toBe(576)
  })

  it('emits 1152 total bytes (192×6) for 1-line kernel', () => {
    expect(totalHexBytes(exportAsm('Test', makeGrid(192), 1))).toBe(1152)
  })

  it('includes all 6 bitmap labels', () => {
    const asm = exportAsm('Scr', makeGrid(48), 4)
    for (let b = 0; b < 6; b++) expect(asm).toContain(`ScrBitmap${b}`)
  })
})
