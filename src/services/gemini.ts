import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const GeminiService = {
  async getDiagnosis(model: string, defect: string) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analise o seguinte defeito em um celular ${model}: "${defect}". 
        Forneça um diagnóstico técnico resumido, possíveis causas e uma estimativa de preço médio (em Reais) para o conserto.
        Responda em Português do Brasil, formatado em Markdown.`,
      });
      return response.text;
    } catch (error) {
      console.error("Error getting diagnosis:", error);
      return "Não foi possível obter um diagnóstico automático no momento.";
    }
  },

  async getModelTips(model: string) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Quais são os problemas crônicos ou dicas importantes para técnicos ao consertar o modelo ${model}? 
        Seja direto e prático. Responda em Português do Brasil, formatado em Markdown.`,
      });
      return response.text;
    } catch (error) {
      console.error("Error getting model tips:", error);
      return "Dicas não disponíveis para este modelo.";
    }
  }
};
