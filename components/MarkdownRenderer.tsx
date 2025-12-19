
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Simple regex-based markdown-lite renderer for typical AI output features
  // In a production app, we would use react-markdown, but we'll stick to a clean implementation
  const formattedContent = content
    .replace(/### (.*?)(\n|$)/g, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
    .replace(/## (.*?)(\n|$)/g, '<h2 class="text-xl font-bold mt-5 mb-3">$1</h2>')
    .replace(/# (.*?)(\n|$)/g, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-slate-800 px-1 rounded text-pink-400">$1</code>')
    .replace(/```(.*?)\n([\s\S]*?)```/g, '<pre class="bg-slate-900 p-3 rounded-lg my-3 overflow-x-auto border border-slate-700"><code class="text-sm text-cyan-300">$2</code></pre>')
    .replace(/\n/g, '<br />');

  return (
    <div 
      className="prose prose-invert max-w-none text-slate-200 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: formattedContent }} 
    />
  );
};

export default MarkdownRenderer;
