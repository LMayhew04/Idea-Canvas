import React from 'react';

const HierarchyLegend = ({ hierarchyLevels, onLevelClick, selectedNodes }) => {
  const hasSelectedNodes = selectedNodes && selectedNodes.length > 0;

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      zIndex: 100,
      minWidth: '160px'
    }}>
      <h4 style={{
        margin: '0 0 8px 0',
        fontSize: '14px',
        fontWeight: 600,
        color: '#333'
      }}>
        Hierarchy Levels
      </h4>
      
      {hasSelectedNodes && (
        <p style={{
          margin: '0 0 8px 0',
          fontSize: '12px',
          color: '#666',
          fontStyle: 'italic'
        }}>
          Click a level to assign to selected nodes
        </p>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {Object.entries(hierarchyLevels).map(([levelNum, levelData]) => (
          <div
            key={levelNum}
            onClick={() => onLevelClick && onLevelClick(levelNum)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 6px',
              borderRadius: '4px',
              cursor: hasSelectedNodes ? 'pointer' : 'default',
              backgroundColor: hasSelectedNodes ? 'transparent' : '#f8f9fa',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (hasSelectedNodes) {
                e.target.style.backgroundColor = '#f0f0f0';
              }
            }}
            onMouseLeave={(e) => {
              if (hasSelectedNodes) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <div style={{
              width: '16px',
              height: '16px',
              backgroundColor: levelData.color,
              borderRadius: '3px',
              flexShrink: 0
            }}></div>
            <span style={{
              fontSize: '13px',
              color: '#333',
              fontWeight: 500
            }}>
              {levelData.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HierarchyLegend;
