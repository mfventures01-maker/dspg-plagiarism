/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { checkPlagiarism } from '../services/aiService';
import { generateReport } from '../services/reportGenerator';
import { AnalysisState, CommitteeData, ProjectMetadata } from '../types';

export const usePlagiarismCheck = () => {
  const [state, setState] = useState<AnalysisState>({
    status: 'idle',
    text: '',
    fileName: null,
    normalizedDoc: null,
    reportGenerated: false,
    reportUrl: null
  });

  const runCheck = useCallback(async (text: string, file?: File | null, metadata?: ProjectMetadata) => {
    setState(prev => ({
      ...prev,
      status: 'scanning',
      text,
      fileName: file ? file.name : null,
      error: undefined,
      normalizedDoc: null,
      reportGenerated: false,
      reportUrl: null
    }));

    try {
      if (file) {
        window.dispatchEvent(new CustomEvent('DSPG_TELEMETRY', { detail: { event: 'UPLOAD_STARTED' } }));
      }
      window.dispatchEvent(new CustomEvent('DSPG_TELEMETRY', { detail: { event: 'AI_REQUEST_SENT' } }));
      
      const normalizedDoc = await checkPlagiarism(text, file, metadata);
      
      if (file) {
        window.dispatchEvent(new CustomEvent('DSPG_TELEMETRY', { detail: { event: 'UPLOAD_COMPLETE' } }));
      }
      window.dispatchEvent(new CustomEvent('DSPG_TELEMETRY', { detail: { event: 'AI_RESPONSE_RECEIVED' } }));

      setState(prev => ({
        ...prev,
        status: 'complete',
        normalizedDoc
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
      if (!prev.normalizedDoc) return prev;
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
      window.dispatchEvent(new CustomEvent('DSPG_TELEMETRY', { detail: { event: 'REPORT_RENDERED' } }));
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
      normalizedDoc: null,
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
