/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { checkPlagiarism } from '../services/geminiService';
import { generateReport } from '../services/reportGenerator';
import { AnalysisState, CommitteeData } from '../types';

export const usePlagiarismCheck = () => {
  const [state, setState] = useState<AnalysisState>({
    status: 'idle',
    text: '',
    fileName: null,
    result: null,
    reportGenerated: false,
    reportUrl: null
  });

  const runCheck = useCallback(async (text: string, file?: File | null) => {
    setState(prev => ({
      ...prev,
      status: 'scanning',
      text,
      fileName: file ? file.name : null,
      error: undefined,
      result: null,
      reportGenerated: false,
      reportUrl: null
    }));

    try {
      const result = await checkPlagiarism(text, file);
      
      setState(prev => ({
        ...prev,
        status: 'complete',
        result
      }));
    } catch (error: any) {
      console.error('Plagiarism check hook failure:', error);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error.message || 'An error occurred during scanning. Please verify your connection.'
      }));
    }
  }, []);

  const compilePDFReport = useCallback(async (committeeData: CommitteeData) => {
    setState(prev => {
      if (!prev.result) return prev;
      return { ...prev, reportGenerated: false };
    });

    try {
      // Create PDF using PDF service via reportGenerator
      const reportUrl = await generateReport(state, committeeData);
      
      setState(prev => ({
        ...prev,
        reportGenerated: true,
        reportUrl
      }));
      return reportUrl;
    } catch (error: any) {
      console.error('Failed to compile PDF report:', error);
      throw error;
    }
  }, [state]);

  const resetState = useCallback(() => {
    setState({
      status: 'idle',
      text: '',
      fileName: null,
      result: null,
      reportGenerated: false,
      reportUrl: null
    });
  }, []);

  return {
    state,
    runCheck,
    compilePDFReport,
    resetState
  };
};
