import TileThumbnail from './TileThumbnail'

export default function TileLibrary({
  tiles,
  tileWidth,
  tileHeight,
  selectedTileId,
  editingTileId,
  activeTool,
  cellColor,
  onSelectTile,
  onAddTile,
  onDeleteTile,
  onTileWidthChange,
  onTileHeightChange,
  onChangeTool,
}) {
  return (
    <div className="tile-library">

      {/* Tools */}
      <div className="library-section">
        <div className="library-section__label">Tool</div>
        <div className="tool-group">
          <button
            className={`tool-btn${activeTool === 'pen' ? ' tool-btn--active' : ''}`}
            onClick={() => onChangeTool('pen')}
          >
            Pen
          </button>
          <button
            className={`tool-btn${activeTool === 'stamp' ? ' tool-btn--active' : ''}`}
            onClick={() => onChangeTool('stamp')}
            disabled={tiles.length === 0}
            title={tiles.length === 0 ? 'Add a tile first' : 'Stamp selected tile'}
          >
            Stamp
          </button>
        </div>
      </div>

      {/* Tile size */}
      <div className="library-section">
        <div className="library-section__label">Tile Size</div>
        <div className="tile-size-row">
          <label className="size-label">
            W
            <input
              type="number"
              className="size-input"
              value={tileWidth}
              min={1}
              max={40}
              onBlur={e => onTileWidthChange(Math.max(1, Math.min(40, Number(e.target.value) || 1)))}
              onKeyDown={e => e.key === 'Enter' && e.target.blur()}
              onChange={e => onTileWidthChange(Math.max(1, Math.min(40, Number(e.target.value) || 1)))}
            />
          </label>
          <label className="size-label">
            H
            <input
              type="number"
              className="size-input"
              value={tileHeight}
              min={1}
              max={48}
              onBlur={e => onTileHeightChange(Math.max(1, Math.min(48, Number(e.target.value) || 1)))}
              onKeyDown={e => e.key === 'Enter' && e.target.blur()}
              onChange={e => onTileHeightChange(Math.max(1, Math.min(48, Number(e.target.value) || 1)))}
            />
          </label>
        </div>
      </div>

      {/* Tile list */}
      <div className="library-section library-section--grow">
        <div className="library-section__header">
          <span className="library-section__label">Tiles</span>
          <button className="add-tile-btn" onClick={onAddTile} title="Add new tile">+</button>
        </div>
        <div className="tile-list">
          {tiles.length === 0 && (
            <p className="tile-list__empty">No tiles yet.<br />Click + to add one.</p>
          )}
          {tiles.map(tile => (
            <TileThumbnail
              key={tile.id}
              tile={tile}
              isSelected={tile.id === selectedTileId}
              isEditing={tile.id === editingTileId}
              cellColor={cellColor}
              onClick={() => onSelectTile(tile.id)}
              onDelete={() => onDeleteTile(tile.id)}
            />
          ))}
        </div>
      </div>

    </div>
  )
}
