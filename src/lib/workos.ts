import { WorkOS } from "@workos-inc/node";

export const workos = new WorkOS(process.env.WORKOS_API_KEY!);

export function getAuthorizationUrl(state?: string) {
  return workos.userManagement.getAuthorizationUrl({
    provider: "authkit",
    redirectUri: process.env.WORKOS_REDIRECT_URI!,
    clientId: process.env.WORKOS_CLIENT_ID!,
    state,
  });
}
