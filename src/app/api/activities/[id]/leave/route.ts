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

    // Check if user is the organizer
    if (activity.organizerId === session.id) {
      return NextResponse.json(
        { error: "Organizer cannot leave their own activity" },
        { status: 400 }
      );
    }

    // Check if user is a participant
    const existingParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participants.activityId, id),
        eq(participants.userId, session.id)
      ),
    });

    if (!existingParticipant) {
      return NextResponse.json(
        { error: "Not a participant of this activity" },
        { status: 400 }
      );
    }

    // Remove participant
    await db
      .delete(participants)
      .where(
        and(
          eq(participants.activityId, id),
          eq(participants.userId, session.id)
        )
      );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error leaving activity:", error);
    return NextResponse.json(
      { error: "Failed to leave activity" },
      { status: 500 }
    );
  }
}
