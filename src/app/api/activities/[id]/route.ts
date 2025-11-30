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

    const {
      title,
      description,
      sportType,
      location,
      latitude,
      longitude,
      date,
      maxParticipants,
      skillLevel,
      isRecurring,
      recurrenceType,
      recurrenceEndDate,
    } = body;

    if (
      !title ||
      !description ||
      !sportType ||
      !location ||
      !date ||
      !maxParticipants ||
      !skillLevel
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (isRecurring && (!recurrenceType || !recurrenceEndDate)) {
      return NextResponse.json(
        { error: "Recurring activities require recurrence type and end date" },
        { status: 400 }
      );
    }

    const startDate = new Date(date);

    const updates: Partial<typeof activities.$inferInsert> = {
      title,
      description,
      sportType,
      location,
      latitude: latitude || null,
      longitude: longitude || null,
      date: startDate,
      maxParticipants: parseInt(maxParticipants),
      skillLevel,
      isRecurring: isRecurring || false,
      recurrenceType: isRecurring ? recurrenceType : null,
      recurrenceEndDate: isRecurring ? new Date(recurrenceEndDate) : null,
      recurrenceDay: isRecurring ? startDate.getDay() : null,
      updatedAt: new Date(),
    };

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
