import RoleSignupPage from "@/app/component/auth/RoleSignupPage";
import { roleAuthConfigs } from "@/app/component/auth/role-auth-config";

export default function ServiceProviderSignupPage() {
  return <RoleSignupPage config={roleAuthConfigs.serviceProvider} />;
}
