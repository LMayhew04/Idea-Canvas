import React from 'react';

const SelectionInfo = ({ selectedElements }) => {
  // Don't render if nothing is selected
  if (selectedElements.nodes.length === 0 && selectedElements.edges.length === 0) {
    return null;
  }

  return (
    <div style={{
      position: 'absolute',
      top: 60,
      left: 10,
      zIndex: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: 8,
      borderRadius: 6,
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      fontSize: 12,
      color: '#666'
    }}>
      {selectedElements.nodes.length > 0 && `${selectedElements.nodes.length} node(s) selected`}
      {selectedElements.edges.length > 0 && `${selectedElements.edges.length} edge(s) selected`}
      <div style={{ fontSize: 11, marginTop: 4 }}>
        Press Delete or Backspace to remove selected items
      </div>
    </div>
  );
};

export default SelectionInfo;
