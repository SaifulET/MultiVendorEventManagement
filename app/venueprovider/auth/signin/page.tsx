import RoleSigninPage from "@/app/component/auth/RoleSigninPage";
import { roleAuthConfigs } from "@/app/component/auth/role-auth-config";

export default function VenueProviderSigninPage() {
  return <RoleSigninPage config={roleAuthConfigs.venueProvider} />;
}
