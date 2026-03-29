import { Suspense } from "react";

import RoleVerifyEmailClient from "@/app/component/auth/RoleVerifyEmailClient";
import { roleAuthConfigs } from "@/app/component/auth/role-auth-config";

export default function VenueProviderVerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <RoleVerifyEmailClient config={roleAuthConfigs.venueProvider} />
    </Suspense>
  );
}
