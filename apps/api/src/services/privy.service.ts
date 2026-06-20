import { PrivyClient } from "@privy-io/node";
import type { User as PrivyUser } from "@privy-io/node";
import type { ApiEnv } from "../config/env.js";

export interface PrivyProfile {
  privyDid: string;
  email: string;
  firstName: string;
  lastName: string;
}

export class PrivyService {
  private readonly client: PrivyClient;

  constructor(env: ApiEnv) {
    this.client = new PrivyClient({
      appId: env.PRIVY_APP_ID,
      appSecret: env.PRIVY_APP_SECRET,
    });
  }

  async verifyAccessToken(accessToken: string): Promise<{ userId: string }> {
    const claims = await this.client.utils().auth().verifyAccessToken(accessToken);
    return { userId: claims.user_id };
  }

  async fetchUserProfile(privyDid: string): Promise<PrivyProfile> {
    const privyUser = await this.client.users()._get(privyDid);
    return this.toProfile(privyUser);
  }

  toProfile(privyUser: PrivyUser): PrivyProfile {
    const emailAccount = privyUser.linked_accounts?.find(
      (account) => account.type === "email" && "address" in account,
    ) as { address?: string } | undefined;
    const email = emailAccount?.address?.toLowerCase();
    if (!email) {
      throw new Error("PRIVY_EMAIL_REQUIRED");
    }

    const name = this.resolveName(privyUser, email);
    return {
      privyDid: privyUser.id,
      email,
      firstName: name.firstName,
      lastName: name.lastName,
    };
  }

  private resolveName(privyUser: PrivyUser, email: string): { firstName: string; lastName: string } {
    const google = privyUser.linked_accounts?.find(
      (account) => account.type === "google_oauth" && "name" in account,
    ) as { name?: string } | undefined;
    if (google?.name) {
      const parts = google.name.trim().split(/\s+/);
      return {
        firstName: parts[0] ?? "Member",
        lastName: parts.slice(1).join(" ") || "",
      };
    }

    const localPart = email.split("@")[0] ?? "member";
    const parts = localPart.replace(/[._-]+/g, " ").trim().split(/\s+/);
    return {
      firstName: parts[0] ? parts[0][0]!.toUpperCase() + parts[0].slice(1) : "Member",
      lastName: parts.slice(1).join(" ") || "",
    };
  }
}
