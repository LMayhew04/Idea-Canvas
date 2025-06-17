import { memo, useCallback } from 'react';
import { Handle, Position } from 'reactflow';

// The 'memo' function prevents re-rendering if props haven't changed.
function CustomNode({ data, id }) {
  const onLabelChange = useCallback((evt) => {
    data.onChange(id, evt.target.value);
  }, [id, data.onChange]);

  const onLevelChange = useCallback((evt) => {
    data.onLevelChange(id, evt.target.value);
  }, [id, data.onLevelChange]);

  const currentLevel = data.level || 4;
  const levelInfo = data.hierarchyLevels[currentLevel];

  return (
    <div 
      className="idea-node"
      style={{
        border: `3px solid ${levelInfo?.color || '#63a4ff'}`,
        backgroundColor: levelInfo?.bgColor || '#f0f8ff'
      }}
    >
      {/* 8-directional handles - no visual circles */}
      <Handle 
        type="both" 
        position={Position.Top} 
        id="n"
        style={{ opacity: 0, width: 1, height: 1 }}
      />
      <Handle 
        type="both" 
        position={Position.Top} 
        id="ne"
        style={{ 
          opacity: 0, 
          width: 1, 
          height: 1,
          right: '25%',
          top: '25%',
          transform: 'translate(50%, -50%)'
        }}
      />
      <Handle 
        type="both" 
        position={Position.Right} 
        id="e"
        style={{ opacity: 0, width: 1, height: 1 }}
      />
      <Handle 
        type="both" 
        position={Position.Right} 
        id="se"
        style={{ 
          opacity: 0, 
          width: 1, 
          height: 1,
          right: '25%',
          bottom: '25%',
          transform: 'translate(50%, 50%)'
        }}
      />
      <Handle 
        type="both" 
        position={Position.Bottom} 
        id="s"
        style={{ opacity: 0, width: 1, height: 1 }}
      />
      <Handle 
        type="both" 
        position={Position.Bottom} 
        id="sw"
        style={{ 
          opacity: 0, 
          width: 1, 
          height: 1,
          left: '25%',
          bottom: '25%',
          transform: 'translate(-50%, 50%)'
        }}
      />
      <Handle 
        type="both" 
        position={Position.Left} 
        id="w"
        style={{ opacity: 0, width: 1, height: 1 }}
      />
      <Handle 
        type="both" 
        position={Position.Left} 
        id="nw"
        style={{ 
          opacity: 0, 
          width: 1, 
          height: 1,
          left: '25%',
          top: '25%',
          transform: 'translate(-50%, -50%)'
        }}
      />
      
      {/* Level indicator */}
      <div className="level-indicator">
        L{currentLevel}
      </div>

      {/* Level selector */}
      <select 
        className="level-selector nodrag"
        value={currentLevel}
        onChange={onLevelChange}
        title="Hierarchy Level"
      >
        {Object.entries(data.hierarchyLevels || {}).map(([level, info]) => (
          <option key={level} value={level}>{level}. {info.name}</option>
        ))}
      </select>
      
      <textarea
        value={data.label}
        onChange={onLabelChange}
        className="nodrag"
        placeholder="Enter idea..."
      />

      {/* Group indicator */}
      {data.group && (
        <div className="group-indicator" title={`Group: ${data.group}`}>
          📁
        </div>
      )}
    </div>
  );
}

export default memo(CustomNode);