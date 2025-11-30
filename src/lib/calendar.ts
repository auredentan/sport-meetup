/**
 * Calendar export utilities for activities
 */

interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  isRecurring?: boolean;
  recurrenceType?: string | null;
  recurrenceEndDate?: Date | null;
}

/**
 * Format date for Google Calendar URL (YYYYMMDDTHHmmssZ)
 */
function formatGoogleDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/**
 * Format date for ICS file (YYYYMMDDTHHmmssZ)
 */
function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/**
 * Generate Google Calendar URL for an event
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatGoogleDate(event.startDate)}/${formatGoogleDate(event.endDate)}`,
    details: event.description,
    location: event.location,
  });

  // Add recurrence rule if applicable
  if (event.isRecurring && event.recurrenceType) {
    let freq = "";
    let interval = 1;

    switch (event.recurrenceType) {
      case "daily":
        freq = "DAILY";
        break;
      case "weekly":
        freq = "WEEKLY";
        break;
      case "biweekly":
        freq = "WEEKLY";
        interval = 2;
        break;
      case "monthly":
        freq = "MONTHLY";
        break;
    }

    if (freq) {
      let rrule = `FREQ=${freq}`;
      if (interval > 1) {
        rrule += `;INTERVAL=${interval}`;
      }
      if (event.recurrenceEndDate) {
        rrule += `;UNTIL=${formatGoogleDate(event.recurrenceEndDate)}`;
      }
      params.set("recur", `RRULE:${rrule}`);
    }
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate ICS file content for an event
 */
export function generateICSContent(event: CalendarEvent): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SportMeetup//Activity//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `DTSTART:${formatICSDate(event.startDate)}`,
    `DTEND:${formatICSDate(event.endDate)}`,
    `SUMMARY:${escapeICSText(event.title)}`,
    `DESCRIPTION:${escapeICSText(event.description)}`,
    `LOCATION:${escapeICSText(event.location)}`,
    `UID:${crypto.randomUUID()}@sportmeetup`,
    `DTSTAMP:${formatICSDate(new Date())}`,
  ];

  // Add recurrence rule if applicable
  if (event.isRecurring && event.recurrenceType) {
    let freq = "";
    let interval = 1;

    switch (event.recurrenceType) {
      case "daily":
        freq = "DAILY";
        break;
      case "weekly":
        freq = "WEEKLY";
        break;
      case "biweekly":
        freq = "WEEKLY";
        interval = 2;
        break;
      case "monthly":
        freq = "MONTHLY";
        break;
    }

    if (freq) {
      let rrule = `RRULE:FREQ=${freq}`;
      if (interval > 1) {
        rrule += `;INTERVAL=${interval}`;
      }
      if (event.recurrenceEndDate) {
        rrule += `;UNTIL=${formatICSDate(event.recurrenceEndDate)}`;
      }
      lines.push(rrule);
    }
  }

  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.join("\r\n");
}

/**
 * Escape special characters for ICS format
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Calculate end date based on activity duration (default 1 hour)
 */
export function getActivityEndDate(startDate: Date, durationMinutes: number = 60): Date {
  return new Date(startDate.getTime() + durationMinutes * 60 * 1000);
}
