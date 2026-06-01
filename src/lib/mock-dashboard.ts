import type { Inquiry, Booking, Notification, DashboardStats } from "@/types";

const now = new Date();
const d = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86400000).toISOString();

export const MOCK_STATS: DashboardStats = {
  total_listings: 4,
  active_listings: 3,
  total_views: 1_284,
  views_this_week: 247,
  total_inquiries: 38,
  new_inquiries: 5,
  total_bookings: 12,
  pending_bookings: 3,
  saves_count: 89,
  avg_rating: 4.6,
  weekly_views: [
    { day: "Mon", views: 28 },
    { day: "Tue", views: 45 },
    { day: "Wed", views: 38 },
    { day: "Thu", views: 62 },
    { day: "Fri", views: 55 },
    { day: "Sat", views: 71 },
    { day: "Sun", views: 41 },
  ],
  top_properties: [
    { id: "1", title: "Modern Bedsitter Near University", views: 487, saves: 34 },
    { id: "3", title: "Spacious 1-Bedroom Apartment",    views: 312, saves: 27 },
    { id: "2", title: "Cosy Hostel Room — All Inclusive",views: 289, saves: 18 },
    { id: "6", title: "2-Bedroom Family Apartment",       views: 196, saves: 10 },
  ],
};

export const MOCK_INQUIRIES: Inquiry[] = [
  {
    id: "inq1", property_id: "1", tenant_id: "t1", landlord_id: "l1",
    subject: "Is the bedsitter still available?",
    message: "Hi, I am a second-year student at MKU and I'm very interested in the bedsitter. Is it still available for January intake? I would also like to know if water and electricity are included in the price.",
    status: "new", created_at: d(0.5), replied_at: null,
    tenant: { id: "t1", email: "alice@mku.ac.ke", full_name: "Alice Wanjiku", avatar_url: null, phone: "0712345678", role: "tenant", is_verified: true, created_at: d(90) },
    property: { id: "1", landlord_id: "l1", title: "Modern Bedsitter Near University", description: "", type: "bedsitter", price: 5500, price_period: "per_month", location: "Gate B Road", area: "Machakos Town", latitude: -1.5177, longitude: 37.2634, bedrooms: 0, bathrooms: 1, max_occupants: 2, furnishing: "semi_furnished", amenities: [], rules: [], is_available: true, is_verified: true, is_featured: true, views_count: 487, distance_from_campus: 0.3, gender_preference: "any", created_at: d(60), updated_at: d(1), images: [] },
  },
  {
    id: "inq2", property_id: "1", tenant_id: "t2", landlord_id: "l1",
    subject: "Viewing request for this weekend",
    message: "Good afternoon. My name is Brian and I would like to schedule a viewing for Saturday morning if possible. Please let me know what time works for you.",
    status: "replied", created_at: d(1), replied_at: d(0.8),
    tenant: { id: "t2", email: "brian@gmail.com", full_name: "Brian Mutua", avatar_url: null, phone: "0723456789", role: "tenant", is_verified: false, created_at: d(30) },
    property: { id: "1", landlord_id: "l1", title: "Modern Bedsitter Near University", description: "", type: "bedsitter", price: 5500, price_period: "per_month", location: "Gate B Road", area: "Machakos Town", latitude: -1.5177, longitude: 37.2634, bedrooms: 0, bathrooms: 1, max_occupants: 2, furnishing: "semi_furnished", amenities: [], rules: [], is_available: true, is_verified: true, is_featured: true, views_count: 487, distance_from_campus: 0.3, gender_preference: "any", created_at: d(60), updated_at: d(1), images: [] },
  },
  {
    id: "inq3", property_id: "3", tenant_id: "t3", landlord_id: "l1",
    subject: "Deposit and move-in terms",
    message: "Hi there! I'm interested in the 1-bedroom apartment. Can you tell me how many months deposit is required and what the move-in process looks like? Also, does the parking include a covered space?",
    status: "new", created_at: d(2), replied_at: null,
    tenant: { id: "t3", email: "carol@yahoo.com", full_name: "Carol Ndunge", avatar_url: null, phone: "0734567890", role: "tenant", is_verified: true, created_at: d(45) },
    property: { id: "3", landlord_id: "l1", title: "Spacious 1-Bedroom Apartment", description: "", type: "one_bedroom", price: 12000, price_period: "per_month", location: "Stadium Road", area: "Machakos Town", latitude: -1.515, longitude: 37.26, bedrooms: 1, bathrooms: 1, max_occupants: 2, furnishing: "semi_furnished", amenities: [], rules: [], is_available: true, is_verified: false, is_featured: true, views_count: 312, distance_from_campus: 1.2, gender_preference: "any", created_at: d(50), updated_at: d(3), images: [] },
  },
  {
    id: "inq4", property_id: "2", tenant_id: "t4", landlord_id: "l1",
    subject: "Is WiFi really unlimited?",
    message: "Hello, I saw the listing for the hostel and the WiFi caught my eye. Is it truly unlimited or is there a daily/monthly cap? I need reliable internet for my online classes.",
    status: "closed", created_at: d(5), replied_at: d(4),
    tenant: { id: "t4", email: "david@gmail.com", full_name: "David Kioko", avatar_url: null, phone: "0745678901", role: "tenant", is_verified: false, created_at: d(20) },
    property: { id: "2", landlord_id: "l1", title: "Cosy Hostel Room — All Inclusive", description: "", type: "hostel", price: 3500, price_period: "per_month", location: "Kenyatta Avenue", area: "Machakos Town", latitude: -1.52, longitude: 37.27, bedrooms: 0, bathrooms: 1, max_occupants: 4, furnishing: "furnished", amenities: [], rules: [], is_available: true, is_verified: true, is_featured: true, views_count: 289, distance_from_campus: 0.5, gender_preference: "any", created_at: d(55), updated_at: d(2), images: [] },
  },
  {
    id: "inq5", property_id: "3", tenant_id: "t5", landlord_id: "l1",
    subject: "Can a couple rent together?",
    message: "Hi, my partner and I are looking for a comfortable 1-bedroom. Does your apartment allow couples? We are both employed and can provide references.",
    status: "new", created_at: d(3), replied_at: null,
    tenant: { id: "t5", email: "eve@outlook.com", full_name: "Eve Mwangi", avatar_url: null, phone: "0756789012", role: "tenant", is_verified: true, created_at: d(15) },
    property: { id: "3", landlord_id: "l1", title: "Spacious 1-Bedroom Apartment", description: "", type: "one_bedroom", price: 12000, price_period: "per_month", location: "Stadium Road", area: "Machakos Town", latitude: -1.515, longitude: 37.26, bedrooms: 1, bathrooms: 1, max_occupants: 2, furnishing: "semi_furnished", amenities: [], rules: [], is_available: true, is_verified: false, is_featured: true, views_count: 312, distance_from_campus: 1.2, gender_preference: "any", created_at: d(50), updated_at: d(3), images: [] },
  },
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "bk1", property_id: "1", tenant_id: "t2", landlord_id: "l1",
    requested_date: new Date(now.getTime() + 2 * 86400000).toISOString().split("T")[0],
    requested_time: "10:00 AM", status: "pending",
    note: "I'll come with my parents. We'd like a 15-minute walkthrough.",
    landlord_note: null, created_at: d(1), updated_at: d(1),
    tenant: { id: "t2", email: "brian@gmail.com", full_name: "Brian Mutua", avatar_url: null, phone: "0723456789", role: "tenant", is_verified: false, created_at: d(30) },
    property: { id: "1", landlord_id: "l1", title: "Modern Bedsitter Near University", description: "", type: "bedsitter", price: 5500, price_period: "per_month", location: "Gate B Road", area: "Machakos Town", latitude: -1.5177, longitude: 37.2634, bedrooms: 0, bathrooms: 1, max_occupants: 2, furnishing: "semi_furnished", amenities: [], rules: [], is_available: true, is_verified: true, is_featured: true, views_count: 487, distance_from_campus: 0.3, gender_preference: "any", created_at: d(60), updated_at: d(1), images: [] },
  },
  {
    id: "bk2", property_id: "3", tenant_id: "t3", landlord_id: "l1",
    requested_date: new Date(now.getTime() + 4 * 86400000).toISOString().split("T")[0],
    requested_time: "2:30 PM", status: "confirmed",
    note: "Looking to move in next month.", landlord_note: "Confirmed. I'll be there at 2:30.",
    created_at: d(3), updated_at: d(2),
    tenant: { id: "t3", email: "carol@yahoo.com", full_name: "Carol Ndunge", avatar_url: null, phone: "0734567890", role: "tenant", is_verified: true, created_at: d(45) },
    property: { id: "3", landlord_id: "l1", title: "Spacious 1-Bedroom Apartment", description: "", type: "one_bedroom", price: 12000, price_period: "per_month", location: "Stadium Road", area: "Machakos Town", latitude: -1.515, longitude: 37.26, bedrooms: 1, bathrooms: 1, max_occupants: 2, furnishing: "semi_furnished", amenities: [], rules: [], is_available: true, is_verified: false, is_featured: true, views_count: 312, distance_from_campus: 1.2, gender_preference: "any", created_at: d(50), updated_at: d(3), images: [] },
  },
  {
    id: "bk3", property_id: "1", tenant_id: "t5", landlord_id: "l1",
    requested_date: new Date(now.getTime() + 7 * 86400000).toISOString().split("T")[0],
    requested_time: "11:00 AM", status: "pending",
    note: null, landlord_note: null, created_at: d(0.5), updated_at: d(0.5),
    tenant: { id: "t5", email: "eve@outlook.com", full_name: "Eve Mwangi", avatar_url: null, phone: "0756789012", role: "tenant", is_verified: true, created_at: d(15) },
    property: { id: "1", landlord_id: "l1", title: "Modern Bedsitter Near University", description: "", type: "bedsitter", price: 5500, price_period: "per_month", location: "Gate B Road", area: "Machakos Town", latitude: -1.5177, longitude: 37.2634, bedrooms: 0, bathrooms: 1, max_occupants: 2, furnishing: "semi_furnished", amenities: [], rules: [], is_available: true, is_verified: true, is_featured: true, views_count: 487, distance_from_campus: 0.3, gender_preference: "any", created_at: d(60), updated_at: d(1), images: [] },
  },
  {
    id: "bk4", property_id: "2", tenant_id: "t4", landlord_id: "l1",
    requested_date: d(3).split("T")[0], requested_time: "9:00 AM", status: "completed",
    note: "Quick look around.", landlord_note: "Great visit, tenant very interested.",
    created_at: d(7), updated_at: d(3),
    tenant: { id: "t4", email: "david@gmail.com", full_name: "David Kioko", avatar_url: null, phone: "0745678901", role: "tenant", is_verified: false, created_at: d(20) },
    property: { id: "2", landlord_id: "l1", title: "Cosy Hostel Room — All Inclusive", description: "", type: "hostel", price: 3500, price_period: "per_month", location: "Kenyatta Avenue", area: "Machakos Town", latitude: -1.52, longitude: 37.27, bedrooms: 0, bathrooms: 1, max_occupants: 4, furnishing: "furnished", amenities: [], rules: [], is_available: true, is_verified: true, is_featured: true, views_count: 289, distance_from_campus: 0.5, gender_preference: "any", created_at: d(55), updated_at: d(2), images: [] },
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "n1", user_id: "l1", type: "inquiry",      title: "New inquiry",           body: "Alice Wanjiku asked about your bedsitter",         href: "/dashboard/inquiries", is_read: false, created_at: d(0.5) },
  { id: "n2", user_id: "l1", type: "booking",      title: "Viewing requested",     body: "Eve Mwangi wants to view the bedsitter",           href: "/dashboard/bookings",  is_read: false, created_at: d(0.5) },
  { id: "n3", user_id: "l1", type: "inquiry",      title: "New inquiry",           body: "Carol Ndunge asked about deposit terms",           href: "/dashboard/inquiries", is_read: false, created_at: d(2)   },
  { id: "n4", user_id: "l1", type: "verification", title: "Verification update",   body: "Your bedsitter has been verified ✓",               href: "/dashboard/listings",  is_read: true,  created_at: d(5)   },
  { id: "n5", user_id: "l1", type: "review",       title: "New review (4★)",       body: "A tenant left a review on your 1-bedroom",        href: "/dashboard/analytics", is_read: true,  created_at: d(7)   },
];

