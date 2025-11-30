import { Activity } from "@/db/schema";

export interface ActivityWithNextDate extends Activity {
  nextOccurrence: Date;
}

/**
 * Calculate the next occurrence of a recurring activity
 */
export function getNextOccurrence(activity: Activity): Date {
  if (!activity.isRecurring || !activity.recurrenceType) {
    return activity.date;
  }

  const now = new Date();
  const startDate = new Date(activity.date);
  const endDate = activity.recurrenceEndDate
    ? new Date(activity.recurrenceEndDate)
    : null;

  // If the recurrence has ended, return the original date
  if (endDate && now > endDate) {
    return activity.date;
  }

  // If the start date is still in the future, return it
  if (startDate > now) {
    return startDate;
  }

  // Calculate next occurrence based on recurrence type
  let nextDate = new Date(startDate);

  while (nextDate <= now) {
    switch (activity.recurrenceType) {
      case "daily":
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case "weekly":
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case "biweekly":
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case "monthly":
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      default:
        return activity.date;
    }
  }

  // Check if next occurrence is past the end date
  if (endDate && nextDate > endDate) {
    return activity.date; // Return original date to indicate series has ended
  }

  return nextDate;
}

/**
 * Get all upcoming occurrences of a recurring activity
 */
export function getUpcomingOccurrences(
  activity: Activity,
  limit: number = 5
): Date[] {
  if (!activity.isRecurring || !activity.recurrenceType) {
    return [activity.date];
  }

  const now = new Date();
  const endDate = activity.recurrenceEndDate
    ? new Date(activity.recurrenceEndDate)
    : null;

  const occurrences: Date[] = [];
  let currentDate = getNextOccurrence(activity);

  while (occurrences.length < limit) {
    if (endDate && currentDate > endDate) {
      break;
    }

    if (currentDate > now) {
      occurrences.push(new Date(currentDate));
    }

    switch (activity.recurrenceType) {
      case "daily":
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case "weekly":
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case "biweekly":
        currentDate.setDate(currentDate.getDate() + 14);
        break;
      case "monthly":
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      default:
        return occurrences;
    }
  }

  return occurrences;
}

/**
 * Check if a recurring activity is still active (has future occurrences)
 */
export function isRecurringActivityActive(activity: Activity): boolean {
  if (!activity.isRecurring) {
    return new Date(activity.date) > new Date();
  }

  const nextOccurrence = getNextOccurrence(activity);
  const endDate = activity.recurrenceEndDate
    ? new Date(activity.recurrenceEndDate)
    : null;

  if (endDate && nextOccurrence > endDate) {
    return false;
  }

  return nextOccurrence > new Date();
}

/**
 * Format recurrence type for display
 */
export function formatRecurrenceType(type: string | null): string {
  switch (type) {
    case "daily":
      return "Daily";
    case "weekly":
      return "Weekly";
    case "biweekly":
      return "Every 2 weeks";
    case "monthly":
      return "Monthly";
    default:
      return "";
  }
}
