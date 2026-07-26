import React from 'react';

interface Author {
  name: string;
}

interface PaperResult {
  provider: string;
  title: string;
  abstract: string;
  doi: string;
  authors: Author[];
  publicationYear: number;
  journal: string;
  publisher: string;
  citationCount: number;
  fullTextAvailable: boolean;
  pdfUrl?: string;
  landingPage: string;
}

interface ResultCardProps {
  paper: PaperResult;
}

export const ResultCard: React.FC<ResultCardProps> = ({ paper }) => {
  const providerColors: Record<string, string> = {
    Crossref: 'bg-blue-100 text-blue-800',
    OpenAlex: 'bg-green-100 text-green-800',
    Unpaywall: 'bg-purple-100 text-purple-800',
    SemanticScholar: 'bg-indigo-100 text-indigo-800',
    CORE: 'bg-orange-100 text-orange-800',
  };

  return (
    <div className="result-card bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Provider Badge */}
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${providerColors[paper.provider] || 'bg-gray-100 text-gray-800'}`}>
            {paper.provider}
          </span>
          
          {/* Title */}
          <h4 className="text-md font-medium mt-2 text-blue-700 hover:underline">
            <a href={paper.landingPage} target="_blank" rel="noopener noreferrer">
              {paper.title}
            </a>
          </h4>
          
          {/* Authors & Year */}
          <div className="text-sm text-gray-600 mt-1">
            {paper.authors.slice(0, 3).map(a => a.name).join(', ')}
            {paper.authors.length > 3 && ` et al.`}
            {paper.publicationYear && ` (${paper.publicationYear})`}
          </div>
          
          {/* Journal & Publisher */}
          <div className="text-sm text-gray-500">
            {paper.journal && `${paper.journal}`}
            {paper.journal && paper.publisher && ' • '}
            {paper.publisher}
          </div>
        </div>
        
        {/* Citation & PDF Badges */}
        <div className="flex flex-col items-end space-y-1 ml-4">
          {paper.citationCount > 0 && (
            <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
              📊 {paper.citationCount} citations
            </span>
          )}
          {paper.fullTextAvailable && (
            <a
              href={paper.pdfUrl || paper.landingPage}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full hover:bg-green-200"
            >
              📄 PDF Available
            </a>
          )}
        </div>
      </div>
      
      {/* DOI */}
      {paper.doi && (
        <div className="text-xs text-gray-400 mt-2">
          DOI: <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            {paper.doi}
          </a>
        </div>
      )}
      
      {/* Abstract (optional) */}
      {paper.abstract && (
        <div className="text-sm text-gray-600 mt-2 line-clamp-2">
          {paper.abstract.replace(/<[^>]*>/g, '').substring(0, 200)}...
        </div>
      )}
    </div>
  );
};
