/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InterpretationRequest } from '../contracts/InterpretationRequest';

/**
 * Single Responsibility: Convert InterpretationRequest into provider prompts.
 * Output formatting and instruction injection.
 * Forbidden: Provider calls, Business logic, Evidence generation, Similarity calculations.
 */
export class PromptBuilder {
  
  public buildSystemPrompt(): string {
    return `You are a strict, deterministic plagiarism and paraphrasing interpretation engine.
You will receive an evidence summary containing mathematical similarities and matching text fragments between a student's document and a candidate paper.
You MUST output strictly in JSON format according to the requested schema.
Do NOT hallucinate evidence. Do NOT provide answers outside the scope of the provided JSON format.`;
  }

  public buildUserPrompt(request: InterpretationRequest): string {
    return `Analyze the following mathematical evidence of similarity:

Evidence:
${JSON.stringify(request.evidence, null, 2)}

Instructions:
You must perform the following tasks based ONLY on the evidence provided:
${request.instructions.tasks.map(t => `- ${t}`).join('\n')}

Output your response strictly as JSON matching this TypeScript interface:
interface InterpretationResult {
  version: "1.0";
  plagiarismType: "None" | "Direct" | "Paraphrased" | "Patchwork" | "Self";
  confidence: number; // 0.0 to 1.0
  summary: string;
  evidenceExplanation: string[];
  lecturerComments: string;
  studentFeedback: string;
  recommendations: string[];
}
`;
  }
}
