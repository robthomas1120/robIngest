// components/SummaryPanel.jsx
import React from 'react';
import { generateDirectoryTree } from '../utils/exportHelpers';

const SummaryPanel = ({ data }) => {
  if (!data) return null;

  // Extract repository name
  const repoName = data.repoName || 'Repository';

  return (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700">
      <div className="flex justify-between items-center px-6 py-4 bg-gray-700 border-b border-gray-600">
        <h2 className="text-xl font-semibold text-amber-200">Summary</h2>
        <button 
          className="bg-amber-500 hover:bg-amber-600 text-gray-900 px-4 py-2 rounded-md flex items-center"
          onClick={() => {
            navigator.clipboard.writeText(`Repository: ${repoName}\nFiles analyzed: ${data.totalFiles}\nEstimated tokens: ${(data.totalTokens / 1000).toFixed(1)}k`);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
          Copy
        </button>
      </div>
      
      <div className="p-6 bg-gray-800">
        <pre className="font-mono text-lg leading-relaxed text-gray-300">
          <div>Repository: <span className="text-amber-300">{repoName}</span></div>
          <div className="mt-2">Files analyzed: <span className="text-amber-300">{data.totalFiles}</span></div>
          <div className="mt-2">Estimated tokens: <span className="text-amber-300">{(data.totalTokens / 1000).toFixed(1)}k</span></div>
        </pre>
      </div>
      
      <div className="flex space-x-4 p-4 bg-gray-700 border-t border-gray-600">
        <button 
          className="bg-amber-500 hover:bg-amber-600 text-gray-900 px-4 py-2 rounded-md flex items-center"
          onClick={() => {
            // Generate file content section
            let fileContentsText = "\n\nFiles Content:\n\n";
            for (const [path, content] of Object.entries(data.fileContents)) {
              // Skip excluded files
              if (data.includeStatus && data.includeStatus[path] === false) {
                continue;
              }
              fileContentsText += `--- ${path} ---\n\n${content}\n\n`;
            }
            
            // Create full output with summary, directory structure, and file contents
            const fullContent = `Repository: ${repoName}\nFiles analyzed: ${data.totalFiles}\nEstimated tokens: ${(data.totalTokens / 1000).toFixed(1)}k\n\nDirectory structure:\n${generateDirectoryTree(data.directoryStructure, 0, data.includeStatus)}${fileContentsText}`;
            
            // Download the full content
            const blob = new Blob([fullContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${repoName}_analysis.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Download
        </button>
        
        <button 
          className="bg-amber-500 hover:bg-amber-600 text-gray-900 px-4 py-2 rounded-md flex items-center"
          onClick={() => {
            // Generate file content section
            let fileContentsText = "\n\nFiles Content:\n\n";
            for (const [path, content] of Object.entries(data.fileContents)) {
              // Skip excluded files
              if (data.includeStatus && data.includeStatus[path] === false) {
                continue;
              }
              fileContentsText += `--- ${path} ---\n\n${content}\n\n`;
            }
            
            // Create full output with summary, directory structure, and file contents
            const fullContent = `Repository: ${repoName}\nFiles analyzed: ${data.totalFiles}\nEstimated tokens: ${(data.totalTokens / 1000).toFixed(1)}k\n\nDirectory structure:\n${generateDirectoryTree(data.directoryStructure, 0, data.includeStatus)}${fileContentsText}`;
            
            // Copy to clipboard
            navigator.clipboard.writeText(fullContent);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
          Copy all
        </button>
      </div>
    </div>
  );
};

export default SummaryPanel;