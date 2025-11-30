import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { CreateActivityForm } from "./CreateActivityForm";

export default async function CreateActivityPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Create New Activity
        </h1>
        <CreateActivityForm />
      </div>
    </div>
  );
}
