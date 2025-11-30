import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { activities, participants, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { JoinLeaveButton } from "./JoinLeaveButton";
import { AddToCalendarButton } from "./AddToCalendarButton";
import { MapView } from "@/components/MapView";
import {
  getNextOccurrence,
  getUpcomingOccurrences,
  formatRecurrenceType,
} from "@/lib/recurrence";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getActivity(id: string) {
  const activity = await db.query.activities.findFirst({
    where: eq(activities.id, id),
  });

  if (!activity) return null;

  const organizer = await db.query.users.findFirst({
    where: eq(users.id, activity.organizerId),
  });

  const activityParticipants = await db
    .select({
      id: participants.id,
      status: participants.status,
      joinedAt: participants.joinedAt,
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(participants)
    .innerJoin(users, eq(participants.userId, users.id))
    .where(
      and(
        eq(participants.activityId, id),
        eq(participants.status, "confirmed")
      )
    );

  // Calculate next occurrence and upcoming dates for recurring activities
  const nextOccurrence = getNextOccurrence(activity);
  const upcomingOccurrences = activity.isRecurring
    ? getUpcomingOccurrences(activity, 5)
    : [];

  return {
    ...activity,
    organizer,
    participants: activityParticipants,
    nextOccurrence,
    upcomingOccurrences,
  };
}

export default async function ActivityDetailPage({ params }: PageProps) {
  const { id } = await params;
  const activity = await getActivity(id);

  if (!activity) {
    notFound();
  }

  const session = await getSession();
  const isOrganizer = session?.id === activity.organizerId;
  const isParticipant = activity.participants.some(
    (p) => p.user.id === session?.id
  );
  const spotsLeft = activity.maxParticipants - activity.participants.length;
  const isPast =
    !activity.isRecurring && new Date(activity.date) < new Date();
  const isRecurringEnded =
    activity.isRecurring &&
    activity.recurrenceEndDate &&
    new Date(activity.recurrenceEndDate) < new Date();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/activities"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to activities
        </Link>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
                    {activity.sportType}
                  </span>
                  <span className="text-sm text-gray-500 capitalize">
                    {activity.skillLevel} level
                  </span>
                  {activity.isRecurring && activity.recurrenceType && (
                    <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      {formatRecurrenceType(activity.recurrenceType)}
                    </span>
                  )}
                  {(isPast || isRecurringEnded) && (
                    <span className="bg-gray-100 text-gray-600 text-sm font-medium px-3 py-1 rounded">
                      {isRecurringEnded ? "Series Ended" : "Past Event"}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {activity.title}
                </h1>
              </div>
              {isOrganizer && !(isPast || isRecurringEnded) && (
                <Link
                  href={`/activities/${activity.id}/edit`}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </Link>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    About this activity
                  </h2>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {activity.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center text-gray-600 mb-1">
                      <svg
                        className="w-5 h-5 mr-2"
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
                      {activity.isRecurring ? "Next Session" : "Date & Time"}
                    </div>
                    <p className="font-medium text-gray-900">
                      {activity.nextOccurrence.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-gray-600">
                      {activity.nextOccurrence.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center text-gray-600 mb-1">
                      <svg
                        className="w-5 h-5 mr-2"
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
                      Location
                    </div>
                    <p className="font-medium text-gray-900">
                      {activity.location}
                    </p>
                  </div>
                </div>

                {/* Map View */}
                {activity.latitude && activity.longitude && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">
                      Location Map
                    </h2>
                    <MapView
                      lat={activity.latitude}
                      lng={activity.longitude}
                      location={activity.location}
                    />
                  </div>
                )}

                {/* Upcoming Sessions for Recurring Activities */}
                {activity.isRecurring &&
                  activity.upcomingOccurrences.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">
                        Upcoming Sessions
                      </h2>
                      <div className="space-y-2">
                        {activity.upcomingOccurrences.map((date, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg"
                          >
                            <svg
                              className="w-5 h-5 text-purple-600"
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
                            <span className="font-medium text-gray-900">
                              {date.toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span className="text-gray-500">
                              {date.toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                      {activity.recurrenceEndDate && (
                        <p className="text-sm text-gray-500 mt-2">
                          Series ends on{" "}
                          {new Date(
                            activity.recurrenceEndDate
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  )}

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    Participants ({activity.participants.length}/
                    {activity.maxParticipants})
                  </h2>
                  <div className="space-y-3">
                    {activity.participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {participant.user.avatarUrl ? (
                            <img
                              src={participant.user.avatarUrl}
                              alt=""
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <span className="text-blue-600 font-medium">
                              {(participant.user.firstName?.[0] ||
                                participant.user.email[0])?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {participant.user.firstName &&
                            participant.user.lastName
                              ? `${participant.user.firstName} ${participant.user.lastName}`
                              : participant.user.email}
                          </p>
                          {participant.user.id === activity.organizerId && (
                            <span className="text-xs text-blue-600">
                              Organizer
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-1">
                <div className="bg-gray-50 rounded-xl p-6 sticky top-8">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-gray-900">
                      {spotsLeft}
                    </div>
                    <div className="text-gray-600">spots left</div>
                  </div>

                  {!session ? (
                    <Link
                      href="/login"
                      className="block w-full bg-blue-600 text-white text-center px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Sign in to join
                    </Link>
                  ) : isPast || isRecurringEnded ? (
                    <div className="text-center text-gray-500 py-3">
                      This activity has ended
                    </div>
                  ) : isOrganizer ? (
                    <div className="text-center text-gray-500 py-3">
                      You&apos;re organizing this activity
                    </div>
                  ) : (
                    <JoinLeaveButton
                      activityId={activity.id}
                      isParticipant={isParticipant}
                      isFull={spotsLeft <= 0}
                    />
                  )}

                  {!(isPast || isRecurringEnded) && (
                    <div className="mt-4">
                      <AddToCalendarButton
                        title={activity.title}
                        description={activity.description}
                        location={activity.location}
                        startDate={activity.nextOccurrence}
                        isRecurring={activity.isRecurring ?? false}
                        recurrenceType={activity.recurrenceType}
                        recurrenceEndDate={activity.recurrenceEndDate}
                      />
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Organized by
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        {activity.organizer?.avatarUrl ? (
                          <img
                            src={activity.organizer.avatarUrl}
                            alt=""
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <span className="text-blue-600 font-medium">
                            {(activity.organizer?.firstName?.[0] ||
                              activity.organizer?.email[0])?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {activity.organizer?.firstName &&
                          activity.organizer?.lastName
                            ? `${activity.organizer.firstName} ${activity.organizer.lastName}`
                            : activity.organizer?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
