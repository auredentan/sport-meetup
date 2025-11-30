import Link from "next/link";
import { db } from "@/db";
import { activities, Activity } from "@/db/schema";
import { sql, eq, and, like } from "drizzle-orm";
import {
  getNextOccurrence,
  isRecurringActivityActive,
  formatRecurrenceType,
} from "@/lib/recurrence";

const SPORT_TYPES = [
  "Running",
  "Cycling",
  "Swimming",
  "Tennis",
  "Basketball",
  "Soccer",
  "Gym",
  "Bodybuilding",
  "Hiking",
  "Yoga",
  "Golf",
  "Volleyball",
  "Badminton",
  "Other",
];

const SKILL_LEVELS = ["All Levels", "Beginner", "Intermediate", "Advanced"];

interface PageProps {
  searchParams: Promise<{
    sport?: string;
    skill?: string;
    location?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

interface ActivityWithNextDate extends Activity {
  nextOccurrence: Date;
}

async function getActivities(filters: {
  sport?: string;
  skill?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<ActivityWithNextDate[]> {
  const nowSeconds = Math.floor(Date.now() / 1000);

  // Build conditions
  const conditions: ReturnType<typeof sql>[] = [];

  // Base condition: future activities
  conditions.push(
    sql`(
      (${activities.isRecurring} = 0 AND ${activities.date} > ${nowSeconds})
      OR
      (${activities.isRecurring} = 1 AND (${activities.recurrenceEndDate} IS NULL OR ${activities.recurrenceEndDate} > ${nowSeconds}))
    )`
  );

  if (filters.sport) {
    conditions.push(eq(activities.sportType, filters.sport));
  }

  if (filters.skill && filters.skill !== "All Levels") {
    conditions.push(eq(activities.skillLevel, filters.skill.toLowerCase()));
  }

  if (filters.location) {
    conditions.push(like(activities.location, `%${filters.location}%`));
  }

  const results = await db.query.activities.findMany({
    where: and(...conditions),
  });

  // Calculate next occurrence for each activity and filter out inactive ones
  let activitiesWithNextDate: ActivityWithNextDate[] = results
    .filter((activity) => isRecurringActivityActive(activity))
    .map((activity) => ({
      ...activity,
      nextOccurrence: getNextOccurrence(activity),
    }))
    .sort((a, b) => a.nextOccurrence.getTime() - b.nextOccurrence.getTime());

  // Apply date range filter on calculated next occurrence
  if (filters.dateFrom) {
    const dateFromTimestamp = new Date(filters.dateFrom).getTime();
    activitiesWithNextDate = activitiesWithNextDate.filter(
      (activity) => activity.nextOccurrence.getTime() >= dateFromTimestamp
    );
  }

  if (filters.dateTo) {
    const dateToTimestamp = new Date(filters.dateTo).setHours(23, 59, 59, 999);
    activitiesWithNextDate = activitiesWithNextDate.filter(
      (activity) => activity.nextOccurrence.getTime() <= dateToTimestamp
    );
  }

  return activitiesWithNextDate;
}

export default async function ActivitiesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activitiesList = await getActivities({
    sport: params.sport,
    skill: params.skill,
    location: params.location,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Activities</h1>
          <Link
            href="/activities/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Create Activity
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <form className="space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sport Type
                </label>
                <select
                  name="sport"
                  defaultValue={params.sport || ""}
                  className="w-full rounded-lg border-gray-300 border px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Sports</option>
                  {SPORT_TYPES.map((sport) => (
                    <option key={sport} value={sport}>
                      {sport}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skill Level
                </label>
                <select
                  name="skill"
                  defaultValue={params.skill || ""}
                  className="w-full rounded-lg border-gray-300 border px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Any Level</option>
                  {SKILL_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  defaultValue={params.location || ""}
                  placeholder="City or area"
                  className="w-full rounded-lg border-gray-300 border px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date From
                </label>
                <input
                  type="date"
                  name="dateFrom"
                  defaultValue={params.dateFrom || ""}
                  className="w-full rounded-lg border-gray-300 border px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date To
                </label>
                <input
                  type="date"
                  name="dateTo"
                  defaultValue={params.dateTo || ""}
                  className="w-full rounded-lg border-gray-300 border px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Results */}
        {activitiesList.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activitiesList.map((activity) => (
              <Link
                key={activity.id}
                href={`/activities/${activity.id}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {activity.sportType}
                      </span>
                      {activity.isRecurring && (
                        <span
                          className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded"
                          title={formatRecurrenceType(activity.recurrenceType)}
                        >
                          ↻ {formatRecurrenceType(activity.recurrenceType)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 capitalize">
                      {activity.skillLevel}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {activity.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {activity.description}
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {activity.location}
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>
                        {activity.isRecurring ? "Next: " : ""}
                        {activity.nextOccurrence.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      Max {activity.maxParticipants} participants
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No activities found
            </h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your filters or create a new activity
            </p>
            <Link
              href="/activities/create"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create Activity
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
