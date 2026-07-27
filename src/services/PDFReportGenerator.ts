// src/services/PDFReportGenerator.ts
// HOEOS: Phase 4 - PDF Export with QR Verification

import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export interface PDFReportData {
  reportId: string;
  studentName: string;
  matricNumber: string;
  projectTitle: string;
  submissionDate: string;
  similarityScore: number;
  adjustedScore: number;
  scoreBand: string;
  riskLevel: string;
  verdict: string;
  supervisorName: string;
  supervisorSignature: string;
  verificationHash: string;
  matchedSources: Array<{
    source: string;
    similarity: number;
    text: string;
  }>;
  documentHash: string;
  institution: string;
  department: string;
}

export interface QRVerificationData {
  reportId: string;
  documentHash: string;
  verificationHash: string;
  timestamp: string;
  status: 'VALID' | 'INVALID' | 'EXPIRED';
}

export class PDFReportGenerator {
  private static instance: PDFReportGenerator;
  private verificationCache: Map<string, QRVerificationData> = new Map();

  static getInstance(): PDFReportGenerator {
    if (!PDFReportGenerator.instance) {
      PDFReportGenerator.instance = new PDFReportGenerator();
    }
    return PDFReportGenerator.instance;
  }

  // 🔐 Generate verification hash
  private generateVerificationHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  // 📄 Generate QR code
  private async generateQR(data: string): Promise<string> {
    try {
      return await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 150,
        color: {
          dark: '#1a1a2e',
          light: '#ffffff'
        }
      });
    } catch (error) {
      console.error('QR Generation Error:', error);
      return '';
    }
  }

  // 📄 Generate PDF Report
  async generatePDF(data: PDFReportData): Promise<{ pdf: jsPDF; qrCode: string; verificationData: QRVerificationData }> {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // Header - DSPG Branding
    doc.setFillColor(0, 50, 30);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('DSPG ACADEMIC INTEGRITY SYSTEM', margin, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Delta State Polytechnic, Ogwashi-Uku', margin, 33);

    // Report Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PLAGIARISM VERIFICATION REPORT', margin, 55);

    // Report ID & Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report ID: ${data.reportId}`, margin, 65);
    doc.text(`Date: ${new Date(data.submissionDate).toLocaleDateString()}`, margin, 72);
    doc.text(`Time: ${new Date(data.submissionDate).toLocaleTimeString()}`, margin, 79);

    // Student Information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('STUDENT INFORMATION', margin, 95);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${data.studentName}`, margin, 105);
    doc.text(`Matric Number: ${data.matricNumber}`, margin, 112);
    doc.text(`Department: ${data.department}`, margin, 119);
    doc.text(`Level: HND 2`, margin, 126);
    doc.text(`Project Title: ${data.projectTitle}`, margin, 133);

    // Similarity Results
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SIMILARITY RESULTS', margin, 150);
    
    // Score box
    const scoreBoxY = 157;
    const scoreBoxHeight = 40;
    doc.setDrawColor(0, 100, 0);
    doc.setFillColor(240, 255, 240);
    doc.roundedRect(margin, scoreBoxY, pageWidth - 2 * margin, scoreBoxHeight, 3, 3, 'FD');

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 100, 0);
    doc.text(`Similarity Score: ${data.similarityScore}%`, margin + 5, scoreBoxY + 12);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Adjusted Score: ${data.adjustedScore}%`, margin + 5, scoreBoxY + 24);
    doc.text(`Score Band: ${data.scoreBand}`, margin + 5, scoreBoxY + 33);

    // Verdict
    const verdictY = scoreBoxY + scoreBoxHeight + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('VERDICT', margin, verdictY + 5);
    
    const verdictColor = data.riskLevel === 'LOW' ? [0, 150, 0] : 
                        data.riskLevel === 'MODERATE' ? [200, 150, 0] : 
                        data.riskLevel === 'HIGH' ? [200, 100, 0] : [200, 0, 0];
    doc.setTextColor(verdictColor[0], verdictColor[1], verdictColor[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Status: ${data.verdict}`, margin, verdictY + 18);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Risk Level: ${data.riskLevel}`, margin, verdictY + 28);

    // Matched Sources (if any)
    if (data.matchedSources && data.matchedSources.length > 0) {
      const sourceY = verdictY + 40;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('MATCHED SOURCES', margin, sourceY + 5);

      let yPos = sourceY + 15;
      for (const source of data.matchedSources.slice(0, 5)) {
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = 30;
        }
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`• ${source.source} (${source.similarity}%)`, margin, yPos);
        yPos += 6;
        if (source.text) {
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          const wrappedText = doc.splitTextToSize(`"${source.text.substring(0, 100)}..."`, pageWidth - 2 * margin - 10);
          doc.text(wrappedText, margin + 5, yPos);
          yPos += (wrappedText.length * 5) + 3;
        }
      }
    }

    // Supervisor Verification
    const supY = data.matchedSources && data.matchedSources.length > 0 ? 
                  Math.min(yPos + 15, pageHeight - 70) : 
                  pageHeight - 70;
    
    if (supY < pageHeight - 60) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('SUPERVISOR VERIFICATION', margin, supY + 5);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Supervisor: ${data.supervisorName}`, margin, supY + 15);
      doc.text(`Signature: ____________________`, margin, supY + 25);
      doc.text(`Date: ____________________`, margin, supY + 35);

      // Generate QR Code for verification
      const verificationData: QRVerificationData = {
        reportId: data.reportId,
        documentHash: data.documentHash,
        verificationHash: data.verificationHash,
        timestamp: new Date().toISOString(),
        status: 'VALID'
      };
      
      const qrData = JSON.stringify(verificationData);
      const qrCode = await this.generateQR(qrData);
      
      // Store for verification
      this.verificationCache.set(data.reportId, verificationData);

      // Add QR Code to PDF
      const qrX = pageWidth - margin - 45;
      const qrY = supY - 5;
      const qrSize = 40;
      
      // QR Code placeholder in PDF
      doc.setDrawColor(100, 100, 100);
      doc.rect(qrX, qrY, qrSize, qrSize);
      doc.setFontSize(6);
      doc.setTextColor(100, 100, 100);
      doc.text('QR VERIFICATION', qrX + 5, qrY + 22);
      
      // Add QR image (if generated)
      if (qrCode) {
        try {
          doc.addImage(qrCode, 'PNG', qrX + 2, qrY + 2, qrSize - 4, qrSize - 4);
        } catch (e) {
          // If image can't be added, text is already there
        }
      }
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'italic');
    doc.text('This report is generated by DSPG Academic Integrity System', pageWidth / 2, pageHeight - 10, { align: 'center' });

    return {
      pdf: doc,
      qrCode: await this.generateQR(JSON.stringify({
        reportId: data.reportId,
        documentHash: data.documentHash
      })),
      verificationData: {
        reportId: data.reportId,
        documentHash: data.documentHash,
        verificationHash: data.verificationHash,
        timestamp: new Date().toISOString(),
        status: 'VALID'
      }
    };
  }

  // ✅ Verify QR Report
  verifyReport(reportId: string, qrData: string): { valid: boolean; message: string; data?: QRVerificationData } {
    try {
      const parsed: QRVerificationData = JSON.parse(qrData);
      
      // Check cache
      const stored = this.verificationCache.get(reportId);
      if (!stored) {
        return { valid: false, message: 'Report not found in verification registry' };
      }

      // Verify hash
      if (stored.documentHash !== parsed.documentHash) {
        return { valid: false, message: 'Document hash mismatch - report may be tampered' };
      }

      // Check timestamp (valid for 30 days)
      const reportTime = new Date(stored.timestamp).getTime();
      if (Date.now() - reportTime > 30 * 24 * 60 * 60 * 1000) {
        return { valid: false, message: 'Report verification expired (older than 30 days)' };
      }

      return { 
        valid: true, 
        message: '✅ Report verified successfully',
        data: stored
      };
    } catch (error) {
      return { valid: false, message: 'Invalid QR data format' };
    }
  }
}
