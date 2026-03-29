import type { AuthRole } from "@/types/auth";

export interface RoleAuthConfig {
  role: AuthRole;
  basePath: string;
  welcomePath: string;
  heroLines: string[];
  heroDescription: string;
  heroAccentLineIndex?: number;
  signupSubtitle: string;
  loginTitle: string;
  loginSubtitle: string;
  forgotSubtitle: string;
  verifySubtitle: string;
}

export const roleAuthConfigs = {
  venueProvider: {
    role: "venue_provider",
    basePath: "/venueprovider/auth",
    welcomePath: "/venueprovider/auth/welcomevenueprovider",
    heroLines: ["Your Event Starts Here"],
    heroDescription:
      "List your venue, reach more customers, and grow your bookings.",
    signupSubtitle:
      "Create your venue provider account and start accepting bookings.",
    loginTitle: "Login to Your Account",
    loginSubtitle:
      "Sign in to manage venue listings, booking requests, and payments.",
    forgotSubtitle:
      "Enter your email address to receive a verification OTP.",
    verifySubtitle:
      "Enter the 6-digit OTP we sent to complete your registration.",
  },
  eventPlanner: {
    role: "event_planner",
    basePath: "/eventPlanner/auth",
    welcomePath: "/eventPlanner/auth/welcomeserviceprovider",
    heroLines: ["Turn Your Planning Into", "Bookings"],
    heroAccentLineIndex: 1,
    heroDescription:
      "Connect with clients, manage events, and grow your planning business.",
    signupSubtitle:
      "Create your event planner account and start managing client events.",
    loginTitle: "Login to Your Account",
    loginSubtitle:
      "Sign in to manage planning requests, clients, and upcoming events.",
    forgotSubtitle:
      "Enter your email address to receive a verification OTP.",
    verifySubtitle:
      "Enter the 6-digit OTP we sent to complete your registration.",
  },
  serviceProvider: {
    role: "service_provider",
    basePath: "/serviceprovider/auth",
    welcomePath: "/serviceprovider/auth/welcomeserviceprovider",
    heroLines: ["Turn Your Service Into", "Bookings"],
    heroAccentLineIndex: 1,
    heroDescription: "Get more clients. Manage jobs. Grow your business.",
    signupSubtitle:
      "Join our service provider community and start growing your business.",
    loginTitle: "Login to Your Account",
    loginSubtitle:
      "Sign in to manage services, client requests, and your bookings.",
    forgotSubtitle:
      "Enter your email address to receive a verification OTP.",
    verifySubtitle:
      "Enter the 6-digit OTP we sent to complete your registration.",
  },
} satisfies Record<string, RoleAuthConfig>;
