import { NextResponse } from "next/server";
import { getAuthorizationUrl } from "@/lib/workos";

export async function GET() {
  const authorizationUrl = getAuthorizationUrl();
  return NextResponse.redirect(authorizationUrl);
}
