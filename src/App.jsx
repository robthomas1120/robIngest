// App.jsx
import { useState } from 'react';
import FileAnalyzer from './components/FileAnalyzer';
import SummaryPanel from './components/SummaryPanel';
import DirectoryStructurePanel from './components/DirectoryStructurePanel';
import FilesContentPanel from './components/FilesContentPanel';

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [includeStatus, setIncludeStatus] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);

  const handleAnalysisComplete = (data) => {
    setAnalysisData(data);
    setIsAnalyzing(false);
    
    // Initialize all paths as included
    const newIncludeStatus = {};
    data.flatStructure.forEach(item => {
      newIncludeStatus[item.path] = true;
    });
    setIncludeStatus(newIncludeStatus);
  };

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
    setAnalysisData(null);
    setIncludeStatus({});
    setSelectedFile(null);
  };
  
  const handleUpdateIncludeStatus = (newStatus) => {
    setIncludeStatus(newStatus);
  };
  
  const handleFileSelect = (filePath) => {
    setSelectedFile(filePath);
  };
  
  // Apply include/exclude filter to get filtered data
  const getFilteredData = () => {
    if (!analysisData) return null;
    
    const filteredContents = {};
    let filteredTokenCount = 0;
    let filteredFileCount = 0;
    
    // Filter flat structure first
    const filteredFlatStructure = analysisData.flatStructure.filter(item => {
      return includeStatus[item.path] !== false;
    });
    
    // Count tokens and files for included items
    filteredFlatStructure.forEach(item => {
      if (item.type === 'file') {
        filteredFileCount++;
        filteredTokenCount += item.tokens || 0;
        
        // Include file content if it's included
        if (analysisData.fileContents[item.path]) {
          filteredContents[item.path] = analysisData.fileContents[item.path];
        }
      }
    });
    
    // Return filtered data
    return {
      ...analysisData,
      totalTokens: filteredTokenCount,
      totalFiles: filteredFileCount,
      fileContents: filteredContents,
      flatStructure: filteredFlatStructure,
      includeStatus
    };
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 text-gray-200">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-amber-200">Git Repository Analyzer</h1>
          <p className="mt-2 text-gray-400">Upload your git repository to analyze tokens and structure</p>
        </header>

        {!analysisData && (
          <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700">
            <FileAnalyzer 
              onAnalysisStart={handleAnalysisStart}
              onAnalysisComplete={handleAnalysisComplete}
            />
          </div>
        )}

        {isAnalyzing && (
          <div className="p-6 text-center bg-gray-800 rounded-lg shadow-md border border-gray-700">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mx-auto"></div>
            <p className="mt-4 text-gray-300">Analyzing files...</p>
          </div>
        )}

        {analysisData && (
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SummaryPanel data={getFilteredData() || analysisData} />
              <DirectoryStructurePanel 
                data={analysisData}
                includeStatus={includeStatus} 
                onUpdateIncludeStatus={handleUpdateIncludeStatus}
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
              />
            </div>
            
            {selectedFile && (
              <FilesContentPanel 
                data={analysisData}
                selectedFile={selectedFile} 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;