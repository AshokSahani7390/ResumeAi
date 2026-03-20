import OpenAI from "openai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobRole, resumeText } = body;

    const prompt = `You are an expert resume optimizer.

Improve the following resume to increase its ATS score for the given job role.

Job Role:
${jobRole}

Resume:
${resumeText}

Instructions:
- Add relevant keywords for the ${jobRole} role
- Improve bullet points with strong action verbs
- Make achievements measurable (add numbers, percentages, metrics)
- Keep it concise
- Maintain professional tone
- Make the output ATS-friendly and optimized for modern hiring systems

Return ONLY the improved version of the resume in clean plain text format. No commentary or explanations.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 1200,
    });

    const content = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ content });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Resume improvement failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
