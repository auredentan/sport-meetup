"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface JoinLeaveButtonProps {
  activityId: string;
  isParticipant: boolean;
  isFull: boolean;
}

export function JoinLeaveButton({
  activityId,
  isParticipant,
  isFull,
}: JoinLeaveButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    setLoading(true);
    try {
      const response = await fetch(`/api/activities/${activityId}/join`, {
        method: "POST",
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to join activity");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleLeave() {
    if (!confirm("Are you sure you want to leave this activity?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/activities/${activityId}/leave`, {
        method: "POST",
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to leave activity");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (isParticipant) {
    return (
      <button
        onClick={handleLeave}
        disabled={loading}
        className="w-full bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
      >
        {loading ? "Leaving..." : "Leave Activity"}
      </button>
    );
  }

  if (isFull) {
    return (
      <button
        disabled
        className="w-full bg-gray-300 text-gray-500 px-4 py-3 rounded-lg font-medium cursor-not-allowed"
      >
        Activity Full
      </button>
    );
  }

  return (
    <button
      onClick={handleJoin}
      disabled={loading}
      className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
    >
      {loading ? "Joining..." : "Join Activity"}
    </button>
  );
}
