export async function getInteriorAdvice(userMessage: string, chatHistory: any[] = []) {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userMessage, chatHistory }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();
    return data.text || "I'm sorry, I couldn't process that request at the moment. Please try calling us directly at 090507 05520.";
  } catch (error) {
    console.error("Gemini Fetch Error:", error);
    return "I am currently experiencing some technical difficulties. Please feel free to reach out to us via WhatsApp for immediate assistance.";
  }
}
