/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';

export const useFileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleSelectFile = useCallback((selectedFile: File) => {
    setError(null);
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setFileSize(selectedFile.size);
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setFileName(null);
    setFileSize(0);
    setError(null);
  }, []);

  return {
    file,
    fileName,
    fileSize,
    error,
    setError,
    handleSelectFile,
    clearFile
  };
};
