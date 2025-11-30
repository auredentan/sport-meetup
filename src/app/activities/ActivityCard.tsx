"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Activity } from "@/db/schema";
import { formatRecurrenceType } from "@/lib/recurrence";

interface ActivityWithNextDate extends Activity {
  nextOccurrence: Date;
  participantCount: number;
  isJoined: boolean;
  isOrganizer: boolean;
  isFull: boolean;
}

interface ActivityCardProps {
  activity: ActivityWithNextDate;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleJoin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (activity.isFull) return;

    setIsJoining(true);
    try {
      const response = await fetch(`/api/activities/${activity.id}/join`, {
        method: "POST",
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to join activity");
      }
    } catch (error) {
      console.error("Error joining activity:", error);
      alert("Something went wrong");
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Are you sure you want to leave this activity?")) {
      return;
    }

    setIsLeaving(true);
    try {
      const response = await fetch(`/api/activities/${activity.id}/leave`, {
        method: "POST",
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to leave activity");
      }
    } catch (error) {
      console.error("Error leaving activity:", error);
      alert("Something went wrong");
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border group">
      <Link href={`/activities/${activity.id}`} className="block p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
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
            {activity.isJoined && (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                Joined
              </span>
            )}
            {activity.isOrganizer && (
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded">
                Organizing
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

        <div className="space-y-2 text-sm text-gray-500 mb-4">
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
            <span
              className={
                activity.isFull ? "text-red-600 font-medium" : ""
              }
            >
              {activity.participantCount}/{activity.maxParticipants} participants
              {activity.isFull && " (Full)"}
            </span>
          </div>
        </div>
      </Link>

      {/* Action button - only show if not organizer */}
      {!activity.isOrganizer && (
        <div className="px-6 pb-6">
          {activity.isJoined ? (
            <button
              onClick={handleLeave}
              disabled={isLeaving}
              className="w-full bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLeaving ? "Leaving..." : "Leave Activity"}
            </button>
          ) : (
            <button
              onClick={handleJoin}
              disabled={isJoining || activity.isFull}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isJoining
                ? "Joining..."
                : activity.isFull
                ? "Activity Full"
                : "Join Activity"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
