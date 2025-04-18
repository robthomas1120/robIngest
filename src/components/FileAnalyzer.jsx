// components/FileAnalyzer.jsx
import { useCallback, useRef, useState } from 'react';
import useFileSystem from '../hooks/useFileSystem';

const FileAnalyzer = ({ onAnalysisStart, onAnalysisComplete }) => {
  const [uploadProgress, setUploadProgress] = useState({ status: '', percentage: 0 });
  
  const { processFiles, isProcessing } = useFileSystem({
    onStart: onAnalysisStart,
    onComplete: onAnalysisComplete,
    onProgress: setUploadProgress
  });
  
  const fileInputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    if (e.dataTransfer.items) {
      processFiles(e.dataTransfer.items);
    } else if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleFileSelect = useCallback((e) => {
    console.log("File selection changed");
    const files = e.target.files;
    
    if (files && files.length > 0) {
      console.log(`Selected ${files.length} files/folders`);
      processFiles(files);
    }
  }, [processFiles]);

  return (
    <div 
      className="border-2 border-dashed border-gray-700 rounded-lg p-16 text-center cursor-pointer hover:border-amber-500 transition-colors m-6"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => !isProcessing && fileInputRef.current?.click()}
    >
      {isProcessing ? (
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md mx-auto mb-4">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-gray-700 text-amber-200">
                    {uploadProgress.status || 'Processing files...'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-amber-200">
                    {uploadProgress.percentage}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
                <div style={{ width: `${uploadProgress.percentage}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <svg className="mx-auto h-16 w-16 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="mt-4 text-xl font-medium text-gray-300">
            Drag and drop any folder to analyze
          </h2>
          <p className="mt-2 text-gray-500">or click to browse files</p>
          
          <button 
            className="mt-6 bg-amber-500 hover:bg-amber-600 text-gray-900 py-2 px-6 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Select Folder
          </button>
          
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            onChange={handleFileSelect} 
            webkitdirectory=""
            directory=""
            multiple
          />
          
          <p className="mt-4 text-sm text-gray-400">
            The analysis happens locally in your browser - no files are uploaded to any server.
          </p>
        </>
      )}
    </div>
  );
};

export default FileAnalyzer;