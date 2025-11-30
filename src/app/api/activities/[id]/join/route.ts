import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { activities, participants } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq, and } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Check if activity exists
    const activity = await db.query.activities.findFirst({
      where: eq(activities.id, id),
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    // Check if user already joined
    const existingParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participants.activityId, id),
        eq(participants.userId, session.id)
      ),
    });

    if (existingParticipant) {
      return NextResponse.json(
        { error: "Already joined this activity" },
        { status: 400 }
      );
    }

    // Check if activity is full
    const currentParticipants = await db.query.participants.findMany({
      where: and(
        eq(participants.activityId, id),
        eq(participants.status, "confirmed")
      ),
    });

    if (currentParticipants.length >= activity.maxParticipants) {
      return NextResponse.json({ error: "Activity is full" }, { status: 400 });
    }

    // Add participant
    await db.insert(participants).values({
      id: crypto.randomUUID(),
      activityId: id,
      userId: session.id,
      status: "confirmed",
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error joining activity:", error);
    return NextResponse.json(
      { error: "Failed to join activity" },
      { status: 500 }
    );
  }
}
