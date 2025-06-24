import React from 'react';

const SelectionInfo = ({ selectedElements }) => {
  // Don't render if nothing is selected
  if (selectedElements.nodes.length === 0 && selectedElements.edges.length === 0) {
    return null;
  }

  const nodeCount = selectedElements.nodes.length;
  const edgeCount = selectedElements.edges.length;
  const hasMultipleNodes = nodeCount > 1;
  const hasSingleNode = nodeCount === 1;

  return (
    <div style={{
      position: 'absolute',
      top: 60,
      left: 10,
      zIndex: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: 12,
      borderRadius: 8,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      fontSize: 12,
      color: '#444',
      border: '1px solid #e1e5e9',
      minWidth: 200
    }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: '#2c3e50' }}>
        Selection Info
      </div>
      
      {nodeCount > 0 && (
        <div style={{ marginBottom: 4 }}>
          <span style={{ color: '#3498db', fontWeight: 500 }}>
            {nodeCount} node{nodeCount !== 1 ? 's' : ''} selected
          </span>
          {hasSingleNode && (
            <div style={{ fontSize: 11, color: '#7f8c8d', marginTop: 2 }}>
              • Use "Edit Text" to modify content
              • Click hierarchy legend to change level
            </div>
          )}
          {hasMultipleNodes && (
            <div style={{ fontSize: 11, color: '#7f8c8d', marginTop: 2 }}>
              • Use hierarchy legend to batch change levels
              • Delete key removes all selected
            </div>
          )}
        </div>
      )}
      
      {edgeCount > 0 && (
        <div style={{ marginBottom: 4 }}>
          <span style={{ color: '#e67e22', fontWeight: 500 }}>
            {edgeCount} connection{edgeCount !== 1 ? 's' : ''} selected
          </span>
        </div>
      )}
      
      <div style={{ 
        fontSize: 11, 
        color: '#95a5a6', 
        marginTop: 6, 
        paddingTop: 6, 
        borderTop: '1px solid #ecf0f1' 
      }}>
        Press Delete/Backspace to remove selected items
      </div>
    </div>
  );
};

export default SelectionInfo;
