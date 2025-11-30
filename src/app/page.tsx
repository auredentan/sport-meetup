import Link from "next/link";
import { db } from "@/db";
import { activities, participants, Activity } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { ActivityCard } from "./activities/ActivityCard";
import {
  getNextOccurrence,
  isRecurringActivityActive,
} from "@/lib/recurrence";

const SPORT_TYPES = [
  { name: "Running", icon: "🏃" },
  { name: "Cycling", icon: "🚴" },
  { name: "Swimming", icon: "🏊" },
  { name: "Tennis", icon: "🎾" },
  { name: "Basketball", icon: "🏀" },
  { name: "Soccer", icon: "⚽" },
  { name: "Gym", icon: "🏋️" },
  { name: "Yoga", icon: "🧘" },
];

interface ActivityWithNextDate extends Activity {
  nextOccurrence: Date;
  participantCount: number;
  isJoined: boolean;
  isOrganizer: boolean;
  isFull: boolean;
}

async function getActivitiesForHome(userId?: string): Promise<{
  joined: ActivityWithNextDate[];
  available: ActivityWithNextDate[];
}> {
  const nowSeconds = Math.floor(Date.now() / 1000);

  const results = await db.query.activities.findMany({
    where: sql`(
      (${activities.isRecurring} = 0 AND ${activities.date} > ${nowSeconds})
      OR
      (${activities.isRecurring} = 1 AND (${activities.recurrenceEndDate} IS NULL OR ${activities.recurrenceEndDate} > ${nowSeconds}))
    )`,
    limit: 30,
    with: {
      participants: {
        where: eq(participants.status, "confirmed"),
      },
    },
  });

  // Process activities
  const activitiesWithData: ActivityWithNextDate[] = results
    .filter((activity) => isRecurringActivityActive(activity))
    .map((activity) => {
      const participantCount = activity.participants?.length || 0;
      const isJoined = userId
        ? activity.participants?.some((p) => p.userId === userId) || false
        : false;
      const isOrganizer = userId ? activity.organizerId === userId : false;
      const isFull = participantCount >= activity.maxParticipants;

      return {
        ...activity,
        nextOccurrence: getNextOccurrence(activity),
        participantCount,
        isJoined,
        isOrganizer,
        isFull,
      };
    })
    .sort((a, b) => a.nextOccurrence.getTime() - b.nextOccurrence.getTime());

  // Separate joined and available activities
  const joined = activitiesWithData.filter((a) => a.isJoined).slice(0, 6);
  const available = activitiesWithData.filter((a) => !a.isJoined).slice(0, 6);

  return { joined, available };
}

export default async function HomePage() {
  const session = await getSession();
  const { joined, available } = await getActivitiesForHome(session?.id);

  return (
    <div className="min-h-screen">
      {/* Your Activities Section - Shown at top when logged in and has activities */}
      {session && joined.length > 0 && (
        <section className="bg-gradient-to-br from-green-50 to-blue-50 py-12 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  Your Activities
                </h2>
                <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  {joined.length}
                </span>
              </div>
              <Link
                href="/dashboard"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View all →
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {joined.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find Your Sports Community
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Connect with people near you who share your passion for sports.
              Create or join activities and stay active together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/activities"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Browse Activities
              </Link>
              <Link
                href="/activities/create"
                className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-colors border border-blue-400"
              >
                Create an Activity
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sport Types */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Popular Sports
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {SPORT_TYPES.map((sport) => (
              <Link
                key={sport.name}
                href={`/activities?sport=${encodeURIComponent(sport.name)}`}
                className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className="text-3xl mb-2">{sport.icon}</div>
                <div className="text-sm font-medium text-gray-700">
                  {sport.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Available Activities Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {session && joined.length > 0 ? "Discover More" : "Upcoming Activities"}
              </h2>
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                {available.length}
              </span>
            </div>
            <Link
              href="/activities"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View all →
            </Link>
          </div>

          {available.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {available.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-500 mb-4">No upcoming activities yet</p>
              <Link
                href="/activities/create"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Create the first one!
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-12 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Find Activities</h3>
              <p className="text-gray-600">
                Browse sports activities happening near you. Filter by sport,
                date, skill level, and location.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Join or Create</h3>
              <p className="text-gray-600">
                Join existing activities or create your own. Set the rules, pick
                a location, and invite others.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Have Fun</h3>
              <p className="text-gray-600">
                Meet up with your group and enjoy the activity together. Make
                new friends and stay active!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 SportMeetup. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
