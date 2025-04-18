// utils/fileProcessing.js
import { countTokens } from './tokenizers';

// Main function to process entries from dataTransfer.items
export const processEntries = async (items) => {
  const structure = [];
  const contents = {};
  let totalTokenCount = 0;
  let totalFiles = 0;
  let totalDirectories = 0;
  
  // Process a single entry (file or directory)
  const processEntry = async (entry, path = '') => {
    if (entry.isFile) {
      try {
        const file = await new Promise((resolve) => entry.file(resolve));
        // Skip binary files and very large files (optional)
        if (isBinaryFile(file) || file.size > 10 * 1024 * 1024) {
          structure.push({
            name: entry.name,
            path: path ? `${path}/${entry.name}` : entry.name,
            type: 'file',
            size: file.size,
            tokens: 0,
            binary: isBinaryFile(file)
          });
          return;
        }
        
        const text = await file.text();
        const tokens = countTokens(text);
        
        totalTokenCount += tokens;
        totalFiles++;
        
        const fullPath = path ? `${path}/${entry.name}` : entry.name;
        
        structure.push({
          name: entry.name,
          path: fullPath,
          type: 'file',
          size: file.size,
          tokens: tokens
        });
        
        contents[fullPath] = text;
      } catch (error) {
        console.error(`Error processing file ${entry.name}:`, error);
      }
    } else if (entry.isDirectory) {
      try {
        totalDirectories++;
        
        const dirPath = path ? `${path}/${entry.name}` : entry.name;
        const dirEntry = {
          name: entry.name,
          path: dirPath,
          type: 'directory',
          children: []
        };
        
        structure.push(dirEntry);
        
        // Process all entries in the directory
        await processDirectoryEntries(entry, dirPath);
      } catch (error) {
        console.error(`Error processing directory ${entry.name}:`, error);
      }
    }
  };
  
  // Process all entries in a directory
  const processDirectoryEntries = async (dirEntry, dirPath) => {
    const reader = dirEntry.createReader();
    let entries = [];
    
    // Directory reading is done in batches, so we need to keep reading
    // until no more entries are returned
    let readEntries = await new Promise((resolve) => {
      reader.readEntries(resolve);
    });
    
    while (readEntries.length > 0) {
      entries = [...entries, ...readEntries];
      readEntries = await new Promise((resolve) => {
        reader.readEntries(resolve);
      });
    }
    
    // Process each entry in the directory
    for (const entry of entries) {
      await processEntry(entry, dirPath);
    }
  };
  
  // Start processing all items
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const entry = item.webkitGetAsEntry && item.webkitGetAsEntry();
    
    if (entry) {
      await processEntry(entry);
    }
  }
  
  // Build the tree structure
  const tree = buildTree(structure);
  
  return {
    totalTokens: totalTokenCount,
    totalFiles: totalFiles,
    totalDirectories: totalDirectories,
    directoryStructure: tree,
    fileContents: contents,
    flatStructure: structure
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
  
  return binaryTypes.some(type => file.type.includes(type));
};

// Convert flat structure to a tree structure
const buildTree = (flatStructure) => {
  const root = [];
  const map = {};
  
  // First pass: create all nodes
  flatStructure.forEach(item => {
    map[item.path] = { ...item, children: [] };
  });
  
  // Second pass: build the tree
  flatStructure.forEach(item => {
    const node = map[item.path];
    
    if (item.path.includes('/')) {
      // Get parent path
      const parentPath = item.path.substring(0, item.path.lastIndexOf('/'));
      
      if (map[parentPath]) {
        map[parentPath].children.push(node);
      }
    } else {
      // Root level item
      root.push(node);
    }
  });
  
  return root;
};