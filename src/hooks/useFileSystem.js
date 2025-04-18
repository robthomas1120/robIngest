// hooks/useFileSystem.js
import { useState, useCallback } from 'react';

const useFileSystem = ({ onStart, onComplete, onProgress }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processFiles = useCallback(async (files) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    if (onStart) onStart();
    
    try {
      console.log('Processing files:', files);
      
      // Check if files is empty
      if (!files || files.length === 0) {
        console.error('No files to process');
        alert('No files or folders selected');
        setIsProcessing(false);
        return;
      }
      
      // Process the files
      const fileArray = Array.from(files);
      console.log(`Processing ${fileArray.length} files...`);
      
      // Update progress
      if (onProgress) onProgress({ status: 'Scanning files...', percentage: 10 });
      
      // Get top-level directory name from the first file path if available
      let repoName = '';
      if (fileArray.length > 0 && fileArray[0].webkitRelativePath) {
        const pathParts = fileArray[0].webkitRelativePath.split('/');
        if (pathParts.length > 0) repoName = pathParts[0];
      } else {
        // Try to determine folder name from entry
        if (fileArray[0].name) repoName = fileArray[0].name;
      }
      
      // If still no repo name, use a generic name
      if (!repoName) repoName = 'repository';
      
      // Prepare data structures
      const structure = [];
      const contents = {};
      let totalTokenCount = 0;
      let totalFiles = 0;
      let totalDirectories = 0;
      
      // Map to track directories for building the tree structure
      const dirMap = new Map();
      
      // Update progress
      if (onProgress) onProgress({ status: 'Analyzing files...', percentage: 30 });
      
      // Process each file
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const progress = Math.min(30 + Math.floor((i / fileArray.length) * 60), 90);
        if (onProgress) onProgress({ status: 'Processing files...', percentage: progress });
        
        try {
          // Get file path - use webkitRelativePath if available, otherwise use name
          const relativePath = file.webkitRelativePath || file.name;
          const pathParts = relativePath.split('/');
          const fileName = pathParts.pop(); // Last part is the filename
          const filePath = relativePath;
          
          // Create directory entries for the path
          let currentPath = '';
          for (let j = 0; j < pathParts.length; j++) {
            const dirName = pathParts[j];
            if (!dirName) continue; // Skip empty parts
            
            const prevPath = currentPath;
            currentPath = currentPath ? `${currentPath}/${dirName}` : dirName;
            
            // Add directory if not already added
            if (!dirMap.has(currentPath)) {
              totalDirectories++;
              const dirEntry = {
                name: dirName,
                path: currentPath,
                type: 'directory',
                parent: prevPath
              };
              dirMap.set(currentPath, dirEntry);
              structure.push(dirEntry);
            }
          }
          
          // Skip binary files or very large files
          if (isBinaryFile(file) || file.size > 10 * 1024 * 1024) {
            structure.push({
              name: fileName,
              path: filePath,
              type: 'file',
              size: file.size,
              tokens: 0,
              binary: true,
              parent: currentPath
            });
            continue;
          }
          
          // Read text content
          const text = await file.text();
          
          // Simple token estimation (approx 4 chars per token)
          const tokens = Math.ceil(text.length / 4);
          
          totalTokenCount += tokens;
          totalFiles++;
          
          // Add to structure
          structure.push({
            name: fileName,
            path: filePath,
            type: 'file',
            size: file.size,
            tokens: tokens,
            parent: currentPath
          });
          
          // Store content
          contents[filePath] = text;
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
        }
      }
      
      // Update progress
      if (onProgress) onProgress({ status: 'Building directory tree...', percentage: 95 });
      
      // Build the tree structure
      const buildTree = (items) => {
        const root = [];
        const map = {};
        
        // First pass: create all nodes with empty children arrays
        items.forEach(item => {
          map[item.path] = { ...item, children: [] };
        });
        
        // Second pass: build the tree
        items.forEach(item => {
          const node = map[item.path];
          
          if (item.parent) {
            // Add to parent's children if parent exists
            if (map[item.parent]) {
              map[item.parent].children.push(node);
            } else {
              // No parent found, add to root
              root.push(node);
            }
          } else {
            // Root level item
            root.push(node);
          }
        });
        
        return root;
      };
      
      const tree = buildTree(structure);
      
      // Final result
      const result = {
        totalTokens: totalTokenCount,
        totalFiles: totalFiles,
        totalDirectories: totalDirectories,
        directoryStructure: tree,
        fileContents: contents,
        flatStructure: structure,
        repoName: repoName
      };
      
      console.log('Analysis complete:', result);
      
      // Call completion handler
      if (onProgress) onProgress({ status: 'Analysis complete!', percentage: 100 });
      if (onComplete) onComplete(result);
    } catch (error) {
      console.error('Error processing files:', error);
      alert(`Error processing files: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, onStart, onComplete, onProgress]);

  return {
    processFiles,
    isProcessing
  };
};

// Helper to check if a file is binary (simple heuristic)
const isBinaryFile = (file) => {
  const binaryTypes = [
    'application/octet-stream',
    'application/zip',
    'application/x-zip-compressed',
    'application/pdf',
    'application/x-msdownload',
    'application/x-executable',
    'image/',
    'audio/',
    'video/'
  ];
  
  return file.type && binaryTypes.some(type => file.type.includes(type));
};

export default useFileSystem;