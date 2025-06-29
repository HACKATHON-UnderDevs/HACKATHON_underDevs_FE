// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractTextFromInlines = (inlines: any[]): string => {
    if (!inlines) return '';
    return inlines
      .map((inline) => {
        if (inline.type === 'text') {
          return inline.text;
        }
        if (inline.type === 'link' && inline.content) {
          return extractTextFromInlines(inline.content);
        }
        return '';
      })
      .join('');
  };
  
// Recursively extracts text from an array of BlockNote blocks
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractTextFromBlocks = (blocks: any[]): string[] => {
  if (!Array.isArray(blocks)) {
    return [];
  }

  return blocks.flatMap(block => {
    // Extract text from the block's direct content
    const contentText = Array.isArray(block.content) ? [extractTextFromInlines(block.content)] : [];
    
    // Recursively extract text from the block's children
    const childrenText = Array.isArray(block.children) ? extractTextFromBlocks(block.children) : [];

    return [...contentText, ...childrenText];
  });
};

// Helper to get a plain text snippet from the BlockNote JSON content
export const getContentSnippet = (content: string | undefined): string => {
    if (!content) return 'No content available.';
    try {
      const blocks = JSON.parse(content);
      
      // Extract text from all blocks and their children recursively
      const textSnippets = extractTextFromBlocks(blocks);
      const fullText = textSnippets.filter(s => s).join(' ').trim();
  
      if (!fullText) return 'No text content.';
  
      return fullText.length > 100 ? `${fullText.slice(0, 100)}...` : fullText;
    } catch {
      // Handles both parsing errors and cases where content is not valid JSON
      // This is a fallback for non-JSON content
      if (typeof content === 'string') {
        return content.length > 100 ? `${content.slice(0, 100)}...` : content;
      }
      return 'Could not display content.';
    }
}; 