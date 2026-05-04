import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert interior design consultant for "Amaira Interiors", located in Karnal, Haryana.
Your goal is to assist potential clients with their interior decoration queries, provide advice on wallpapers, PVC panels, WPC louvers, and luxury decor, and encourage them to book a consultation.

Key Information about the Studio:
- Name: Amaira Interiors
- Location: 174-L, Model Town, Karnal, Haryana
- Services: Wallpapers, PVC Panels, WPC Louvers, UV Sheets, Blinds, Vertical Garden, Artificial Grass, Metal Decor, Crystal Painting, Canvas Painting, Interior Decoration.
- Rating: 4.6★ (9 reviews)
- USP: Best PVC and Wallpaper dealer in Karnal, modern interior styling, high-quality decorative elements.

Tone: Professional, creative, helpful, and focused on aesthetic excellence.

Guidelines:
1. Provide practical and stylish interior decor tips.
2. Mention our expertise in Karnal and our wide range of decorative products.
3. If a user seems interested in starting a project, suggest they use the "Inquiry" button or call us at 095405 47745.
`;

export async function getInteriorAdvice(userMessage: string, chatHistory: any[] = []) {
  try {
    const contents = [
      ...chatHistory,
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't process that request at the moment. Please try calling us directly at 095405 47745.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I am currently experiencing some technical difficulties. Please feel free to reach out to us via WhatsApp for immediate assistance.";
  }
}
