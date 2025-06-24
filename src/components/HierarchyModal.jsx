import React, { useState } from 'react';

const HierarchyModal = ({ isOpen, onClose, hierarchyLevels, onUpdateHierarchy, showHierarchy, onToggleHierarchy }) => {
  const [tempLevels, setTempLevels] = useState(hierarchyLevels);

  const handleLevelNameChange = (levelNum, newName) => {
    setTempLevels(prev => ({
      ...prev,
      [levelNum]: { ...prev[levelNum], name: newName }
    }));
  };

  const handleSave = () => {
    onUpdateHierarchy(tempLevels);
    onClose();
  };

  const handleCancel = () => {
    setTempLevels(hierarchyLevels);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        minWidth: '400px',
        maxWidth: '500px'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px', fontWeight: 600 }}>
          Hierarchy Settings
        </h2>
        
        {/* Show Hierarchy Toggle */}
        <div style={{
          marginBottom: '20px',
          padding: '12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <input
            type="checkbox"
            id="showHierarchy"
            checked={showHierarchy}
            onChange={(e) => onToggleHierarchy(e.target.checked)}
            style={{ transform: 'scale(1.2)' }}
          />
          <label htmlFor="showHierarchy" style={{ fontSize: '14px', fontWeight: 500 }}>
            Show hierarchy levels on nodes
          </label>
        </div>

        {/* Level Name Editors */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '12px', fontWeight: 500 }}>
            Level Names:
          </h3>
          {Object.entries(tempLevels).map(([levelNum, levelData]) => (
            <div key={levelNum} style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px',
              gap: '12px'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: levelData.color,
                borderRadius: '4px',
                flexShrink: 0
              }}></div>
              <span style={{ minWidth: '80px', fontSize: '14px' }}>Level {levelNum}:</span>
              <input
                type="text"
                value={levelData.name}
                onChange={(e) => handleLevelNameChange(levelNum, e.target.value)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          <button
            onClick={handleCancel}
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#2271f5',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default HierarchyModal;
