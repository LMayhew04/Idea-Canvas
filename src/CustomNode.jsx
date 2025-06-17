import { memo, useCallback } from 'react';
import { Handle, Position } from 'reactflow';

// 8 compass positions mapped to ReactFlow's Handle
const positionOrder = [
  { pos: Position.Top, id: 'n', style: { left: '50%', top: -6, transform: 'translateX(-50%)' } },
  { pos: Position.TopRight, id: 'ne', style: { right: -6, top: -6 } },
  { pos: Position.Right, id: 'e', style: { right: -6, top: '50%', transform: 'translateY(-50%)' } },
  { pos: Position.BottomRight, id: 'se', style: { right: -6, bottom: -6 } },
  { pos: Position.Bottom, id: 's', style: { left: '50%', bottom: -6, transform: 'translateX(-50%)' } },
  { pos: Position.BottomLeft, id: 'sw', style: { left: -6, bottom: -6 } },
  { pos: Position.Left, id: 'w', style: { left: -6, top: '50%', transform: 'translateY(-50%)' } },
  { pos: Position.TopLeft, id: 'nw', style: { left: -6, top: -6 } },
];

function CustomNode({ data, id, selected }) {
  const onLabelChange = useCallback((evt) => {
    if (data.onChange) {
      data.onChange(id, evt.target.value);
    }
  }, [id, data.onChange]);

  const onLevelChange = useCallback((evt) => {
    if (data.onLevelChange) {
      data.onLevelChange(id, evt.target.value);
    }
  }, [id, data.onLevelChange]);

  const currentLevel = data.level || 4;
  const levelInfo = data.hierarchyLevels?.[currentLevel] || {
    name: 'Individual',
    color: '#96ceb4',
    bgColor: '#f0fff4'
  };

  return (
    <div
      className={`idea-node ${selected ? 'group-selected-node' : ''}`}
      style={{
        border: `3px solid ${levelInfo.color}`,
        backgroundColor: levelInfo.bgColor,
        boxShadow: selected
          ? '0 0 0 4px #2271f522'
          : '0 2px 10px rgba(80, 80, 100, 0.09)'
      }}
    >
      {/* 8-directional handles - invisible for connection, no blue circles */}
      {positionOrder.map(({ pos, id: handleId, style }) => (
        <Handle
          key={handleId}
          type="source"
          position={pos}
          id={handleId}
          style={{
            opacity: 0,
            width: 8,
            height: 8,
            background: 'none',
            border: 'none',
            ...style
          }}
        />
      ))}
      {positionOrder.map(({ pos, id: handleId, style }) => (
        <Handle
          key={handleId + '_t'}
          type="target"
          position={pos}
          id={handleId}
          style={{
            opacity: 0,
            width: 8,
            height: 8,
            background: 'none',
            border: 'none',
            ...style
          }}
        />
      ))}

      <input
        className="node-label"
        value={data.label || ''}
        onChange={onLabelChange}
        spellCheck={false}
        placeholder="Enter idea..."
        style={{
          border: 'none',
          outline: 'none',
          fontSize: 18,
          width: '100%',
          background: 'transparent',
          textAlign: 'center',
          fontWeight: 600,
          color: '#373737'
        }}
      />
      <div style={{
        marginTop: 10,
        fontSize: 13,
        color: levelInfo.color,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        Level:&nbsp;
        <select
          value={data.level || 4}
          onChange={onLevelChange}
          style={{
            background: levelInfo.bgColor,
            color: levelInfo.color,
            border: `1.5px solid ${levelInfo.color}`,
            borderRadius: 4,
            fontWeight: 600,
            padding: '2px 6px',
            fontSize: 12
          }}>
          {data.hierarchyLevels && Object.entries(data.hierarchyLevels).map(([num, lvl]) => (
            <option key={num} value={num}>{lvl.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default memo(CustomNode);