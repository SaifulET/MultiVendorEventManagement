import RoleSignupPage from "@/app/component/auth/RoleSignupPage";
import { roleAuthConfigs } from "@/app/component/auth/role-auth-config";

export default function VenueProviderSignupPage() {
  return <RoleSignupPage config={roleAuthConfigs.venueProvider} />;
}
