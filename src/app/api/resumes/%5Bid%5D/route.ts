import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { getUserFromRequest } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/prisma");

    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const resume = await prisma.resume.findFirst({
      where: { id, userId: user.userId },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json({ resume });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch resume";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { getUserFromRequest } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/prisma");

    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.resume.findFirst({
      where: { id, userId: user.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const resume = await prisma.resume.update({
      where: { id },
      data: {
        ...(body.aiResume !== undefined && { aiResume: body.aiResume }),
        ...(body.aiCoverLetter !== undefined && { aiCoverLetter: body.aiCoverLetter }),
        ...(body.template !== undefined && { template: body.template }),
        ...(body.atsScore !== undefined && { atsScore: body.atsScore }),
        ...(body.atsStrengths !== undefined && { atsStrengths: JSON.stringify(body.atsStrengths) }),
        ...(body.atsWeaknesses !== undefined && { atsWeaknesses: JSON.stringify(body.atsWeaknesses) }),
        ...(body.atsSuggestions !== undefined && { atsSuggestions: JSON.stringify(body.atsSuggestions) }),
        ...(body.fullName !== undefined && { fullName: body.fullName }),
        ...(body.skills !== undefined && { skills: body.skills }),
        ...(body.experience !== undefined && { experience: body.experience }),
      },
    });

    return NextResponse.json({ resume });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update resume";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { getUserFromRequest } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/prisma");

    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.resume.findFirst({
      where: { id, userId: user.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    await prisma.resume.delete({ where: { id } });

    return NextResponse.json({ message: "Resume deleted" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete resume";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
