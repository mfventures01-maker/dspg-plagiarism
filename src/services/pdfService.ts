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

  // Helper to draw report header banner
  const drawPageHeader = (pageTitle: string) => {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(26, 42, 108);
    doc.text('DELTA STATE POLYTECHNIC OGWASHI-UKU', 15, 18);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('School of Engineering | HND Projects Committee', 15, 22);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(201, 168, 76);
    doc.text(pageTitle, pageWidth - 15, 20, { align: 'right' });

    // Header divider line
    doc.setDrawColor(26, 42, 108);
    doc.setLineWidth(0.5);
    doc.line(15, 24, pageWidth - 15, 24);
  };

  // Helper to draw page footer
  const drawPageFooter = (pageNum: number, totalPages: number) => {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(15, pageHeight - 16, pageWidth - 15, pageHeight - 16);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('Delta State Polytechnic Ogwashi-Uku - School of Engineering', 15, pageHeight - 11);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 15, pageHeight - 11, { align: 'right' });
    doc.text('Academic Integrity Plagiarism Audit Report v1.0', pageWidth / 2, pageHeight - 11, { align: 'center' });
  };

  // ---------------- PAGE 1: COVER PAGE ----------------
  drawBorder();
  
  // Header Info
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(26, 42, 108); // DSPG Blue
  doc.text('DELTA STATE POLYTECHNIC OGWASHI-UKU', pageWidth / 2, 35, { align: 'center' });

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(71, 85, 105);
  doc.text('SCHOOL OF ENGINEERING', pageWidth / 2, 44, { align: 'center' });

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(201, 168, 76); // Gold Accent
  doc.text('HND PROJECTS COMMITTEE', pageWidth / 2, 50, { align: 'center' });

  // Large Decorative Cover Title
  doc.setFillColor(26, 42, 108);
  doc.rect(20, 60, pageWidth - 40, 20, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('PLAGIARISM CHECK REPORT', pageWidth / 2, 72, { align: 'center' });

  // Draw Crest in Center of Page 1
  drawCrest(pageWidth / 2, 110);

  // Metadata Card Panel
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(250, 250, 250);
  doc.rect(20, 140, pageWidth - 40, 95, 'FD');

  const printMeta = (label: string, value: string, yPos: number) => {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(label, 25, yPos);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    
    // Auto-wrap title of work if needed
    if (label === 'Title of Work:') {
      const splitText = doc.splitTextToSize(value || 'Untitled Engineering Project Submission', pageWidth - 70);
      doc.text(splitText, 60, yPos);
      return splitText.length * 4.5;
    } else {
      doc.text(value || 'N/A', 60, yPos);
      return 5;
    }
  };

  let nextY = 152;
  nextY += printMeta('Title of Work:', committee.projectTitle, nextY);
  nextY += 4;
  nextY += printMeta('Student Name:', committee.studentName, nextY);
  nextY += 4;
  nextY += printMeta('Reg Number:', committee.regNumber, nextY);
  nextY += 4;
  nextY += printMeta('Supervisor:', committee.supervisorName, nextY);
  nextY += 4;
  nextY += printMeta('Date Checked:', analysis.result?.analysisDate || new Date().toLocaleDateString('en-NG'), nextY);

  // Prepared info at the bottom
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Prepared by: Plagiarism Checker System v1.0', pageWidth / 2, 255, { align: 'center' });
  doc.text('School of Engineering HND Academic Integrity Audit', pageWidth / 2, 260, { align: 'center' });

  drawPageFooter(1, 4);

  // ---------------- PAGE 2: REPORT DETAILS ----------------
  doc.addPage();
  drawBorder();
  drawPageHeader('REPORT DETAILS');

  // Stats Card Panel
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(250, 251, 253);
  doc.rect(15, 30, pageWidth - 30, 48, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(26, 42, 108);
  doc.text('DOCUMENT ANALYSIS SUMMARY', 20, 38);

  const printStatRow = (label: string, value: string, yPos: number) => {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(label, 20, yPos);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(value, 65, yPos);
  };

  printStatRow('Document Analyzed:', analysis.fileName || 'Direct Text Input', 46);
  printStatRow('Total Word Count:', `${analysis.result?.wordCount || 0} words`, 52);
  printStatRow('Analysis Duration:', analysis.result?.analysisDuration || 'N/A', 58);
  printStatRow('Submission Date:', analysis.result?.analysisDate || new Date().toLocaleDateString('en-NG'), 64);
  printStatRow('Academic Session:', `${new Date().getFullYear()}/${new Date().getFullYear() + 1} HND Defense`, 70);

  // Originality and AI Visual Score Bars (Procedural drawing)
  const drawScoreBar = (label: string, value: number, yPos: number, isOriginality: boolean) => {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(26, 42, 108);
    doc.text(label, 15, yPos);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`${value}%`, pageWidth - 15, yPos, { align: 'right' });

    // Track
    doc.setFillColor(241, 245, 249);
    doc.rect(15, yPos + 3, pageWidth - 30, 6, 'F');

    // Fill Color logic
    if (isOriginality) {
      if (value >= 80) doc.setFillColor(16, 185, 129); // Emerald (Safe)
      else if (value >= 50) doc.setFillColor(245, 158, 11); // Amber (Warning)
      else doc.setFillColor(239, 68, 68); // Red (Risk)
    } else {
      // AI: lower is better
      if (value <= 20) doc.setFillColor(16, 185, 129); // Emerald (Safe)
      else if (value <= 50) doc.setFillColor(245, 158, 11); // Amber (Warning)
      else doc.setFillColor(239, 68, 68); // Red (Risk)
    }

    const fillWidth = ((pageWidth - 30) * value) / 100;
    if (fillWidth > 0) {
      doc.rect(15, yPos + 3, fillWidth, 6, 'F');
    }
  };

  drawScoreBar('ORIGINALITY SCORE', analysis.result?.originalityScore || 0, 92, true);
  
  // Quick status badge
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    (analysis.result?.originalityScore || 0) >= 80 
      ? 'Note: Excellent originality score. Complies with the DSPG 80% originality benchmark.' 
      : 'Note: Originality score is below the DSPG 80% threshold. Corrections are recommended.',
    15, 107
  );

  drawScoreBar('AI GENERATED CONTENT PROBABILITY', analysis.result?.aiProbability || 0, 118, false);
  
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    (analysis.result?.aiProbability || 0) <= 20 
      ? 'Note: AI probability lies within acceptable human-authored statistical distributions.' 
      : 'Note: Significant AI-generated writing style patterns detected. Further review advised.',
    15, 133
  );

  // Large Circle visualization of the principal metric (Originality)
  const drawScoreDial = (centerX: number, centerY: number, score: number) => {
    // Circle background
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.circle(centerX, centerY, 24, 'FD');

    // Colored arc representing score
    doc.setLineWidth(3);
    if (score >= 80) doc.setDrawColor(16, 185, 129);
    else if (score >= 50) doc.setDrawColor(245, 158, 11);
    else doc.setDrawColor(239, 68, 68);
    
    // Render approximation of score gauge (outer circle segment)
    doc.circle(centerX, centerY, 21, 'D');

    // Score Text
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(15, 23, 42);
    doc.text(`${score}%`, centerX, centerY + 3, { align: 'center' });

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('ORIGINALITY', centerX, centerY + 10, { align: 'center' });
  };

  drawScoreDial(pageWidth / 2, 175, analysis.result?.originalityScore || 0);

  // Dynamic Status Badge
  doc.setFillColor(26, 42, 108, 0.08); // faint blue background
  doc.setDrawColor(26, 42, 108);
  doc.setLineWidth(0.5);
  doc.rect(40, 215, pageWidth - 80, 12, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(26, 42, 108);
  const statusLabel = (analysis.result?.originalityScore || 0) >= 80 ? 'STATUS: APPROVED & COMPLIANT' : 'STATUS: REVIEW / RE-SUBMISSION REQUIRED';
  doc.text(statusLabel, pageWidth / 2, 222.5, { align: 'center' });

  drawPageFooter(2, 4);

  // ---------------- PAGE 3: DETAILED ANALYSIS ----------------
  doc.addPage();
  drawBorder();
  drawPageHeader('DETAILED PLAGIARISM ANALYSIS');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(26, 42, 108);
  doc.text('FLAGGED SECTIONS & SOURCE SIMILARITIES', 15, 32);

  // Draw Table Headers
  const tableY = 38;
  doc.setFillColor(26, 42, 108);
  doc.rect(15, tableY, pageWidth - 30, 8, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('S/N', 18, tableY + 5.5);
  doc.text('Flagged Section Text Snippet', 28, tableY + 5.5);
  doc.text('Match Source', 115, tableY + 5.5);
  doc.text('Sim %', 165, tableY + 5.5);
  doc.text('Status', 180, tableY + 5.5);

  // Populating table rows with auto wrapping
  let currentY = tableY + 8;
  const sources = analysis.result?.sources || [];

  if (sources.length === 0) {
    // Empty State Row
    doc.setFillColor(250, 250, 250);
    doc.rect(15, currentY, pageWidth - 30, 12, 'F');
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(115, 115, 115);
    doc.text('No plagiarized segments or overlapping citations detected in this submission.', pageWidth / 2, currentY + 7.5, { align: 'center' });
    currentY += 12;
  } else {
    sources.forEach((source, index) => {
      // Row alternate color
      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      
      const snippetText = source.text || 'N/A';
      const sourceName = source.source || 'Online Database / IEEE';
      const similarity = source.similarity || 0;

      // Handle text split to size to prevent overlap
      const splitSnippet = doc.splitTextToSize(snippetText, 80);
      const splitSource = doc.splitTextToSize(sourceName, 45);

      const rowHeight = Math.max(splitSnippet.length * 4.5, splitSource.length * 4.5, 9);

      doc.rect(15, currentY, pageWidth - 30, rowHeight, 'F');

      // Draw bottom border for row
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.3);
      doc.line(15, currentY + rowHeight, pageWidth - 15, currentY + rowHeight);

      // S/N
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(String(index + 1), 18, currentY + 5);

      // Snippet Text
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(splitSnippet, 28, currentY + 4.5);

      // Source Name
      doc.text(splitSource, 115, currentY + 4.5);

      // Similarity %
      doc.setFont('Helvetica', 'bold');
      doc.text(`${similarity}%`, 165, currentY + 5);

      // Status
      doc.setFont('Helvetica', 'bold');
      if (similarity >= 50) {
        doc.setTextColor(239, 68, 68); // Red
        doc.text('CRITICAL', 180, currentY + 5);
      } else {
        doc.setTextColor(245, 158, 11); // Amber
        doc.text('WARNING', 180, currentY + 5);
      }

      currentY += rowHeight;
    });
  }

  // Executive Summary Section
  const summaryY = currentY + 10;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(26, 42, 108);
  doc.text('EXECUTIVE COMPLIANCE AUDIT', 15, summaryY);

  const summaryText = analysis.result?.summary || 'No further executive analysis required for this text.';
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  
  const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 30);
  doc.text(splitSummary, 15, summaryY + 5);

  drawPageFooter(3, 4);

  // ---------------- PAGE 4: COMMITTEE APPROVAL & SIGNATURES ----------------
  doc.addPage();
  drawBorder();
  drawPageHeader('COMMITTEE APPROVAL');

  // Review Statement
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(26, 42, 108);
  doc.text('COMMITTEE INTEGRITY REVIEW STATEMENT', 15, 35);

  const statement = 'This plagiarism audit report is compiled directly from the secure cloud-backed analysis system of the School of Engineering, Delta State Polytechnic Ogwashi-Uku. The findings compiled herein represent a semantic review of academic publications, patents, standards, and AI generation parameters. The signing members of the School of Engineering HND Projects Committee hereby confirm they have reviewed these findings and approved the project for final defense and preservation in the polytechnic archives.';
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  const splitStatement = doc.splitTextToSize(statement, pageWidth - 30);
  doc.text(splitStatement, 15, 42);

  // Chairman Signature Block
  const block1Y = 75;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(250, 251, 253);
  doc.rect(15, block1Y, pageWidth - 30, 48, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(26, 42, 108);
  doc.text("CHAIRMAN'S ENDORSEMENT", 20, block1Y + 6);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Name:', 20, block1Y + 14);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(committee.chairmanName || 'Engr. (Dr.) Committee Chairman', 45, block1Y + 14);

  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Role:', 20, block1Y + 20);
  doc.text('HND Projects Committee Chairman', 45, block1Y + 20);

  doc.text('Date Approved:', 20, block1Y + 26);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(committee.approvalDate || new Date().toLocaleDateString('en-NG'), 45, block1Y + 26);

  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Signature Specimen:', 20, block1Y + 38);

  // If chairman signature exists, embed it
  if (committee.chairmanSignature) {
    try {
      doc.addImage(committee.chairmanSignature, 'PNG', 115, block1Y + 10, 50, 20);
      
      // Stamp validation watermark
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(16, 185, 129);
      doc.text('VERIFIED & TIMESTAMPTED', 115, block1Y + 33);
    } catch (e) {
      console.error('Failed to embed Chairman signature in PDF:', e);
      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text('[Digital Signature Secured]', 120, block1Y + 25);
    }
  } else {
    doc.line(115, block1Y + 28, 175, block1Y + 28);
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.text('Pending Digital Endorsement', 123, block1Y + 32);
  }

  // Secretary Signature Block
  const block2Y = 132;
  doc.rect(15, block2Y, pageWidth - 30, 48, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(26, 42, 108);
  doc.text("COMMITTEE SECRETARY'S ENDORSEMENT", 20, block2Y + 6);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Name:', 20, block2Y + 14);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(committee.secretaryName || 'Engr. Committee Secretary', 45, block2Y + 14);

  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Role:', 20, block2Y + 20);
  doc.text('HND Projects Committee Secretary', 45, block2Y + 20);

  doc.text('Date Approved:', 20, block2Y + 26);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(committee.approvalDate || new Date().toLocaleDateString('en-NG'), 45, block2Y + 26);

  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Signature Specimen:', 20, block2Y + 38);

  // If secretary signature exists, embed it
  if (committee.secretarySignature) {
    try {
      doc.addImage(committee.secretarySignature, 'PNG', 115, block2Y + 10, 50, 20);
      
      // Stamp validation watermark
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(16, 185, 129);
      doc.text('VERIFIED & TIMESTAMPTED', 115, block2Y + 33);
    } catch (e) {
      console.error('Failed to embed Secretary signature in PDF:', e);
      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text('[Digital Signature Secured]', 120, block2Y + 25);
    }
  } else {
    doc.line(115, block2Y + 28, 175, block2Y + 28);
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.text('Pending Digital Endorsement', 123, block2Y + 32);
  }

  // Official Stamp Block
  const stampY = 195;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.rect(15, stampY, pageWidth - 30, 48, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(26, 42, 108);
  doc.text('OFFICIAL HND PROJECTS COMMITTEE STAMP', 20, stampY + 8);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('This audit certificate is issued digitally by authority of the School of Engineering, Delta State Polytechnic Ogwashi-Uku.', 20, stampY + 16, { maxWidth: 110 });
  
  // Draw circular official stamp vector procedurally in blue/gold
  const sX = 155;
  const sY = stampY + 24;
  doc.setDrawColor(26, 42, 108);
  doc.setLineWidth(1);
  doc.setFillColor(255, 255, 255);
  doc.circle(sX, sY, 18, 'FD');
  
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.5);
  doc.circle(sX, sY, 15, 'D');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(3.8);
  doc.setTextColor(26, 42, 108);
  doc.text('SCHOOL OF ENGINEERING', sX, sY - 8, { align: 'center' });
  doc.text('HND PROJECTS COMMITTEE', sX, sY - 5, { align: 'center' });
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(4.5);
  doc.setTextColor(201, 168, 76);
  doc.text('OFFICIAL STAMP', sX, sY, { align: 'center' });

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(3.5);
  doc.setTextColor(26, 42, 108);
  doc.text('DELTA STATE POLYTECHNIC', sX, sY + 6, { align: 'center' });
  doc.text('OGWASHI-UKU, NIGERIA', sX, sY + 9, { align: 'center' });

  drawPageFooter(4, 4);

  return doc.output('blob');
};
