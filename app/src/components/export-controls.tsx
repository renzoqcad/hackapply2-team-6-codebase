'use client';

import { useState } from 'react';
import { Copy, Download, Check, FileJson, FileText } from 'lucide-react';
import { Button } from './ui/button';
import type { ProcessingOutput } from '@/types';
import { formatAsJiraMarkdown } from '@/lib/format-markdown';

interface ExportControlsProps {
  results: ProcessingOutput;
}

export function ExportControls({ results }: ExportControlsProps) {
  const [copied, setCopied] = useState<'json' | 'markdown' | null>(null);
  const [activeFormat, setActiveFormat] = useState<'markdown' | 'json'>('markdown');

  const markdownContent = formatAsJiraMarkdown(results);
  const jsonContent = JSON.stringify(results, null, 2);

  const handleCopy = async (format: 'json' | 'markdown') => {
    try {
      const content = format === 'json' ? jsonContent : markdownContent;
      await navigator.clipboard.writeText(content);
      setCopied(format);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = (format: 'json' | 'markdown') => {
    const content = format === 'json' ? jsonContent : markdownContent;
    const mimeType = format === 'json' ? 'application/json' : 'text/markdown';
    const extension = format === 'json' ? 'json' : 'md';
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${results.metadata.boardName.replace(/\s+/g, '-').toLowerCase()}-stories.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Format Toggle */}
      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg w-fit">
        <button
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeFormat === 'markdown'
              ? 'bg-white shadow text-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveFormat('markdown')}
        >
          <FileText className="w-4 h-4" />
          Jira Markdown
        </button>
        <button
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeFormat === 'json'
              ? 'bg-white shadow text-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveFormat('json')}
        >
          <FileJson className="w-4 h-4" />
          JSON
        </button>
      </div>

      {/* Export Actions */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex-1">
          <p className="font-medium text-gray-900">
            Export as {activeFormat === 'markdown' ? 'Jira Markdown' : 'JSON'}
          </p>
          <p className="text-sm text-gray-500">
            {activeFormat === 'markdown' 
              ? 'Copy formatted user stories for Jira/Confluence'
              : 'Copy structured JSON for API import'
            }
          </p>
        </div>
        <Button variant="outline" onClick={() => handleCopy(activeFormat)}>
          {copied === activeFormat ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </>
          )}
        </Button>
        <Button onClick={() => handleDownload(activeFormat)}>
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>

      {/* Preview */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-700">Preview</p>
        </div>
        <div className="p-4 bg-white max-h-64 overflow-y-auto">
          <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
            {activeFormat === 'markdown' 
              ? markdownContent.slice(0, 1500) + (markdownContent.length > 1500 ? '\n\n... (truncated)' : '')
              : jsonContent.slice(0, 1500) + (jsonContent.length > 1500 ? '\n\n... (truncated)' : '')
            }
          </pre>
        </div>
      </div>
    </div>
  );
}
