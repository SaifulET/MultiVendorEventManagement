import { Suspense } from "react";

import VerifyEmailClient from "@/app/home/auth/verify-email/verify-email-client";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailClient />
    </Suspense>
  );
}
