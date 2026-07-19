/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { AnalysisState, CommitteeData } from '../types';

export const exportToPDF = async (analysis: AnalysisState, committee: CommitteeData): Promise<Blob> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const docHash = analysis.normalizedDoc?.documentHash || 'N/A';
  const processedAt = analysis.normalizedDoc?.processedAt || new Date().toLocaleDateString('en-NG');

  // Helper to draw border
  const drawBorder = () => {
    // Outer DSPG Blue border
    doc.setDrawColor(26, 42, 108); // #1a2a6c
    doc.setLineWidth(1.2);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // Inner Gold border
    doc.setDrawColor(201, 168, 76); // #c9a84c
    doc.setLineWidth(0.5);
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24);
  };

  // Helper to draw DSPG crest/seal procedurally
  const drawCrest = (centerX: number, centerY: number) => {
    // Outer Blue Ring
    doc.setDrawColor(26, 42, 108);
    doc.setLineWidth(1);
    doc.setFillColor(255, 255, 255);
    doc.circle(centerX, centerY, 15, 'FD');

    // Inner Gold Ring
    doc.setDrawColor(201, 168, 76);
    doc.setLineWidth(0.6);
    doc.circle(centerX, centerY, 13, 'D');

    // Inner blue shield
    doc.setFillColor(26, 42, 108);
    doc.setDrawColor(26, 42, 108);
    // Draw simple shield
    doc.triangle(
      centerX - 6, centerY - 6,
      centerX + 6, centerY - 6,
      centerX, centerY + 8,
      'F'
    );
    
    // Draw Torch flame (Gold/Red)
    doc.setFillColor(201, 168, 76);
    doc.circle(centerX, centerY - 2, 2, 'F');
    doc.setFillColor(239, 68, 68);
    doc.triangle(
      centerX - 1.5, centerY - 3,
      centerX + 1.5, centerY - 3,
      centerX, centerY - 6,
      'F'
    );

    // Add crest text
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(5);
    doc.setTextColor(26, 42, 108);
    doc.text('DSPG', centerX, centerY + 11, { align: 'center' });
  };

  // Helper to draw page footer
  const drawPageFooter = () => {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(15, pageHeight - 16, pageWidth - 15, pageHeight - 16);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('Delta State Polytechnic Ogwashi-Uku - School of Engineering', 15, pageHeight - 11);
    doc.text(`Document Hash: ${docHash.substring(0, 16)}...`, pageWidth - 15, pageHeight - 11, { align: 'right' });
    doc.text('Deterministic Document Normalization Certificate v2.0', pageWidth / 2, pageHeight - 11, { align: 'center' });
  };

  // ---------------- PAGE 1: CERTIFICATE ----------------
  drawBorder();
  
  // Header Section
  drawCrest(pageWidth / 2, 35);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(26, 42, 108); // DSPG Blue
  doc.text('DELTA STATE POLYTECHNIC OGWASHI-UKU', pageWidth / 2, 60, { align: 'center' });

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(71, 85, 105);
  doc.text('SCHOOL OF ENGINEERING', pageWidth / 2, 67, { align: 'center' });

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(201, 168, 76); // Gold Accent
  doc.text('DOCUMENT NORMALIZATION CERTIFICATE', pageWidth / 2, 74, { align: 'center' });

  // Project Metadata Section
  let currentY = 90;
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(26, 42, 108);
  doc.text('PROJECT METADATA', 20, currentY);
  
  currentY += 8;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(250, 250, 250);
  doc.rect(20, currentY, pageWidth - 40, 55, 'FD');

  const printMeta = (label: string, value: string, yPos: number) => {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(label, 25, yPos);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    
    const splitText = doc.splitTextToSize(value || 'N/A', pageWidth - 80);
    doc.text(splitText, 70, yPos);
    return splitText.length * 4.5;
  };

  let metaY = currentY + 6;
  metaY += printMeta('Project Title:', committee.projectMetadata?.projectTitle, metaY);
  metaY += 2;
  metaY += printMeta('Department:', committee.projectMetadata?.department, metaY);
  metaY += 2;
  metaY += printMeta('Academic Session:', committee.projectMetadata?.academicSession, metaY);
  metaY += 2;
  metaY += printMeta('Supervisor:', committee.projectMetadata?.supervisor?.name, metaY);
  
  const students = committee.projectMetadata?.students || [];
  metaY += 2;
  if (students.length > 0) {
    const studentList = students.map(s => `${s.fullName} (${s.matricNumber})`).join(', ');
    const splitStudents = doc.splitTextToSize(studentList, pageWidth - 80);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text('Students:', 25, metaY);

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(splitStudents, 70, metaY);
  }

  // Document Extraction Metrics Section
  currentY = 155;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(26, 42, 108);
  doc.text('EXTRACTION METRICS', 20, currentY);

  currentY += 8;
  doc.rect(20, currentY, pageWidth - 40, 35, 'FD');

  const printMetric = (label: string, value: string, xPos: number, yPos: number) => {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(label, xPos, yPos);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(value, xPos + 35, yPos);
  };

  let metricY = currentY + 7;
  printMetric('Word Count:', String(analysis.normalizedDoc?.wordCount || 0), 25, metricY);
  printMetric('Language:', analysis.normalizedDoc?.language || 'Unknown', 115, metricY);
  
  metricY += 8;
  printMetric('Character Count:', String(analysis.normalizedDoc?.characterCount || 0), 25, metricY);
  printMetric('Processing Duration:', analysis.normalizedDoc?.analysisDuration || '0.0s', 115, metricY);
  
  metricY += 8;
  printMetric('Sentence Count:', String(analysis.normalizedDoc?.sentenceCount || 0), 25, metricY);
  
  metricY += 8;
  printMetric('Paragraph Count:', String(analysis.normalizedDoc?.paragraphCount || 0), 25, metricY);

  // Document Integrity Section
  currentY = 200;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(26, 42, 108);
  doc.text('CRYPTOGRAPHIC INTEGRITY', 20, currentY);

  currentY += 8;
  doc.rect(20, currentY, pageWidth - 40, 20, 'FD');
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('SHA-256 DOCUMENT HASH:', 25, currentY + 7);
  
  doc.setFont('Courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(docHash, 25, currentY + 14);

  // Certification Section (Bottom)
  currentY = 235;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(26, 42, 108);
  doc.text('COMMITTEE CERTIFICATION', 20, currentY);

  currentY += 6;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Approved on: ${committee.approvalDate || processedAt}`, 20, currentY);
  
  // Signatures
  currentY += 15;
  
  // Chairman
  if (committee.chairmanSignature) {
    try {
      doc.addImage(committee.chairmanSignature, 'PNG', 20, currentY - 10, 40, 15);
    } catch (e) {
      console.error('Failed to embed Chairman signature:', e);
    }
  }
  doc.setDrawColor(26, 42, 108);
  doc.line(20, currentY + 5, 80, currentY + 5);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(committee.chairmanName || 'Committee Chairman', 20, currentY + 10);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Chairman, HND Projects Committee', 20, currentY + 14);

  // Secretary
  if (committee.secretarySignature) {
    try {
      doc.addImage(committee.secretarySignature, 'PNG', 110, currentY - 10, 40, 15);
    } catch (e) {
      console.error('Failed to embed Secretary signature:', e);
    }
  }
  doc.line(110, currentY + 5, 170, currentY + 5);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(committee.secretaryName || 'Committee Secretary', 110, currentY + 10);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Secretary, HND Projects Committee', 110, currentY + 14);

  // Official Stamp (Top Right)
  const stampX = 165;
  const stampY = 45;
  doc.setDrawColor(26, 42, 108);
  doc.setLineWidth(1);
  doc.setFillColor(255, 255, 255);
  doc.circle(stampX, stampY, 18, 'FD');
  
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.5);
  doc.circle(stampX, stampY, 15, 'D');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(3.8);
  doc.setTextColor(26, 42, 108);
  doc.text('SCHOOL OF ENGINEERING', stampX, stampY - 8, { align: 'center' });
  doc.text('HND PROJECTS COMMITTEE', stampX, stampY - 5, { align: 'center' });
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(4.5);
  doc.setTextColor(201, 168, 76);
  doc.text('OFFICIAL STAMP', stampX, stampY, { align: 'center' });

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(3.5);
  doc.setTextColor(26, 42, 108);
  doc.text('DELTA STATE POLYTECHNIC', stampX, stampY + 6, { align: 'center' });
  doc.text('OGWASHI-UKU, NIGERIA', stampX, stampY + 9, { align: 'center' });

  drawPageFooter();

  return doc.output('blob');
};
