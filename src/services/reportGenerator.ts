/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { exportToPDF } from './pdfService';
import { AnalysisState, CommitteeData } from '../types';

export const generateReport = async (
  analysis: AnalysisState,
  committee: CommitteeData
): Promise<string> => {
  try {
    const blob = await exportToPDF(analysis, committee);
    const blobUrl = URL.createObjectURL(blob);
    return blobUrl;
  } catch (error) {
    console.error('Failed to generate PDF report blob:', error);
    throw new Error('Could not compile PDF report. Please verify all fields are correct.');
  }
};
