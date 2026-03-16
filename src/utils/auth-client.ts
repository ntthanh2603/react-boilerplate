import { createAuthClient } from "better-auth/react";
import {
  jwtClient,
  twoFactorClient,
  multiSessionClient,
  inferAdditionalFields,
  emailOTPClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || window.location.origin,
  plugins: [
    jwtClient(),
    twoFactorClient(),
    multiSessionClient(),
    emailOTPClient(),
    inferAdditionalFields({
      user: {
        role: { type: "string", required: false },
        twoFactorEnabled: { type: "boolean", required: false },
      },
    }),
  ],
});

export const { useSession } = authClient;
