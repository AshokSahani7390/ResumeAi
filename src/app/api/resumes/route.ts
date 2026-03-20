import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { getUserFromRequest } = await import("@/lib/auth");
    const { getPrisma } = await import("@/lib/prisma");

    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrisma();

    const resumes = await prisma.resume.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        jobRole: true,
        template: true,
        atsScore: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ resumes });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch resumes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { getUserFromRequest } = await import("@/lib/auth");
    const { getPrisma } = await import("@/lib/prisma");

    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrisma();

    const body = await req.json();
    const {
      fullName, email, phone, location, jobRole, experienceLevel,
      skills, experience, education, aiResume, aiCoverLetter,
      template, atsScore, atsStrengths, atsWeaknesses, atsSuggestions,
    } = body;

    const resume = await prisma.resume.create({
      data: {
        userId: user.userId,
        title: `${jobRole || "Untitled"} Resume`,
        fullName: fullName || "",
        email: email || "",
        phone,
        location,
        jobRole: jobRole || "",
        experienceLevel,
        skills,
        experience,
        education,
        aiResume,
        aiCoverLetter,
        template: template || "Professional",
        atsScore,
        atsStrengths: atsStrengths ? JSON.stringify(atsStrengths) : null,
        atsWeaknesses: atsWeaknesses ? JSON.stringify(atsWeaknesses) : null,
        atsSuggestions: atsSuggestions ? JSON.stringify(atsSuggestions) : null,
      },
    });

    return NextResponse.json({ resume }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create resume";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
