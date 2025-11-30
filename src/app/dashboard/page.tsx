import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { activities, participants, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { DeleteActivityButton } from "./DeleteActivityButton";

async function getUserActivities(userId: string) {
  // Activities organized by user
  const organized = await db.query.activities.findMany({
    where: eq(activities.organizerId, userId),
    orderBy: [activities.date],
  });

  // Activities user is participating in (but not organizing)
  const participating = await db
    .select({
      activity: activities,
    })
    .from(participants)
    .innerJoin(activities, eq(participants.activityId, activities.id))
    .where(
      and(
        eq(participants.userId, userId),
        eq(participants.status, "confirmed"),
        sql`${activities.organizerId} != ${userId}`
      )
    );

  return {
    organized,
    participating: participating.map((p) => p.activity),
  };
}

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { organized, participating } = await getUserActivities(session.id);
  const now = new Date();

  const upcomingOrganized = organized.filter((a) => new Date(a.date) > now);
  const pastOrganized = organized.filter((a) => new Date(a.date) <= now);
  const upcomingParticipating = participating.filter(
    (a) => new Date(a.date) > now
  );
  const pastParticipating = participating.filter((a) => new Date(a.date) <= now);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {session.firstName || session.email}
            </p>
          </div>
          <Link
            href="/activities/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Create Activity
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-3xl font-bold text-blue-600">
              {upcomingOrganized.length}
            </div>
            <div className="text-gray-600 text-sm">Activities Organized</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-3xl font-bold text-green-600">
              {upcomingParticipating.length}
            </div>
            <div className="text-gray-600 text-sm">Upcoming Activities</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-3xl font-bold text-purple-600">
              {pastOrganized.length + pastParticipating.length}
            </div>
            <div className="text-gray-600 text-sm">Past Activities</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-3xl font-bold text-orange-600">
              {organized.length + participating.length}
            </div>
            <div className="text-gray-600 text-sm">Total Activities</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Activities You're Organizing */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Activities You&apos;re Organizing
            </h2>
            {upcomingOrganized.length > 0 ? (
              <div className="space-y-4">
                {upcomingOrganized.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-white rounded-xl shadow-sm p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link
                          href={`/activities/${activity.id}`}
                          className="text-lg font-medium text-gray-900 hover:text-blue-600"
                        >
                          {activity.title}
                        </Link>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                            {activity.sportType}
                          </span>
                          <span>
                            {new Date(activity.date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                          <span>{activity.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/activities/${activity.id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View
                        </Link>
                        <DeleteActivityButton activityId={activity.id} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <p className="text-gray-500 mb-4">
                  You haven&apos;t organized any activities yet
                </p>
                <Link
                  href="/activities/create"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Create your first activity
                </Link>
              </div>
            )}
          </div>

          {/* Activities You're Joining */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Activities You&apos;re Joining
            </h2>
            {upcomingParticipating.length > 0 ? (
              <div className="space-y-4">
                {upcomingParticipating.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-white rounded-xl shadow-sm p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link
                          href={`/activities/${activity.id}`}
                          className="text-lg font-medium text-gray-900 hover:text-blue-600"
                        >
                          {activity.title}
                        </Link>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">
                            {activity.sportType}
                          </span>
                          <span>
                            {new Date(activity.date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                          <span>{activity.location}</span>
                        </div>
                      </div>
                      <Link
                        href={`/activities/${activity.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <p className="text-gray-500 mb-4">
                  You haven&apos;t joined any activities yet
                </p>
                <Link
                  href="/activities"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Browse activities
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Past Activities */}
        {(pastOrganized.length > 0 || pastParticipating.length > 0) && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Past Activities
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...pastOrganized, ...pastParticipating]
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .slice(0, 6)
                .map((activity) => (
                  <Link
                    key={activity.id}
                    href={`/activities/${activity.id}`}
                    className="bg-white rounded-xl shadow-sm p-4 opacity-75 hover:opacity-100 transition-opacity"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                        {activity.sportType}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-700">
                      {activity.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {activity.location}
                    </p>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
