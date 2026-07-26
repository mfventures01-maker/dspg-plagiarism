import { ProjectMetadata, AnalysisResult } from '../types';

export const checkPlagiarism = async (text: string, file?: File | null, metadata?: ProjectMetadata): Promise<AnalysisResult> => {
  try {
    const formData = new FormData();
    formData.append('text', text);

    if (file) {
      formData.append('file', file);
    }

    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Extract message from structured error schema: { success: false, error: { code, message } }
      const message =
        errorData?.error?.message ||
        (typeof errorData?.error === 'string' ? errorData.error : null) ||
        'Server returned an error during analysis';
      throw new Error(message);
    }

    const data = await response.json();
    // Server now returns { success: true, data: { document: NormalizedDocument, aiAnalysis: AIResponse } }
    return data.data as AnalysisResult;
  } catch (error: any) {
    console.error('Error in checkPlagiarism service:', error);
    throw new Error(error.message || 'Failed to connect to plagiarism analysis service. Please try again.');
  }
};

