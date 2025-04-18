// utils/exportHelpers.js

/**
 * Format file size in human-readable form
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Download data as a text file
 */
export const downloadFile = (content, filename) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
};

/**
 * Generate a directory tree as text, respecting inclusion status
 */
export const generateDirectoryTree = (structure, depth = 0, includeStatus = {}) => {
  if (!structure || structure.length === 0) return '';
  
  let result = '';
  
  structure.forEach(item => {
    // Skip if explicitly excluded
    if (includeStatus[item.path] === false) {
      return;
    }
    
    const indent = depth === 0 ? '└── ' : '    '.repeat(depth - 1) + '├── ';
    
    if (item.type === 'directory') {
      result += `${indent}${item.name}/\n`;
      
      if (item.children && item.children.length > 0) {
        result += generateDirectoryTree(item.children, depth + 1, includeStatus);
      }
    } else {
      result += `${indent}${item.name}\n`;
    }
  });
  
  return result;
};