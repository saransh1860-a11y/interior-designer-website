import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API Route for Gemini (Server-side)
  app.post("/api/gemini", async (req, res) => {
    try {
      const { userMessage, chatHistory } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API Key not configured on server" });
      }

      // Use the correct GoogleGenAI pattern as used in geminiService.ts
      const ai = new GoogleGenAI({ apiKey });

      const SYSTEM_INSTRUCTION = `
You are an expert architectural and interior design consultant for "Design Excel Architects", located in Ambala, Haryana.
Your goal is to assist potential clients with their architectural, interior design, and Vastu queries, provide professional advice, and encourage them to book a consultation.

Key Information about the Studio:
- Name: Design Excel Architects
- Location: Jalbera Rd, Parshuram Nagar, Ambala, Haryana
- Services: Home Building & Renovations, Interior Design, Vastu Experts, Architecture, Valuer.
- Rating: 4.8★ (19 reviews)
- USP: Comprehensive design solutions, Vastu expertise, modern architecture.

Tone: Professional, authoritative yet helpful, and creative.

Guidelines:
1. Provide practical and stylish design and architectural tips.
2. Mention our local expertise in Ambala and Haryana.
3. If a user seems interested in starting a project, suggest they use the "Book Free Consultation" button or call us at 090507 05520.
      `;

      const contents = [
        ...chatHistory,
        { role: 'user', parts: [{ text: userMessage }] }
      ];

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      res.json({ text: response.text });
    } catch (error) {
      console.error("Gemini Server Error:", error);
      res.status(500).json({ error: "Failed to generate AI response" });
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
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
