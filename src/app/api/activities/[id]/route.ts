import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { activities, participants } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Check if activity exists and user is the organizer
    const activity = await db.query.activities.findFirst({
      where: eq(activities.id, id),
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    if (activity.organizerId !== session.id) {
      return NextResponse.json(
        { error: "Only the organizer can delete this activity" },
        { status: 403 }
      );
    }

    // Delete participants first (foreign key constraint)
    await db.delete(participants).where(eq(participants.activityId, id));

    // Delete the activity
    await db.delete(activities).where(eq(activities.id, id));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting activity:", error);
    return NextResponse.json(
      { error: "Failed to delete activity" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Check if activity exists and user is the organizer
    const activity = await db.query.activities.findFirst({
      where: eq(activities.id, id),
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    if (activity.organizerId !== session.id) {
      return NextResponse.json(
        { error: "Only the organizer can edit this activity" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const updates: Partial<typeof activities.$inferInsert> = {};

    if (body.title) updates.title = body.title;
    if (body.description) updates.description = body.description;
    if (body.sportType) updates.sportType = body.sportType;
    if (body.location) updates.location = body.location;
    if (body.date) updates.date = new Date(body.date);
    if (body.maxParticipants)
      updates.maxParticipants = parseInt(body.maxParticipants);
    if (body.skillLevel) updates.skillLevel = body.skillLevel;

    updates.updatedAt = new Date();

    await db.update(activities).set(updates).where(eq(activities.id, id));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating activity:", error);
    return NextResponse.json(
      { error: "Failed to update activity" },
      { status: 500 }
    );
  }
}
