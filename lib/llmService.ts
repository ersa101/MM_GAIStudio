
import { GoogleGenAI, Type } from "@google/genai";
import { TransactionType } from "../types";

export interface LLMSuggestion {
  amount: number;
  type: TransactionType;
  bankName: string;
  merchant?: string;
  category?: string;
  confidence: number;
}

export class LLMService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async getSuggestion(text: string): Promise<LLMSuggestion> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this bank SMS and extract transaction details.
      SMS: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER, description: "The transaction amount" },
            type: { type: Type.STRING, enum: ['EXPENSE', 'INCOME'], description: "The type of transaction" },
            bankName: { type: Type.STRING, description: "Name of the bank" },
            merchant: { type: Type.STRING, description: "Merchant name if mentioned" },
            category: { type: Type.STRING, description: "Suggested category (e.g., Food, Transport, Salary)" },
            confidence: { type: Type.NUMBER, description: "Confidence score from 0 to 100" }
          },
          required: ['amount', 'type', 'bankName']
        }
      },
    });

    const jsonStr = response.text?.trim() || '{}';
    const data = JSON.parse(jsonStr);

    return {
      amount: data.amount || 0,
      type: data.type === 'INCOME' ? TransactionType.INCOME : TransactionType.EXPENSE,
      bankName: data.bankName || 'Unknown',
      merchant: data.merchant,
      category: data.category,
      confidence: data.confidence || 80
    };
  }
}

export const llmService = new LLMService();
