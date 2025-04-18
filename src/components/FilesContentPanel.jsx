// components/FilesContentPanel.jsx
import React from 'react';

const FilesContentPanel = ({ data, selectedFile }) => {
  if (!data || !selectedFile || !data.fileContents[selectedFile]) {
    return null;
  }
  
  const fileContent = data.fileContents[selectedFile];
  
  // Helper function to get file extension
  const getFileExtension = (filename) => {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
  };
  
  // Get the selected file extension for potential syntax highlighting
  const extension = getFileExtension(selectedFile.split('/').pop());
  
  // Find selected file in flat structure to get token count
  const fileInfo = data.flatStructure.find(item => item.path === selectedFile);
  const tokenCount = fileInfo ? fileInfo.tokens || 0 : 0;
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700">
      <div className="flex justify-between items-center px-6 py-4 bg-gray-700 border-b border-gray-600">
        <h2 className="text-xl font-semibold text-amber-200">File Content</h2>
        <button 
          className="bg-amber-500 hover:bg-amber-600 text-gray-900 px-4 py-2 rounded-md flex items-center"
          onClick={() => {
            navigator.clipboard.writeText(fileContent);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
          Copy
        </button>
      </div>
      
      <div className="p-4 bg-gray-700 border-b border-gray-600">
        <div className="flex items-center text-sm">
          <span className="font-mono text-gray-300">{selectedFile}</span>
          <span className="ml-4 bg-gray-800 text-amber-200 px-2 py-1 rounded text-xs">
            {tokenCount.toLocaleString()} tokens
          </span>
        </div>
      </div>
      
      <div className="p-6 overflow-auto max-h-[600px] bg-gray-800">
        <pre className="text-sm font-mono whitespace-pre-wrap text-gray-300">{fileContent}</pre>
      </div>
    </div>
  );
};

export default FilesContentPanel;