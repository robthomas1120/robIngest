// components/DirectoryStructurePanel.jsx
import React, { useState } from 'react';
import { generateDirectoryTree } from '../utils/exportHelpers';

// TreeNode component defined outside the main component
const TreeNode = ({ node, depth = 0, onFileSelect, selectedFile, includeStatus = {}, onToggleInclude }) => {
  const [isExpanded, setIsExpanded] = useState(true); // Auto-expand all by default
  
  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };
  
  const handleFileClick = (e) => {
    e.stopPropagation();
    if (node.type === 'file') {
      onFileSelect(node.path);
    } else {
      toggleExpand(e);
    }
  };

  const handleToggleInclude = (e) => {
    e.stopPropagation();
    onToggleInclude(node.path, !isIncluded);
  };
  
  const isDirectory = node.type === 'directory';
  const hasChildren = isDirectory && node.children && node.children.length > 0;
  const isSelected = selectedFile === node.path;
  
  // Get include status for this node
  const isIncluded = includeStatus[node.path] !== false;
  
  return (
    <div className="font-mono leading-relaxed">
      <div 
        className={`flex items-start py-1 rounded ${isSelected ? 'bg-gray-700' : ''} 
                   ${!isIncluded ? 'text-gray-500' : ''} hover:bg-gray-700 cursor-pointer`}
      >
        {/* Expand/collapse button for directories */}
        {isDirectory && hasChildren && (
          <span 
            className="text-gray-400 mr-1 cursor-pointer w-4 text-center"
            onClick={toggleExpand}
          >
            {isExpanded ? '▼' : '►'}
          </span>
        )}
        
        {/* Spacer for files or empty directories */}
        {(!isDirectory || !hasChildren) && (
          <span className="w-4"></span>
        )}
        
        {/* Include/exclude checkbox */}
        <input
          type="checkbox"
          className="mr-2 mt-1"
          checked={isIncluded}
          onChange={handleToggleInclude}
          onClick={(e) => e.stopPropagation()}
        />
        
        {/* File/directory icon and path */}
        <div
          className="flex-1 cursor-pointer"
          onClick={handleFileClick}
        >
          {!isDirectory && (
            <span className="text-gray-500 mr-1">{'    '.repeat(depth)}├── </span>
          )}
          
          {isDirectory && (
            <span className="text-gray-500 mr-1">
              {depth === 0 ? '└── ' : '    '.repeat(depth - 1) + '├── '}
            </span>
          )}
          
          <span className={isDirectory ? 'text-amber-300 font-semibold' : ''}>
            {node.name}{isDirectory ? '/' : ''}
          </span>
          
          {!isDirectory && node.tokens && (
            <span className="ml-2 text-xs bg-gray-700 text-amber-200 px-2 py-1 rounded">
              {node.tokens} tokens
            </span>
          )}
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className={`ml-4 ${!isIncluded ? 'text-gray-500' : ''}`}>
          {node.children.map((child, index) => (
            <TreeNode 
              key={index} 
              node={child} 
              depth={depth + 1} 
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
              includeStatus={includeStatus}
              onToggleInclude={onToggleInclude}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Main component
const DirectoryStructurePanel = ({ data, includeStatus = {}, onFileSelect, selectedFile, onUpdateIncludeStatus }) => {
  if (!data || !data.directoryStructure || data.directoryStructure.length === 0) {
    return null;
  }
  
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
    if (data.directoryStructure) {
      updateChildrenStatus(data.directoryStructure, path, included, newStatus);
    }
    
    // Call parent with updated status
    onUpdateIncludeStatus(newStatus);
  };
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700">
      <div className="flex justify-between items-center px-6 py-4 bg-gray-700 border-b border-gray-600">
        <h2 className="text-xl font-semibold text-amber-200">Directory Structure</h2>
        <button 
          className="bg-amber-500 hover:bg-amber-600 text-gray-900 px-4 py-2 rounded-md flex items-center"
          onClick={() => {
            const treeText = `Directory structure:\n${generateDirectoryTree(data.directoryStructure, 0, includeStatus)}`;
            navigator.clipboard.writeText(treeText);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
          Copy
        </button>
      </div>
      
      <div className="p-6 bg-gray-800 max-h-96 overflow-y-auto">
        <pre className="text-gray-300">
          <div>Directory structure:</div>
          {data.directoryStructure.map((node, index) => (
            <TreeNode 
              key={index} 
              node={node} 
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
              includeStatus={includeStatus}
              onToggleInclude={handleToggleInclude}
            />
          ))}
        </pre>
      </div>
    </div>
  );
};

export default DirectoryStructurePanel;