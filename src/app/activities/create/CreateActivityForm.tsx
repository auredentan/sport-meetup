"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { GoogleMapsLoader } from "@/components/GoogleMapsLoader";

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

const SKILL_LEVELS = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const RECURRENCE_TYPES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "monthly", label: "Monthly" },
];

export function CreateActivityForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [locationData, setLocationData] = useState<{
    address: string;
    lat: number;
    lng: number;
  } | null>(null);

  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      sportType: formData.get("sportType"),
      location: locationData?.address || "",
      latitude: locationData?.lat || null,
      longitude: locationData?.lng || null,
      date: formData.get("date"),
      maxParticipants: formData.get("maxParticipants"),
      skillLevel: formData.get("skillLevel"),
      isRecurring,
      recurrenceType: isRecurring ? formData.get("recurrenceType") : null,
      recurrenceEndDate: isRecurring ? formData.get("recurrenceEndDate") : null,
    };

    try {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to create activity");
      }

      const result = await response.json();
      router.push(`/activities/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      )}

      <div className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Activity Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            placeholder="e.g., Morning Run in Central Park"
            className="w-full rounded-lg border-gray-300 border px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            placeholder="Describe your activity, what to expect, what to bring..."
            className="w-full rounded-lg border-gray-300 border px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="sportType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Sport Type *
            </label>
            <select
              id="sportType"
              name="sportType"
              required
              className="w-full rounded-lg border-gray-300 border px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a sport</option>
              {SPORT_TYPES.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="skillLevel"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Skill Level *
            </label>
            <select
              id="skillLevel"
              name="skillLevel"
              required
              className="w-full rounded-lg border-gray-300 border px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select skill level</option>
              {SKILL_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Location *
          </label>
          <GoogleMapsLoader apiKey={GOOGLE_MAPS_API_KEY}>
            <LocationAutocomplete
              value={locationData?.address || ""}
              onChange={setLocationData}
              placeholder="e.g., Central Park, New York"
              required
              apiKey={GOOGLE_MAPS_API_KEY}
            />
          </GoogleMapsLoader>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date & Time *
            </label>
            <input
              type="datetime-local"
              id="date"
              name="date"
              required
              className="w-full rounded-lg border-gray-300 border px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="maxParticipants"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Max Participants *
            </label>
            <input
              type="number"
              id="maxParticipants"
              name="maxParticipants"
              required
              min="2"
              max="100"
              placeholder="e.g., 10"
              className="w-full rounded-lg border-gray-300 border px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Recurring Activity Section */}
        <div className="border-t pt-6">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="isRecurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isRecurring"
              className="ml-2 block text-sm font-medium text-gray-700"
            >
              Make this a recurring activity
            </label>
          </div>

          {isRecurring && (
            <div className="grid md:grid-cols-2 gap-6 pl-6 border-l-2 border-blue-200">
              <div>
                <label
                  htmlFor="recurrenceType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Repeat *
                </label>
                <select
                  id="recurrenceType"
                  name="recurrenceType"
                  required={isRecurring}
                  className="w-full rounded-lg border-gray-300 border px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select frequency</option>
                  {RECURRENCE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="recurrenceEndDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  End Date *
                </label>
                <input
                  type="date"
                  id="recurrenceEndDate"
                  name="recurrenceEndDate"
                  required={isRecurring}
                  className="w-full rounded-lg border-gray-300 border px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">
                  Recurring activities will automatically generate new instances based on the selected frequency until the end date.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Create Activity"}
        </button>
      </div>
    </form>
  );
}
