
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Role } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const createChatSession = () => {
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are OmniChat, a helpful, intelligent, and versatile universal assistant. You provide accurate, detailed, and polite answers to any question. If you use search results, cite your sources. Format your responses with Markdown for clarity.",
      tools: [{ googleSearch: {} }],
    },
  });
};

export const parseGroundingChunks = (response: any) => {
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (!chunks) return [];
  
  return chunks
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => ({
      title: chunk.web.title || 'Source',
      uri: chunk.web.uri,
    }));
};
