import React, { useCallback } from 'react';
import { Handle, Position } from 'reactflow';

// Custom Node Component
const CustomNode = React.memo(({ data, id, selected }) => {
  const onLabelChange = useCallback((evt) => {
    evt.stopPropagation();
    if (data.onChange) {
      data.onChange(id, evt.target.value);
    }
  }, [id, data.onChange]);

  const onLevelChange = useCallback((evt) => {
    evt.stopPropagation(); // Prevent event bubbling
    if (data.onLevelChange) {
      data.onLevelChange(id, evt.target.value);
    }
  }, [id, data.onLevelChange]);
  const handleInputClick = useCallback((evt) => {
    evt.stopPropagation(); // Prevent node selection when clicking input
    // Force focus on the textarea for editing
    evt.target.focus();
  }, []);

  const handleSelectClick = useCallback((evt) => {
    evt.stopPropagation(); // Prevent node selection when clicking select
  }, []);

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
  ];
  return (
    <div
      className="custom-node"
      data-testid={`custom-node-${id}`}
      style={{
        minWidth: '160px',
        minHeight: data.showHierarchy ? '90px' : '70px',
        maxWidth: '250px',
        background: levelInfo.bgColor,
        border: `3px solid ${levelInfo.color}`,
        borderRadius: '16px',
        padding: '16px 12px 8px 12px',
        boxShadow: selected
          ? `0 0 0 4px ${levelInfo.color}44`
          : '0 2px 10px rgba(80, 80, 100, 0.12)',
        position: 'relative',
        userSelect: 'none',
        transition: 'all 0.2s ease',
        cursor: 'pointer'
      }}
    >
      {/* Connection Handles */}
      {handlePositions.map(({ pos, id: handleId, style }) => (
        <React.Fragment key={handleId}>
          <Handle
            type="source"
            position={pos}
            id={handleId}
            style={{
              width: 10,
              height: 10,
              background: levelInfo.color,
              border: '2px solid white',
              borderRadius: '50%',
              opacity: 0.8,
              ...style
            }}
          />
          <Handle
            type="target"
            position={pos}
            id={handleId + '_target'}
            style={{
              width: 10,
              height: 10,
              background: levelInfo.color,
              border: '2px solid white',
              borderRadius: '50%',
              opacity: 0.8,
              ...style
            }}
          />
        </React.Fragment>
      ))}

      {/* Node Label Input */}
      <textarea
        className="node-input"
        value={data.label || ''}
        onChange={onLabelChange}
        onClick={handleInputClick}
        onFocus={handleInputClick}
        spellCheck={false}
        placeholder="Enter idea..."
        style={{
          border: 'none',
          outline: 'none',
          fontSize: '16px',
          width: '100%',
          minHeight: '24px',
          maxHeight: '100px',
          background: 'transparent',
          textAlign: 'center',
          fontWeight: 600,
          color: '#373737',
          marginBottom: data.showHierarchy ? '8px' : '0px',
          transition: 'margin-bottom 0.2s ease',
          resize: 'none',
          overflow: 'hidden',
          fontFamily: 'inherit',
          cursor: 'text',
          pointerEvents: 'all'
        }}
        rows={1}
        onInput={(e) => {
          e.stopPropagation();
          e.target.style.height = 'auto';
          e.target.style.height = e.target.scrollHeight + 'px';
        }}
      />
      
      {/* Hierarchy Level Selector - Conditionally Rendered */}
      {data.showHierarchy && (
        <div style={{
          fontSize: 12,
          color: levelInfo.color,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '4px'
        }}>
          Level:&nbsp;
          <select
            value={data.level || 4}
            onChange={onLevelChange}
            onClick={handleSelectClick}
            onFocus={handleSelectClick}
            style={{
              background: levelInfo.bgColor,
              color: levelInfo.color,
              border: `1.5px solid ${levelInfo.color}`,
              borderRadius: 4,
              fontWeight: 600,
              padding: '3px 8px',
              fontSize: 11,
              cursor: 'pointer'
            }}>
            {data.hierarchyLevels && Object.entries(data.hierarchyLevels).map(([num, lvl]) => (
              <option key={num} value={num}>{lvl.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
});

export default CustomNode;