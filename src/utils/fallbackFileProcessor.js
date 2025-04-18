// utils/fallbackFileProcessor.js
import { countTokens } from './tokenizers';

/**
 * A simplified version of file processing that works with standard File objects
 * This is a fallback when the more advanced File System Access API is not available
 */
export const processFlatFiles = async (files) => {
  console.log('Using fallback processor for files:', files);
  
  const structure = [];
  const contents = {};
  let totalTokenCount = 0;
  let totalFiles = 0;
  let totalDirectories = 0;
  
  // Map to track directories for building the tree structure
  const dirMap = new Map();
  
  // Get repository name (assumes all files share a common root)
  let repoName = '';
  if (files.length > 0) {
    const firstFilePath = files[0].webkitRelativePath || '';
    if (firstFilePath) {
      const parts = firstFilePath.split('/');
      if (parts.length > 0) {
        repoName = parts[0];
      }
    }
  }
  
  if (!repoName) {
    repoName = 'repository';
  }
  
  // Process each file individually
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log(`Processing file ${i+1}/${files.length}: ${file.name}, path: ${file.webkitRelativePath}`);
    
    try {
      // Extract directory structure from webkitRelativePath
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
      
      // Skip binary files (optional)
      if (isBinaryFile(file) || file.size > 10 * 1024 * 1024) {
        console.log(`Skipping binary or large file: ${fileName}`);
        structure.push({
          name: fileName,
          path: filePath,
          type: 'file',
          size: file.size,
          tokens: 0,
          binary: isBinaryFile(file),
          parent: currentPath
        });
        continue;
      }
      
      // Read the file content
      const text = await file.text();
      console.log(`Read content for ${fileName}, length: ${text.length}`);
      
      // Count tokens
      const tokens = countTokens(text);
      console.log(`Counted ${tokens} tokens for ${fileName}`);
      
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
  
  // Build the result object
  const result = {
    totalTokens: totalTokenCount,
    totalFiles: totalFiles,
    totalDirectories: totalDirectories,
    directoryStructure: tree,
    fileContents: contents,
    flatStructure: structure,
    repoName: repoName
  };
  
  console.log('Fallback processing result:', result);
  return result;
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
  
  return binaryTypes.some(type => file.type.includes(type));
};