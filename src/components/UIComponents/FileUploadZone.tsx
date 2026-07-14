import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFileName: string | null;
  onClear: () => void;
  maxSizeMB?: number;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileSelect,
  selectedFileName,
  onClear,
  maxSizeMB = 10
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    setError(null);
    const allowedExtensions = ['txt', 'docx', 'pdf'];
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    if (!allowedExtensions.includes(extension)) {
      setError('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
      return false;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds the limit of ${maxSizeMB}MB.`);
      return false;
    }

    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      {!selectedFileName ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          aria-label="File upload dropzone"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') triggerFileInput();
          }}
          className={clsx(
            'border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 outline-none focus:ring-2 focus:ring-[#1a2a6c] focus:ring-offset-2',
            isDragActive
              ? 'border-[#1a2a6c] bg-slate-50 scale-[1.01]'
              : 'border-slate-300 hover:border-[#1a2a6c] hover:bg-slate-50/50'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.txt"
            onChange={handleFileInput}
          />
          <div className="p-3 bg-slate-100 rounded-full text-[#1a2a6c] mb-3">
            <UploadCloud className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700">
            Drag and drop your file here, or <span className="text-[#1a2a6c] hover:underline">browse</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Supported formats: PDF, DOCX, TXT (Max {maxSizeMB}MB)
          </p>
        </div>
      ) : (
        <div className="border border-slate-200 bg-slate-50/50 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1a2a6c]/10 text-[#1a2a6c] rounded-lg">
              <File className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800 line-clamp-1">
                {selectedFileName}
              </p>
              <p className="text-xs text-slate-500">
                Document loaded successfully
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            aria-label="Remove loaded file"
            className="p-1 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 mt-3 text-red-600 text-xs font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
