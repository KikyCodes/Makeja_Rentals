export type UserRole = "tenant" | "landlord" | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: UserRole;
  is_verified: boolean;
  created_at: string;
}

export type PropertyType =
  | "hostel"
  | "bedsitter"
  | "one_bedroom"
  | "two_bedroom"
  | "studio"
  | "shared_room";

export type FurnishingStatus = "furnished" | "semi_furnished" | "unfurnished";
export type GenderPreference = "any" | "male" | "female";
export type SortOption = "newest" | "price_asc" | "price_desc" | "popular" | "distance";

export interface Property {
  id: string;
  landlord_id: string;
  title: string;
  description: string;
  type: PropertyType;
  price: number;
  price_period: "per_month" | "per_week";
  location: string;
  area: string;
  latitude: number | null;
  longitude: number | null;
  bedrooms: number;
  bathrooms: number;
  max_occupants: number;
  furnishing: FurnishingStatus;
  amenities: string[];
  rules: string[];
  is_available: boolean;
  is_verified: boolean;
  is_featured: boolean;
  views_count: number;
  distance_from_campus: number | null;  // in km
  gender_preference: GenderPreference;
  // Landlord contact — stored directly on the property for per-listing customisation
  landlord_name?: string | null;
  landlord_phone?: string | null;
  landlord_whatsapp?: string | null;
  created_at: string;
  updated_at: string;
  landlord?: Profile;
  images?: PropertyImage[];
  is_favorited?: boolean;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
  property?: Property;
}

export interface RoommatePost {
  id: string;
  user_id: string;
  title: string;
  description: string;
  area: string;
  budget_min: number;
  budget_max: number;
  move_in_date: string;
  gender_preference: GenderPreference;
  lifestyle_tags: string[];
  is_active: boolean;
  created_at: string;
  user?: Profile;
  // Extended lifestyle fields
  age?: number | null;
  gender?: "male" | "female" | "other" | null;
  occupation?: string | null;
  university?: string | null;
  smoking_pref?: "yes" | "no" | "occasionally" | "outside_only";
  drinking_pref?: "yes" | "no" | "occasionally";
  pets_pref?: "yes" | "no" | "small_pets";
  cleanliness?: "very_clean" | "clean" | "moderate" | "relaxed";
  sleep_schedule?: "early_bird" | "night_owl" | "flexible";
  profile_photo_url?: string | null;
  views_count?: number;
  messages_count?: number;
  compatibility_score?: number; // computed, not stored
}

export interface RoommateMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  post_id: string | null;
  content: string;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  property_id: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
}

export interface Review {
  id: string;
  reviewer_id: string;
  property_id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer?: Profile;
}

export interface SearchFilters {
  query?: string;
  type?: PropertyType | "";
  min_price?: number;
  max_price?: number;
  area?: string;
  bedrooms?: number;
  furnishing?: FurnishingStatus | "";
  amenities?: string[];
  gender_preference?: GenderPreference | "";
  max_distance?: number;   // km from campus
  is_available?: boolean;
  sort_by?: SortOption;
  page?: number;
  per_page?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ─── Dashboard / Landlord types ───────────────────────────────────────────────

export type InquiryStatus = "new" | "replied" | "closed";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Inquiry {
  id: string;
  property_id: string;
  tenant_id: string;
  landlord_id: string;
  subject: string;
  message: string;
  status: InquiryStatus;
  created_at: string;
  replied_at: string | null;
  property?: Property;
  tenant?: Profile;
}

export interface Booking {
  id: string;
  property_id: string;
  tenant_id: string;
  landlord_id: string;
  requested_date: string;        // ISO date for viewing
  requested_time: string;        // e.g. "10:00 AM"
  status: BookingStatus;
  note: string | null;
  landlord_note: string | null;
  created_at: string;
  updated_at: string;
  property?: Property;
  tenant?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: "inquiry" | "booking" | "review" | "verification" | "system";
  title: string;
  body: string;
  href: string | null;
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_listings: number;
  active_listings: number;
  total_views: number;
  views_this_week: number;
  total_inquiries: number;
  new_inquiries: number;
  total_bookings: number;
  pending_bookings: number;
  saves_count: number;
  avg_rating: number | null;
  weekly_views: { day: string; views: number }[];
  top_properties: { id: string; title: string; views: number; saves: number }[];
}

export interface PropertyAnalytics {
  property_id: string;
  views_by_day: { date: string; views: number }[];
  saves_count: number;
  inquiries_count: number;
  bookings_count: number;
  avg_response_time_hours: number | null;
}

// ─── Admin types ──────────────────────────────────────────────────────────────

export type AdminUserStatus = "active" | "suspended" | "banned";
export type PropertyApprovalStatus = "pending" | "approved" | "rejected" | "flagged";
export type VerificationStatus = "pending" | "approved" | "rejected";
export type ReportStatus = "open" | "investigating" | "resolved" | "dismissed";
export type FraudSeverity = "low" | "medium" | "high" | "critical";
export type ContentType = "property" | "review" | "message" | "profile";

export interface AdminStats {
  total_users: number;
  new_users_today: number;
  new_users_week: number;
  total_landlords: number;
  total_tenants: number;
  total_properties: number;
  pending_approvals: number;
  pending_verifications: number;
  total_revenue: number;
  revenue_this_month: number;
  open_reports: number;
  fraud_alerts: number;
  monthly_signups: { month: string; tenants: number; landlords: number }[];
  daily_revenue: { date: string; amount: number }[];
  property_types: { type: string; count: number }[];
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: UserRole;
  status: AdminUserStatus;
  is_verified: boolean;
  listings_count: number;
  bookings_count: number;
  last_sign_in: string | null;
  created_at: string;
  flags: number;
}

export interface PropertyApprovalItem {
  id: string;
  property_id: string;
  landlord_id: string;
  status: PropertyApprovalStatus;
  reviewer_id: string | null;
  reviewer_note: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  property: Property;
  landlord: Profile;
}

export interface VerificationRequest {
  id: string;
  user_id: string;
  property_id: string | null;
  type: "landlord" | "student" | "property";
  status: VerificationStatus;
  documents: { name: string; url: string }[];
  notes: string | null;
  reviewer_id: string | null;
  reviewer_note: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  user: Profile;
  property?: Property;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_id: string;
  target_type: ContentType;
  reason: string;
  description: string;
  status: ReportStatus;
  moderator_id: string | null;
  moderator_note: string | null;
  created_at: string;
  resolved_at: string | null;
  reporter: Profile;
}

export interface FraudAlert {
  id: string;
  user_id: string;
  property_id: string | null;
  type: "duplicate_listing" | "fake_images" | "price_manipulation" | "identity_fraud" | "spam";
  severity: FraudSeverity;
  description: string;
  evidence: string[];
  is_resolved: boolean;
  created_at: string;
  user: Profile;
  property?: Property;
}

export interface RevenueRecord {
  id: string;
  user_id: string;
  type: "subscription" | "feature_boost" | "verification_fee" | "commission";
  amount: number;
  currency: string;
  status: "pending" | "completed" | "refunded";
  description: string;
  created_at: string;
  user: Profile;
}

export interface ContentModerationItem {
  id: string;
  content_type: ContentType;
  content_id: string;
  content_preview: string;
  reason: string;
  status: "pending" | "approved" | "removed";
  created_at: string;
  author?: Profile;
}
