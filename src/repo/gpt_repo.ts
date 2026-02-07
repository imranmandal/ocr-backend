import OpenAI from "openai";

export const generateDutch = async (prompt: string) => {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: "gpt-5-nano",
    input: prompt,
  });

  return response.output_text;
};