export const MOCK_MESSAGES: { id: string; inquiry_id: string; sender_id: string; content: string; created_at: string; is_landlord: boolean }[] = [
  { id: "m1", inquiry_id: "inq2", sender_id: "t2",  content: "Good afternoon. My name is Brian and I would like to schedule a viewing for Saturday morning if possible. Please let me know what time works for you.", created_at: d(1),   is_landlord: false },
  { id: "m2", inquiry_id: "inq2", sender_id: "l1",  content: "Hi Brian! Saturday works great. How about 10 AM? The property is at Gate B Road, just 300m from the university main gate. I'll meet you at the entrance.", created_at: d(0.9), is_landlord: true  },
  { id: "m3", inquiry_id: "inq2", sender_id: "t2",  content: "That's perfect! I'll be there at 10 AM. Looking forward to it.",                                                                               created_at: d(0.8), is_landlord: false },
  { id: "m4", inquiry_id: "inq4", sender_id: "t4",  content: "Hello, I saw the listing for the hostel and the WiFi caught my eye. Is it truly unlimited or is there a daily/monthly cap?",                 created_at: d(5),   is_landlord: false },
  { id: "m5", inquiry_id: "inq4", sender_id: "l1",  content: "Hi David! Yes, the WiFi is completely unlimited — no caps. We use a dedicated 20Mbps fibre line shared among residents. Great for streaming and classes!",  created_at: d(4.5), is_landlord: true  },
  { id: "m6", inquiry_id: "inq4", sender_id: "t4",  content: "That's exactly what I needed to hear. Thank you! I'll come by for a viewing this week.",                                                     created_at: d(4),   is_landlord: false },
];
