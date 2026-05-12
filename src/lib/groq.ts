import Groq from "groq-sdk";

// Initialize Groq client lazily
let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groqClient;
}

export async function summarizeText(content: string) {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set");
    }

    const client = getGroqClient();

    const completion = await client.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `You are an AI that summarizes document contents clearly and concisely in maximum 2-3 sentences. Return ONLY the summary, no other conversational text.\n\nPlease summarize this text:\n\n${content.substring(0, 15000)}`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
    });

    const result = completion.choices[0]?.message?.content || "";
    return result || null;
  } catch (error) {
    console.error("Groq Summary error:", error);
    return null;
  }
}

export async function extractTags(content: string, filename: string) {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set");
    }

    const client = getGroqClient();

    const completion = await client.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `You are an AI that generates a comma-separated list of 3-5 relevant semantic keywords or tags for a file based on its name and content. Return ONLY the comma-separated words, no explanations.\n\nFilename: ${filename}\n\nContent snippets:\n${content.substring(0, 3000)}`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      max_tokens: 512,
    });

    const result = completion.choices[0]?.message?.content || "";
    return result
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  } catch (error) {
    console.error("Groq Tags error:", error);
    return [];
  }
}