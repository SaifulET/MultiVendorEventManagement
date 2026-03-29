import RoleSigninPage from "@/app/component/auth/RoleSigninPage";
import { roleAuthConfigs } from "@/app/component/auth/role-auth-config";

export default function ServiceProviderSigninPage() {
  return <RoleSigninPage config={roleAuthConfigs.serviceProvider} />;
}
