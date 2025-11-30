import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { activities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { EditActivityForm } from "./EditActivityForm";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getActivity(id: string) {
  const activity = await db.query.activities.findFirst({
    where: eq(activities.id, id),
  });

  return activity;
}

export default async function EditActivityPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const activity = await getActivity(id);

  if (!activity) {
    notFound();
  }

  // Only the organizer can edit
  if (activity.organizerId !== session.id) {
    redirect(`/activities/${id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href={`/activities/${id}`}
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
          Back to activity
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Activity</h1>
          <p className="mt-2 text-gray-600">
            Update the details of your activity. All participants will see the changes.
          </p>
        </div>

        <EditActivityForm activity={activity} />
      </div>
    </div>
  );
}
