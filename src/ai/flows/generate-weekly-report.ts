// src/ai/flows/generate-weekly-report.ts
'use server';

/**
 * @fileOverview Generates a weekly PDF report summarizing income and expenses for the mosque.
 *
 * - generateWeeklyReport - A function that generates the weekly report.
 * - GenerateWeeklyReportInput - The input type for the generateWeeklyReport function.
 * - GenerateWeeklyReportOutput - The return type for the generateWeeklyReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { generatePdfReport } from '@/services/pdf-generator';

const GenerateWeeklyReportInputSchema = z.object({
  startDate: z.string().describe('The start date for the weekly report (YYYY-MM-DD).'),
  endDate: z.string().describe('The end date for the weekly report (YYYY-MM-DD).'),
  incomeCategories: z.array(z.string()).optional().describe('List of income categories to include in the report.'),
  expenseCategories: z.array(z.string()).optional().describe('List of expense categories to include in the report.'),
});
export type GenerateWeeklyReportInput = z.infer<typeof GenerateWeeklyReportInputSchema>;

const GenerateWeeklyReportOutputSchema = z.object({
  reportDataUri: z.string().describe('The PDF report as a data URI (base64 encoded).'),
});
export type GenerateWeeklyReportOutput = z.infer<typeof GenerateWeeklyReportOutputSchema>;

export async function generateWeeklyReport(input: GenerateWeeklyReportInput): Promise<GenerateWeeklyReportOutput> {
  return generateWeeklyReportFlow(input);
}

const reportPrompt = ai.definePrompt({
  name: 'weeklyReportPrompt',
  input: {
    schema: GenerateWeeklyReportInputSchema,
  },
  prompt: `You are an accounting expert preparing a financial report.
  Create a weekly financial report summarizing the income and expenses of Al Madani Mosque.
  The report should cover the period from {{startDate}} to {{endDate}}.

  Include a summary of total income and total expenses.
  The user has selected specific categories to include in the report:

  Income Categories: {{#if incomeCategories}}{{{incomeCategories}}}{{else}}All Categories{{/if}}
  Expense Categories: {{#if expenseCategories}}{{{expenseCategories}}}{{else}}All Categories{{/if}}

  Based on the categories chosen, determine the level of detail to include.  If only a few categories are selected, provide a more detailed breakdown.  If all categories are selected, provide a high-level summary.

  Format the report in a professional and easy-to-read manner.
  The final result will be converted to a PDF document.
  Be concise.
  `,
});

const generateWeeklyReportFlow = ai.defineFlow(
  {
    name: 'generateWeeklyReportFlow',
    inputSchema: GenerateWeeklyReportInputSchema,
    outputSchema: GenerateWeeklyReportOutputSchema,
  },
  async input => {
    const reportText = (await reportPrompt(input)).output;
    if (!reportText) {
      throw new Error('Failed to generate report text.');
    }
    const pdfDataUri = await generatePdfReport(reportText);

    return { reportDataUri: pdfDataUri };
  }
);
