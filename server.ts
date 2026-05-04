import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini AI Setup
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  
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
2. Mention our local expertise in Karnal and our wide range of decorative products.
3. If a user seems interested in starting a project, suggest they use the "Inquiry" button or call us at 095405 47745.
`;

  // AI API Route
  app.post("/api/chat", async (req, res) => {
    try {
      const { userMessage, chatHistory } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured.");
      }

      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: SYSTEM_INSTRUCTION
      });

      const chat = model.startChat({
        history: chatHistory.map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text || m.parts?.[0]?.text || "" }]
        })),
        generationConfig: {
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      res.json({ text: response.text() });
    } catch (error: any) {
      console.error("Gemini Server Error:", error);
      res.status(500).json({ error: "Failed to process chat request" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
