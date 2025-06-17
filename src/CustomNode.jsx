import { memo, useCallback } from 'react';
import { Handle, Position } from 'reactflow';

// The 'memo' function prevents re-rendering if props haven't changed.
function CustomNode({ data }) {
  // 'data' is an object passed when creating the node, it contains our label and onChange function.
  const onLabelChange = useCallback((evt) => {
    // This calls the function passed in the node's data to update the global state
    data.onChange(data.id, evt.target.value);
  }, [data.id, data.onChange]);

  return (
    <div className="idea-node">
      {/* Handles are the connection points for the edges. */}
      <Handle type="target" position={Position.Top} />
      
      <textarea
        defaultValue={data.label}
        onChange={onLabelChange}
        className="nodrag" // 'nodrag' class prevents node dragging when interacting with the textarea
      />
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default memo(CustomNode);