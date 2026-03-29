import { Suspense } from "react";

import RoleVerifyEmailClient from "@/app/component/auth/RoleVerifyEmailClient";
import { roleAuthConfigs } from "@/app/component/auth/role-auth-config";

export default function ServiceProviderVerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <RoleVerifyEmailClient config={roleAuthConfigs.serviceProvider} />
    </Suspense>
  );
}
