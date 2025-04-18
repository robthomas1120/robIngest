// components/DirectoryTree.jsx
import { useState, useEffect } from 'react';
import { formatFileSize } from '../utils/exportHelpers';

const TreeNode = ({ node, depth = 0, onToggleInclude, includeStatus }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2); // Auto-expand first two levels
  
  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };
  
  const isDirectory = node.type === 'directory';
  const hasChildren = isDirectory && node.children && node.children.length > 0;
  
  // Get include status for this node
  const isIncluded = includeStatus[node.path] !== false;
  
  const handleToggleInclude = (e) => {
    e.stopPropagation();
    onToggleInclude(node.path, !isIncluded);
  };
  
  return (
    <div className="mb-1">
      <div 
        className={`flex items-start hover:bg-gray-50 py-1 px-2 rounded ${!isIncluded ? 'opacity-50' : ''}`}
        onClick={hasChildren ? toggleExpand : undefined}
      >
        <div className="flex items-center mr-2">
          <input
            type="checkbox"
            checked={isIncluded}
            onChange={handleToggleInclude}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        
        <div className="w-6 text-center flex-shrink-0">
          {hasChildren ? (
            <button 
              onClick={toggleExpand}
              className="text-gray-500 focus:outline-none"
            >
              {isExpanded ? '▼' : '►'}
            </button>
          ) : (
            <span className="text-gray-400 pl-3">•</span>
          )}
        </div>
        
        <div className="flex-1">
          <span className="font-mono">
            {isDirectory ? (
              <span className="text-blue-600 font-medium">{node.name}/</span>
            ) : (
              <span>{node.name}</span>
            )}
          </span>
          
          {!isDirectory && node.tokens !== undefined && (
            <span className="text-gray-500 text-sm ml-2">
              ({node.tokens.toLocaleString()} tokens, {formatFileSize(node.size)})
            </span>
          )}
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className={`ml-6 pl-3 border-l border-gray-200 ${!isIncluded ? 'opacity-50' : ''}`}>
          {node.children.map((child, index) => (
            <TreeNode 
              key={index} 
              node={child} 
              depth={depth + 1} 
              onToggleInclude={onToggleInclude}
              includeStatus={includeStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const DirectoryTree = ({ structure, onUpdateIncludeStatus }) => {
  const [includeStatus, setIncludeStatus] = useState({});
  
  // Initialize all nodes as included
  useEffect(() => {
    if (!structure || structure.length === 0) return;
    
    const initializeStatus = (nodes, status = {}) => {
      nodes.forEach(node => {
        status[node.path] = true;
        if (node.children && node.children.length > 0) {
          initializeStatus(node.children, status);
        }
      });
      return status;
    };
    
    setIncludeStatus(initializeStatus(structure));
  }, [structure]);
  
  // Handle toggling inclusion of a node
  const handleToggleInclude = (path, included) => {
    // Create a new status object
    const newStatus = { ...includeStatus, [path]: included };
    
    // Find the node and its children
    const updateChildrenStatus = (nodes, targetPath, included, status) => {
      for (const node of nodes) {
        if (node.path === targetPath) {
          // Found the target node, update all its children recursively
          if (node.children && node.children.length > 0) {
            updateChildrenRecursive(node.children, included, status);
          }
          return true;
        }
        
        // Check in children
        if (node.children && node.children.length > 0) {
          if (updateChildrenStatus(node.children, targetPath, included, status)) {
            return true;
          }
        }
      }
      return false;
    };
    
    // Helper function to recursively update children
    const updateChildrenRecursive = (children, included, status) => {
      children.forEach(child => {
        status[child.path] = included;
        if (child.children && child.children.length > 0) {
          updateChildrenRecursive(child.children, included, status);
        }
      });
    };
    
    // Update all children of the toggled node
    if (structure) {
      updateChildrenStatus(structure, path, included, newStatus);
    }
    
    // Update state
    setIncludeStatus(newStatus);
    
    // Call parent callback with updated status
    if (onUpdateIncludeStatus) {
      onUpdateIncludeStatus(newStatus);
    }
  };
  
  if (!structure || structure.length === 0) {
    return <div className="text-gray-500">No files found</div>;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Directory Structure</h3>
        <div className="text-sm text-gray-500">
          Use checkboxes to include/exclude files from export
        </div>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
        {structure.map((node, index) => (
          <TreeNode 
            key={index} 
            node={node} 
            onToggleInclude={handleToggleInclude}
            includeStatus={includeStatus}
          />
        ))}
      </div>
    </div>
  );
};

export default DirectoryTree;