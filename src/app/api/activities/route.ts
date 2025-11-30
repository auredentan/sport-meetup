import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { activities, participants } from "@/db/schema";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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

    const activityId = crypto.randomUUID();
    const startDate = new Date(date);

    // Create the activity (single record, even for recurring)
    await db.insert(activities).values({
      id: activityId,
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
      organizerId: session.id,
    });

    // Automatically add organizer as first participant
    await db.insert(participants).values({
      id: crypto.randomUUID(),
      activityId,
      userId: session.id,
      status: "confirmed",
    });

    return NextResponse.json({ id: activityId }, { status: 201 });
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
}
