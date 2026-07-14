import { AnalysisResult } from '../types';

export const checkPlagiarism = async (text: string, file?: File | null): Promise<AnalysisResult> => {
  try {
    const formData = new FormData();
    formData.append('text', text);
    
    if (file) {
      formData.append('file', file);
    }

    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Server returned an error during analysis');
    }

    const data = await response.json();
    return data.result as AnalysisResult;
  } catch (error: any) {
    console.error('Error in checkPlagiarism service:', error);
    throw new Error(error.message || 'Failed to connect to plagiarism analysis service. Please try again.');
  }
};
