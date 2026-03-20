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

    const prompt = `You are an ATS (Applicant Tracking System) expert.

Analyze the following resume and give an ATS score out of 100 for the target job role.

Target Job Role:
${jobRole}

Resume:
${resumeText}

Instructions:
1. Give an ATS score (0–100)
2. Evaluate based on:
   - Keyword relevance
   - Formatting
   - Clarity
   - Achievements
3. Provide detailed feedback:
   - Strengths (what is good)
   - Weaknesses (what is missing)
4. Suggest improvements:
   - Missing keywords
   - Better phrasing
   - Structure fixes

You MUST respond in this EXACT JSON format (no markdown, no extra text):
{
  "score": 85,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "missingKeywords": ["keyword 1", "keyword 2"],
  "summary": "Brief 1-line summary of overall quality"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 800,
    });

    const raw = completion.choices[0]?.message?.content || "{}";

    // Parse JSON from AI response
    let parsed;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch {
      parsed = { score: 0, strengths: [], weaknesses: [], suggestions: [], missingKeywords: [], summary: "Could not analyze resume." };
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "ATS scoring failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
