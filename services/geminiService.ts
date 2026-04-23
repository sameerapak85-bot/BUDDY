
import { GoogleGenAI, Chat } from "@google/genai";
import type { MutableRefObject } from 'react';
import { Message, Role } from '../types';

const getSystemInstruction = (documentContext?: string) => {
  let instruction = `You are a secure AI assistant for military personnel, designation "BUDDY" (Battlefield Utility & Data Decisions Yield).
Your primary purpose is to analyze and answer questions based on the provided documents.
Maintain a formal, professional military tone. All communications are logged.

### OUTPUT FORMAT SPECIFICATIONS:
1.  **Headings**: Use Markdown headings (e.g., ###) for distinct sections.
2.  **Structure**: Responses should typically follow this structure:
    *   **EXECUTIVE SUMMARY**: A brief (1-2 sentence) overview.
    *   **DETAILED FINDINGS**: Bulleted points detailing information from the documents.
    *   **TACTICAL CONSIDERATIONS / RECOMMENDATIONS** (if applicable): Actionable insights based ON THE DOCUMENTS.
3.  **Clarity**: Use bold text for key terms or critical instructions.
4.  **Tables**: Use Markdown tables for data comparisons if found in the text.`;

  if (documentContext) {
    instruction += `\n\nCONTEXT FROM UPLOADED DOCUMENTS:\n${documentContext}\n\nWhen answering, you must use the information from the provided documents. 
Your responses must be precise and factual, citing the document's content where possible.
Never use external knowledge or the public internet if the information is not in the documents.
If a question cannot be answered using the information in the documents, you must state: "That information is not contained within the provided knowledge base."`;
  } else {
    instruction += `\n\nNo documents have been uploaded yet. Inform the user that you are ready to analyze any documents they provide. Always remind them that document processing is required for tactical inquiry.`;
  }

  return instruction;
};

const getChatInstance = (
  chatInstanceRef: MutableRefObject<Chat | null>, 
  documentContext?: string,
  history?: Message[]
): Chat => {
  if (!chatInstanceRef.current) {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Map our Message type to Gemini's history format
    const formattedHistory: { role: string; parts: { text: string }[] }[] = [];
    
    if (history) {
      history.forEach((msg) => {
        const role = msg.role === Role.USER ? 'user' : 'model';
        const lastMsg = formattedHistory[formattedHistory.length - 1];
        
        if (lastMsg && lastMsg.role === role) {
          // Merge consecutive messages from the same role
          lastMsg.parts[0].text += `\n\n${msg.content}`;
        } else {
          formattedHistory.push({
            role,
            parts: [{ text: msg.content }]
          });
        }
      });
    }

    chatInstanceRef.current = ai.chats.create({
      model: 'gemini-3-flash-preview',
      history: formattedHistory,
      config: {
        systemInstruction: getSystemInstruction(documentContext),
      },
    });
  }
  return chatInstanceRef.current;
};

export const streamMessage = async (
  message: string,
  chatInstanceRef: MutableRefObject<Chat | null>,
  onChunk: (chunk: string) => void,
  onError: (error: Error) => void,
  onFinally: () => void,
  documentContext?: string,
  history?: Message[]
): Promise<void> => {
  try {
    const chat = getChatInstance(chatInstanceRef, documentContext, history);
    const result = await chat.sendMessageStream({ message });

    for await (const chunk of result) {
      onChunk(chunk.text);
    }
  } catch (err) {
    onError(err as Error);
  } finally {
    onFinally();
  }
};
