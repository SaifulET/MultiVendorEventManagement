import RoleSignupPage from "@/app/component/auth/RoleSignupPage";
import { roleAuthConfigs } from "@/app/component/auth/role-auth-config";

export default function EventPlannerSignupPage() {
  return <RoleSignupPage config={roleAuthConfigs.eventPlanner} />;
}
