import { NextRequest, NextResponse } from "next/server";
import { workos } from "@/lib/workos";
import { setSession } from "@/lib/session";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", request.url));
  }

  try {
    const { user: workosUser } =
      await workos.userManagement.authenticateWithCode({
        code,
        clientId: process.env.WORKOS_CLIENT_ID!,
      });

    // Check if user exists
    let user = await db.query.users.findFirst({
      where: eq(users.workosId, workosUser.id),
    });

    if (!user) {
      // Create new user
      const userId = crypto.randomUUID();
      await db.insert(users).values({
        id: userId,
        workosId: workosUser.id,
        email: workosUser.email,
        firstName: workosUser.firstName || null,
        lastName: workosUser.lastName || null,
        avatarUrl: workosUser.profilePictureUrl || null,
      });

      user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });
    }

    if (user) {
      await setSession(user.id);
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(
      new URL("/login?error=auth_failed", request.url)
    );
  }
}
