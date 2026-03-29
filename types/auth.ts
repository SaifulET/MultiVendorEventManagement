export type AuthRole =
  | "customer"
  | "venue_provider"
  | "event_planner"
  | "service_provider";

export interface AuthPayment {
  amount: number;
  currency: string;
  billingCycle: string;
  status: string;
  paidAt: string;
}

export interface AuthSubscription {
  plan: string;
  status: string;
  activatedAt: string;
  payment: AuthPayment;
}

export interface AuthOnboarding {
  stripeAccountId?: string;
  submittedAt?: string;
  [key: string]: unknown;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  serviceCategories: string[];
  isEmailVerified: boolean;
  subscription: AuthSubscription;
  onboarding: AuthOnboarding;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role: AuthRole;
}

export interface RegisterResponseData {
  onboarding: AuthOnboarding;
  user: AuthUser;
}

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export interface AuthSuccessData {
  token: string;
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ServiceProviderVerificationPayload {
  businessType: string;
  companyName: string;
  nationalIdOrTradeLicenseFiles: string[];
}

export interface ServiceProviderProfileInfoPayload {
  serviceName: string;
  serviceCategory: string;
  serviceDescription: string;
  coverageArea: string[];
  verification: ServiceProviderVerificationPayload;
}

export interface ServiceProviderOnboardingPayload {
  _id: string;
  name: string;
  email: string;
  stripeAccountId: string;
  profileInfo: ServiceProviderProfileInfoPayload;
  services: unknown[];
}

export interface EventPlannerVerificationPayload {
  businessType: string;
  companyName: string;
  nationalIdOrTradeLicenseFiles: string[];
}

export interface EventPlannerProfileInfoDetailsPayload {
  name: string;
  description: string;
  coverageArea: string[];
  address: string;
  verification: EventPlannerVerificationPayload;
}

export interface EventPlannerOnboardingPayload {
  _id: string;
  fullName: string;
  email: string;
  stripeAccountId: string;
  profileInfo: EventPlannerProfileInfoDetailsPayload;
}

export interface VenueProviderOnboardingPayload {
  _id: string;
  fullName: string;
  email: string;
  stripeAccountId: string;
  businessName: string;
  businessType: string;
  legalBusinessName: string;
  registrationNo: string;
  businessMail: string;
  businessPhoneNo: string;
}

export interface UserOnlyResponseData {
  user: AuthUser;
}
