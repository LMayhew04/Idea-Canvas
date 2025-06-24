import React, { useCallback, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

// Custom Node Component
const CustomNode = React.memo(({ data, id, selected }) => {
  // State for text editing
  const [label, setLabel] = useState(data.label || 'New Idea');

  // Sync local label state with prop changes  
  useEffect(() => {
    setLabel(data.label || 'New Idea');
  }, [data.label]);
  // Calculate dynamic height based on text content
  const calculateHeight = useCallback(() => {
    const baseHeight = 70;
    const textLength = label.length;
    const lineHeight = 20;
    const charsPerLine = 20; // Approximate characters per line
    const estimatedLines = Math.ceil(textLength / charsPerLine);
    return Math.max(baseHeight, estimatedLines * lineHeight + 40); // 40px for padding
  }, [label]);

  const currentLevel = data.level || 4;
  const levelInfo = data.hierarchyLevels?.[currentLevel] || {
    name: 'Individual',
    color: '#96ceb4',
    bgColor: '#f0fff4'
  };
  // 8 compass positions mapped to ReactFlow's Handle positions
  const handlePositions = [
    { pos: Position.Top, id: 'n', style: { left: '50%', top: -6, transform: 'translateX(-50%)' } },
    { pos: Position.TopRight, id: 'ne', style: { right: -6, top: -6 } },
    { pos: Position.Right, id: 'e', style: { right: -6, top: '50%', transform: 'translateY(-50%)' } },
    { pos: Position.BottomRight, id: 'se', style: { right: -6, bottom: -6 } },
    { pos: Position.Bottom, id: 's', style: { left: '50%', bottom: -6, transform: 'translateX(-50%)' } },
    { pos: Position.BottomLeft, id: 'sw', style: { left: -6, bottom: -6 } },
    { pos: Position.Left, id: 'w', style: { left: -6, top: '50%', transform: 'translateY(-50%)' } },
    { pos: Position.TopLeft, id: 'nw', style: { left: -6, top: -6 } },
  ];  return (
    <div
      className="custom-node"
      data-testid={`custom-node-${id}`}
      style={{
        minWidth: '160px',
        height: `${calculateHeight()}px`,
        maxWidth: '250px',
        background: levelInfo.bgColor,
        border: `3px solid ${levelInfo.color}`,
        borderRadius: '16px',
        padding: '16px 12px 8px 12px',
        boxShadow: selected
          ? `0 0 0 4px ${levelInfo.color}44`
          : '0 2px 10px rgba(80, 80, 100, 0.12)',
        position: 'relative',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >{/* Connection Handles - Both source and target handles */}
      {handlePositions.map(({ pos, id: handleId, style }) => (
        <React.Fragment key={handleId}>          <Handle
            type="source"
            position={pos}
            id={handleId}
            style={{
              width: 12,
              height: 12,
              background: levelInfo.color,
              border: '2px solid white',
              borderRadius: '50%',
              opacity: 0.9,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              zIndex: 10,
              transition: 'all 0.2s ease',
              ...style
            }}
            className="custom-handle"
            isConnectable={true}
          />
          <Handle
            type="target"
            position={pos}
            id={handleId + '_target'}
            style={{
              width: 12,
              height: 12,
              background: levelInfo.color,
              border: '2px solid white',
              borderRadius: '50%',
              opacity: 0.9,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              zIndex: 10,
              transition: 'all 0.2s ease',
              ...style
            }}
            className="custom-handle-target"
            isConnectable={true}
          />
        </React.Fragment>
      ))}      {/* Node Label - Read-only text display */}
      <div 
        style={{ 
          width: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          padding: '4px',
          borderRadius: '4px'
        }}
      >
        <div
          className="nodrag"
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#373737',
            textAlign: 'center',
            width: '100%',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            hyphens: 'auto',
            lineHeight: '1.4',
            cursor: 'default'
          }}
          data-testid={`node-text-${id}`}
        >
          {label}
        </div>
      </div>
    </div>
  );
});

export default CustomNode;