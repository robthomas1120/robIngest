// utils/tokenizers.js

// This file contains different tokenizer implementations
// You can add more tokenizers as needed for different models

/**
 * Basic token counter using regex word boundaries
 * This is a simple approximation, not as accurate as model-specific tokenizers
 */
const basicTokenCount = (text) => {
  if (!text) return 0;
  // Simple word boundary tokenization
  return text.split(/\b/).filter(Boolean).length;
};

/**
 * Approximate GPT tokenizer
 * More accurate than basic, but still an approximation
 */
const approximateGPTTokens = (text) => {
  if (!text) return 0;
  
  // Character-level approximation (closer to GPT tokenization)
  // Average English text has ~4 characters per token in GPT models
  const charCount = text.length;
  return Math.ceil(charCount / 4);
};

/**
 * Main token counting function
 * We'll use this as our primary interface for counting tokens
 * 
 * @param {string} text - The text to count tokens for
 * @param {string} model - Optional model name to use specific tokenizer
 * @returns {number} - The token count
 */
export const countTokens = (text, model = 'gpt-3.5-turbo') => {
  if (!text) return 0;
  
  // In a production app, you'd import and use the actual tokenizers
  // For example, tiktoken for OpenAI models
  
  // For now, we'll use our approximations
  if (model.startsWith('gpt')) {
    return approximateGPTTokens(text);
  }
  
  // Default to basic tokenization
  return basicTokenCount(text);
};

/**
 * You could add imports for more accurate tokenizers:
 * 
 * import { encoding_for_model } from 'tiktoken';
 * 
 * export const countTokensWithTiktoken = (text, model = 'gpt-3.5-turbo') => {
 *   const enc = encoding_for_model(model);
 *   const tokens = enc.encode(text);
 *   enc.free();
 *   return tokens.length;
 * };
 */

// Helper functions for different file types
export const getFileTokens = (fileContent, fileType, model) => {
  // You could add specific handling for different file types
  // For example, ignore comments in code files
  
  switch (fileType) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      // For code files, you might want to strip comments first
      return countTokens(fileContent, model);
      
    default:
      return countTokens(fileContent, model);
  }
};