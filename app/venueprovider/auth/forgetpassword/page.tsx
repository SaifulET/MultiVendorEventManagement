import RoleForgotPasswordPage from "@/app/component/auth/RoleForgotPasswordPage";
import { roleAuthConfigs } from "@/app/component/auth/role-auth-config";

export default function VenueProviderForgotPasswordPage() {
  return <RoleForgotPasswordPage config={roleAuthConfigs.venueProvider} />;
}
