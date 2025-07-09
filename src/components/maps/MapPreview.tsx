// MapPreview is now fully responsive and dark mode aware. The grid and cells adapt to container size and theme.
import React from 'react';

type CellState = 'inbounds' | 'outbounds' | 'occupied';

const CELL_COLORS = {
  inbounds: 'bg-green-500 dark:bg-green-400',
  outbounds: 'bg-red-500 dark:bg-red-400',
  occupied: 'bg-blue-500 dark:bg-blue-400',
};

interface MapPreviewProps {
  map?: {
    width: number;
    height: number;
    cells: Array<{
      x: number;
      y: number;
      state: CellState;
    }>;
  };
  cellSize?: number;
  interactive?: boolean;
  onCellClick?: (x: number, y: number) => void;
  className?: string;
}

export const MapPreview: React.FC<MapPreviewProps> = ({ 
  map, 
  cellSize = 20, 
  interactive = false,
  onCellClick,
  className = ""
}) => {
  // Handle case where map is undefined or doesn't have required properties
  if (!map || !map.width || !map.height || !map.cells) {
    return (
      <div className={`map-preview-outer-wrapper w-full max-w-full overflow-auto flex justify-center ${className}`}>
        <div className="flex items-center justify-center p-8 text-muted-foreground">
          <p>No map data available</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`map-preview-outer-wrapper w-full max-w-full overflow-auto flex justify-center ${className}`}
      style={{
        maxHeight: '60vh',
        minWidth: 0,
      }}
    >
      <div
        className="map-preview-grid grid border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        style={{
          gridTemplateColumns: `repeat(${map.width}, minmax(0, ${cellSize}px))`,
          width: 'fit-content',
          maxWidth: '100%',
          gap: '1px',
        }}
      >
        {map.cells.map((cell) => (
          <div
            key={`${cell.x}-${cell.y}`}
            className={`map-preview-cell ${CELL_COLORS[cell.state]} ${
              interactive ? 'cursor-pointer hover:opacity-80 transition-colors duration-150' : ''
            } border border-gray-200 dark:border-gray-700`}
            style={{
              width: cellSize,
              height: cellSize,
              minWidth: 0,
              minHeight: 0,
            }}
            onClick={() => interactive && onCellClick && onCellClick(cell.x, cell.y)}
          />
        ))}
      </div>
    </div>
  );
}; 