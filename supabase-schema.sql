-- ============================================================================
--  MAKEJA RENTALS — PRODUCTION DATABASE SCHEMA
--  Engine  : PostgreSQL 15+ (Supabase)
--  Author  : Senior Backend Architect
--  Version : 2.0.0
-- ============================================================================
--
--  ┌─────────────────────────────────────────────────────────────────────┐
--  │  ENTITY RELATIONSHIP DIAGRAM (ERD)                                  │
--  │                                                                     │
--  │  auth.users (Supabase managed)                                      │
--  │       │ 1                                                           │
--  │       │ extends                                                     │
--  │       ▼ 1                                                           │
--  │   profiles ──────────────────────────────────────────────┐         │
--  │       │ 1                                                 │         │
--  │       │                                                   │         │
--  │   ┌───┼──────────────────────────────────┐               │         │
--  │   │   │                                  │               │         │
--  │   │   ▼ N                                ▼ N             │         │
--  │   │ properties ◄─── property_images    favorites         │         │
--  │   │   │ 1               (N:1)           (N:M via         │         │
--  │   │   │                                profiles)         │         │
--  │   │   ├──────────────────────────────┐                   │         │
--  │   │   │                              │                   │         │
--  │   │   ▼ N                            ▼ N                 │         │
--  │   │ inquiries ◄── messages(N)      reviews               │         │
--  │   │   │ 1          (thread)         (N:M)                │         │
--  │   │   │                                                   │         │
--  │   │   ▼ N                                                 │         │
--  │   │ bookings                                              │         │
--  │   │                                                       │         │
--  │   ▼ N                                                     │         │
--  │ verifications ◄──────────────────────────────────────────┘         │
--  │                                                                     │
--  │ notifications (user_id → profiles)                                  │
--  │ property_views (property_id → properties, user_id → profiles)       │
--  │ roommate_posts (user_id → profiles)                                 │
--  │ reports (reporter_id → profiles, target polymorphic)                │
--  │ admin_audit_log (admin_id → profiles)                               │
--  │ revenue_records (user_id → profiles)                                │
--  │ fraud_alerts (user_id → profiles, property_id → properties)         │
--  └─────────────────────────────────────────────────────────────────────┘
--
--  TABLE RELATIONSHIPS SUMMARY
--  ─────────────────────────────────────────────────────────────────────
--  profiles          1 ─── N   properties        (landlord owns listings)
--  profiles          1 ─── N   favorites          (tenant saves listings)
--  profiles          1 ─── N   reviews            (tenant leaves review)
--  profiles          1 ─── N   inquiries          (tenant asks landlord)
--  profiles          1 ─── N   bookings           (tenant books viewing)
--  profiles          1 ─── N   messages           (sender/receiver)
--  profiles          1 ─── 1   verifications      (one record per user)
--  profiles          1 ─── N   notifications      (per-user inbox)
--  profiles          1 ─── N   roommate_posts     (roommate finder board)
--  properties        1 ─── N   property_images    (gallery)
--  properties        1 ─── N   property_views     (analytics)
--  properties        1 ─── N   inquiries          (about this property)
--  properties        1 ─── N   bookings           (viewing appointments)
--  properties        1 ─── N   reviews            (tenant reviews)
--  inquiries         1 ─── N   messages           (threaded conversation)
-- ============================================================================

-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Trigram similarity (fuzzy search)
CREATE EXTENSION IF NOT EXISTS "btree_gin";      -- Composite GIN indexes
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- gen_random_uuid(), crypt()

-- ─── Custom Domains / Types ───────────────────────────────────────────────────
CREATE TYPE user_role            AS ENUM ('tenant', 'landlord', 'admin');
CREATE TYPE user_status          AS ENUM ('active', 'suspended', 'banned');
CREATE TYPE property_type        AS ENUM ('hostel', 'bedsitter', 'one_bedroom', 'two_bedroom', 'studio', 'shared_room');
CREATE TYPE furnishing_status    AS ENUM ('furnished', 'semi_furnished', 'unfurnished');
CREATE TYPE gender_pref          AS ENUM ('any', 'male', 'female');
CREATE TYPE price_period         AS ENUM ('per_month', 'per_week');
CREATE TYPE inquiry_status       AS ENUM ('new', 'replied', 'closed');
CREATE TYPE booking_status       AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE verification_type    AS ENUM ('student', 'landlord', 'property');
CREATE TYPE verification_status  AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE notification_type    AS ENUM ('inquiry', 'booking', 'review', 'verification', 'system', 'fraud');
CREATE TYPE report_status        AS ENUM ('open', 'investigating', 'resolved', 'dismissed');
CREATE TYPE report_target        AS ENUM ('property', 'review', 'message', 'profile');
CREATE TYPE fraud_type           AS ENUM ('duplicate_listing', 'fake_images', 'price_manipulation', 'identity_fraud', 'spam');
CREATE TYPE fraud_severity       AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE revenue_type         AS ENUM ('subscription', 'feature_boost', 'verification_fee', 'commission');
CREATE TYPE revenue_status       AS ENUM ('pending', 'completed', 'refunded');
CREATE TYPE admin_action_type    AS ENUM ('user_suspend', 'user_ban', 'user_activate', 'property_approve', 'property_reject', 'property_flag', 'verification_approve', 'verification_reject', 'report_resolve', 'report_dismiss', 'fraud_resolve', 'content_remove', 'content_approve');

-- ============================================================================
--  SECTION 1 — CORE USER TABLE
-- ============================================================================

CREATE TABLE profiles (
  -- Identity
  id              UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT        NOT NULL UNIQUE,
  full_name       TEXT,
  avatar_url      TEXT,
  phone           TEXT,
  bio             TEXT,

  -- Role & Status
  role            user_role   NOT NULL DEFAULT 'tenant',
  status          user_status NOT NULL DEFAULT 'active',

  -- Verification
  is_verified     BOOLEAN     NOT NULL DEFAULT FALSE,
  email_confirmed BOOLEAN     NOT NULL DEFAULT FALSE,

  -- Platform stats (denormalised for fast reads)
  listings_count  INTEGER     NOT NULL DEFAULT 0 CHECK (listings_count >= 0),
  reviews_count   INTEGER     NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
  avg_rating      DECIMAL(3,2)          CHECK (avg_rating BETWEEN 0 AND 5),

  -- Notification preferences (JSONB for flexibility)
  notification_prefs JSONB    NOT NULL DEFAULT '{
    "email_inquiries":  true,
    "email_bookings":   true,
    "email_reviews":    true,
    "email_system":     true,
    "push_inquiries":   false,
    "push_bookings":    false
  }'::jsonb,

  -- Timestamps
  last_sign_in_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'Extends auth.users. Single source of truth for all platform user data.';
COMMENT ON COLUMN profiles.status IS 'active=normal, suspended=temporary ban, banned=permanent';
COMMENT ON COLUMN profiles.avg_rating IS 'Denormalised from reviews for fast landlord cards. Recomputed by trigger.';

-- ============================================================================
--  SECTION 2 — PROPERTIES
-- ============================================================================

CREATE TABLE properties (
  id                    UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id           UUID            NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Core listing info
  title                 TEXT            NOT NULL CHECK (char_length(title) BETWEEN 10 AND 150),
  description           TEXT            NOT NULL CHECK (char_length(description) >= 30),
  type                  property_type   NOT NULL,
  price                 INTEGER         NOT NULL CHECK (price > 0),
  price_period          price_period    NOT NULL DEFAULT 'per_month',

  -- Location
  location              TEXT            NOT NULL,
  area                  TEXT            NOT NULL,
  latitude              DECIMAL(9,6),
  longitude             DECIMAL(9,6),
  distance_from_campus  DECIMAL(5,2)    CHECK (distance_from_campus >= 0),  -- km

  -- Property specs
  bedrooms              SMALLINT        NOT NULL DEFAULT 0 CHECK (bedrooms >= 0),
  bathrooms             SMALLINT        NOT NULL DEFAULT 1 CHECK (bathrooms >= 1),
  max_occupants         SMALLINT        NOT NULL DEFAULT 2 CHECK (max_occupants >= 1),
  furnishing            furnishing_status NOT NULL DEFAULT 'unfurnished',
  gender_preference     gender_pref     NOT NULL DEFAULT 'any',

  -- Feature arrays
  amenities             TEXT[]          NOT NULL DEFAULT '{}',
  rules                 TEXT[]          NOT NULL DEFAULT '{}',

  -- State flags
  is_available          BOOLEAN         NOT NULL DEFAULT TRUE,
  is_verified           BOOLEAN         NOT NULL DEFAULT FALSE,
  is_featured           BOOLEAN         NOT NULL DEFAULT FALSE,
  is_published          BOOLEAN         NOT NULL DEFAULT FALSE,  -- draft vs live
  approval_status       TEXT            NOT NULL DEFAULT 'pending'
                        CHECK (approval_status IN ('pending', 'approved', 'rejected', 'flagged')),

  -- Denormalised analytics (updated by triggers)
  views_count           INTEGER         NOT NULL DEFAULT 0 CHECK (views_count >= 0),
  saves_count           INTEGER         NOT NULL DEFAULT 0 CHECK (saves_count >= 0),
  inquiries_count       INTEGER         NOT NULL DEFAULT 0 CHECK (inquiries_count >= 0),
  bookings_count        INTEGER         NOT NULL DEFAULT 0 CHECK (bookings_count >= 0),
  avg_rating            DECIMAL(3,2)              CHECK (avg_rating BETWEEN 0 AND 5),
  reviews_count         INTEGER         NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),

  -- Full-text search vector (maintained by trigger)
  search_vector         TSVECTOR,

  -- Timestamps
  created_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  published_at          TIMESTAMPTZ,
  featured_until        TIMESTAMPTZ     -- NULL = not featured
);

COMMENT ON TABLE  properties IS 'Core property/listing table. Each row is one rentable unit.';
COMMENT ON COLUMN properties.is_published IS 'FALSE = saved as draft, not visible to tenants.';
COMMENT ON COLUMN properties.approval_status IS 'Admin approval gate. Only approved listings shown publicly.';
COMMENT ON COLUMN properties.search_vector IS 'GIN-indexed tsvector for full-text search. Updated by trigger.';

-- ============================================================================
--  SECTION 3 — PROPERTY IMAGES
-- ============================================================================

CREATE TABLE property_images (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID        NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url         TEXT        NOT NULL,
  storage_path TEXT,                   -- Supabase Storage path (bucket/filename)
  is_primary  BOOLEAN     NOT NULL DEFAULT FALSE,
  sort_order  SMALLINT    NOT NULL DEFAULT 0,
  width       SMALLINT,               -- px, stored at upload time
  height      SMALLINT,               -- px
  size_bytes  INTEGER,                -- file size for storage quota tracking
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE property_images IS 'One property → many images. is_primary=true is the cover image used in cards.';

-- Enforce exactly one primary image per property (partial unique index)
CREATE UNIQUE INDEX uidx_property_images_primary
  ON property_images(property_id) WHERE (is_primary = TRUE);

-- ============================================================================
--  SECTION 4 — FAVORITES / SAVES
-- ============================================================================

CREATE TABLE favorites (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID        NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_favorites UNIQUE (user_id, property_id)
);

COMMENT ON TABLE favorites IS 'Tenant saves/hearts a listing. Many-to-many bridge. Updates saves_count on properties via trigger.';

-- ============================================================================
--  SECTION 5 — REVIEWS
-- ============================================================================

CREATE TABLE reviews (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id  UUID        NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  landlord_id  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,  -- denorm for fast landlord-review queries

  -- Rating dimensions
  rating            SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  rating_cleanliness SMALLINT            CHECK (rating_cleanliness BETWEEN 1 AND 5),
  rating_value       SMALLINT            CHECK (rating_value BETWEEN 1 AND 5),
  rating_location    SMALLINT            CHECK (rating_location BETWEEN 1 AND 5),
  rating_landlord    SMALLINT            CHECK (rating_landlord BETWEEN 1 AND 5),

  -- Content
  comment      TEXT        NOT NULL CHECK (char_length(comment) BETWEEN 10 AND 2000),
  is_anonymous BOOLEAN     NOT NULL DEFAULT FALSE,

  -- Moderation
  is_visible   BOOLEAN     NOT NULL DEFAULT TRUE,
  flagged_at   TIMESTAMPTZ,

  -- Engagement
  helpful_count   INTEGER  NOT NULL DEFAULT 0,
  unhelpful_count INTEGER  NOT NULL DEFAULT 0,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One review per (tenant, property) pair
  CONSTRAINT uq_reviews UNIQUE (reviewer_id, property_id)
);

COMMENT ON TABLE reviews IS 'Post-stay tenant review. Gated — only tenants who completed a booking can review.';
COMMENT ON COLUMN reviews.rating IS 'Overall/headline rating (1–5 stars).';
COMMENT ON COLUMN reviews.landlord_id IS 'Denormalised from properties.landlord_id for fast landlord profile queries.';

-- ============================================================================
--  SECTION 6 — INQUIRIES (parent thread)
-- ============================================================================

CREATE TABLE inquiries (
  id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id  UUID           NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id    UUID           NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  landlord_id  UUID           NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,  -- denorm

  subject      TEXT           NOT NULL CHECK (char_length(subject) BETWEEN 3 AND 200),
  status       inquiry_status NOT NULL DEFAULT 'new',

  -- Quick-access metadata
  last_message_at  TIMESTAMPTZ,
  last_message_preview TEXT,         -- truncated last message for thread list
  messages_count   INTEGER    NOT NULL DEFAULT 0,
  is_archived      BOOLEAN    NOT NULL DEFAULT FALSE,

  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE inquiries IS 'Conversation thread header. Each inquiry groups many messages about one property between one tenant and one landlord.';

-- ============================================================================
--  SECTION 7 — MESSAGES (child thread)
-- ============================================================================

CREATE TABLE messages (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id  UUID        NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  sender_id   UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Content
  content     TEXT        NOT NULL CHECK (char_length(content) >= 1),
  attachments JSONB       NOT NULL DEFAULT '[]'::jsonb,  -- [{name, url, size_bytes}]

  -- State
  is_read     BOOLEAN     NOT NULL DEFAULT FALSE,
  read_at     TIMESTAMPTZ,
  edited_at   TIMESTAMPTZ,
  is_deleted  BOOLEAN     NOT NULL DEFAULT FALSE,  -- soft delete

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE messages IS 'Individual chat messages within an inquiry thread. Soft-deleted on user request.';
COMMENT ON COLUMN messages.attachments IS 'JSON array of file attachments: [{name, url, size_bytes, mime_type}]';

-- ============================================================================
--  SECTION 8 — BOOKINGS (viewing appointments)
-- ============================================================================

CREATE TABLE bookings (
  id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id     UUID            NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id       UUID            NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  landlord_id     UUID            NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,  -- denorm
  inquiry_id      UUID                    REFERENCES inquiries(id) ON DELETE SET NULL, -- optional link

  -- Schedule
  requested_date  DATE            NOT NULL,
  requested_time  TIME            NOT NULL,
  timezone        TEXT            NOT NULL DEFAULT 'Africa/Nairobi',
  duration_mins   SMALLINT        NOT NULL DEFAULT 30,

  -- Status
  status          booking_status  NOT NULL DEFAULT 'pending',

  -- Notes
  tenant_note     TEXT,
  landlord_note   TEXT,
  cancellation_reason TEXT,
  cancelled_by    UUID                    REFERENCES profiles(id),

  -- Timestamps
  confirmed_at    TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE bookings IS 'Property viewing appointment. Tenant requests, landlord confirms/declines.';
COMMENT ON COLUMN bookings.inquiry_id IS 'Optional: links this booking to the inquiry thread it grew from.';

-- ============================================================================
--  SECTION 9 — VERIFICATIONS
-- ============================================================================

CREATE TABLE verifications (
  id              UUID                  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID                  NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id     UUID                  REFERENCES properties(id) ON DELETE CASCADE,  -- NULL for user verifications

  type            verification_type     NOT NULL,
  status          verification_status   NOT NULL DEFAULT 'pending',

  -- Documents (JSONB array for flexibility)
  documents       JSONB                 NOT NULL DEFAULT '[]'::jsonb,
  -- Schema: [{name: "Title Deed", url: "...", storage_path: "...", uploaded_at: "..."}]

  -- Applicant notes
  applicant_note  TEXT,

  -- Review outcome
  reviewer_id     UUID                  REFERENCES profiles(id),
  reviewer_note   TEXT,
  rejection_reason TEXT,

  -- Timestamps
  submitted_at    TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
  reviewed_at     TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,          -- verifications expire after N months

  -- Prevent re-submission spam (one active request per user+type)
  CONSTRAINT uq_active_verification
    UNIQUE (user_id, type, property_id)
);

COMMENT ON TABLE verifications IS 'Unified verification table for students (student ID), landlords (KRA/ID), and property documents (title deed).';
COMMENT ON COLUMN verifications.documents IS 'JSONB array — [{name, url, storage_path, uploaded_at}]. Flexible, avoids separate documents table for now.';
COMMENT ON COLUMN verifications.expires_at IS 'After expiry, is_verified is revoked and user must re-verify.';

-- ============================================================================
--  SECTION 10 — NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
  id          UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID                NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  type        notification_type   NOT NULL,
  title       TEXT                NOT NULL,
  body        TEXT                NOT NULL,

  -- Deep-link target
  href        TEXT,
  entity_id   UUID,               -- ID of related entity (inquiry_id, booking_id, etc.)
  entity_type TEXT,               -- 'inquiry' | 'booking' | 'review' | ...

  -- State
  is_read     BOOLEAN             NOT NULL DEFAULT FALSE,
  read_at     TIMESTAMPTZ,
  is_archived BOOLEAN             NOT NULL DEFAULT FALSE,

  -- Delivery channels (populated by edge functions / webhooks)
  sent_email  BOOLEAN             NOT NULL DEFAULT FALSE,
  sent_push   BOOLEAN             NOT NULL DEFAULT FALSE,

  created_at  TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE notifications IS 'In-app notification inbox. Edge functions write here + trigger email/push via external services.';

-- ============================================================================
--  SECTION 11 — PROPERTY VIEWS (analytics)
-- ============================================================================

CREATE TABLE property_views (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID        NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id     UUID        REFERENCES profiles(id) ON DELETE SET NULL,  -- NULL = anonymous
  session_id  TEXT,               -- browser session fingerprint (anonymous tracking)
  ip_hash     TEXT,               -- hashed IP (GDPR compliant, not raw IP)
  referrer    TEXT,               -- e.g. 'search', 'favorites', 'direct'
  device_type TEXT        CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  viewed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
-- PARTITION BY RANGE (viewed_at);  -- Uncomment for high-volume deployments
;

COMMENT ON TABLE property_views IS 'Individual view events for analytics. Partitioned by date at scale. One row per pageview.';
COMMENT ON COLUMN property_views.ip_hash IS 'SHA-256 of IP+salt — GDPR compliant, can detect bots without storing PII.';

-- ============================================================================
--  SECTION 12 — ROOMMATE POSTS
-- ============================================================================

CREATE TABLE roommate_posts (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  title             TEXT        NOT NULL CHECK (char_length(title) BETWEEN 10 AND 150),
  description       TEXT        NOT NULL,
  area              TEXT        NOT NULL,
  budget_min        INTEGER     NOT NULL CHECK (budget_min >= 0),
  budget_max        INTEGER     NOT NULL CHECK (budget_max >= budget_min),
  move_in_date      DATE        NOT NULL,
  gender_preference gender_pref NOT NULL DEFAULT 'any',
  lifestyle_tags    TEXT[]      NOT NULL DEFAULT '{}',

  is_active         BOOLEAN     NOT NULL DEFAULT TRUE,
  expires_at        TIMESTAMPTZ,             -- auto-expire after 60 days
  views_count       INTEGER     NOT NULL DEFAULT 0,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
--  SECTION 13 — REPORTS (user-submitted)
-- ============================================================================

CREATE TABLE reports (
  id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id     UUID           NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Polymorphic target
  target_type     report_target  NOT NULL,
  target_id       UUID           NOT NULL,   -- property_id, review_id, message_id, profile_id

  reason          TEXT           NOT NULL CHECK (char_length(reason) BETWEEN 5 AND 100),
  description     TEXT           NOT NULL CHECK (char_length(description) >= 20),

  -- Moderation
  status          report_status  NOT NULL DEFAULT 'open',
  moderator_id    UUID           REFERENCES profiles(id),
  moderator_note  TEXT,

  -- Timestamps
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ,

  -- Prevent report spam (one report per reporter per target)
  CONSTRAINT uq_report UNIQUE (reporter_id, target_type, target_id)
);

-- ============================================================================
--  SECTION 14 — FRAUD ALERTS (system-detected)
-- ============================================================================

CREATE TABLE fraud_alerts (
  id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID           NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id  UUID           REFERENCES properties(id) ON DELETE SET NULL,

  type         fraud_type     NOT NULL,
  severity     fraud_severity NOT NULL DEFAULT 'medium',
  description  TEXT           NOT NULL,
  evidence     JSONB          NOT NULL DEFAULT '[]'::jsonb,  -- [{type, value, source}]
  auto_detected BOOLEAN       NOT NULL DEFAULT TRUE,         -- TRUE = AI/rules, FALSE = manual flag

  is_resolved  BOOLEAN        NOT NULL DEFAULT FALSE,
  resolver_id  UUID           REFERENCES profiles(id),
  resolution_note TEXT,

  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  resolved_at  TIMESTAMPTZ
);

-- ============================================================================
--  SECTION 15 — REVENUE RECORDS
-- ============================================================================

CREATE TABLE revenue_records (
  id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID           NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id  UUID           REFERENCES properties(id) ON DELETE SET NULL,

  type         revenue_type   NOT NULL,
  amount       INTEGER        NOT NULL CHECK (amount > 0),  -- KES in whole shillings
  currency     CHAR(3)        NOT NULL DEFAULT 'KES',
  status       revenue_status NOT NULL DEFAULT 'pending',

  description  TEXT           NOT NULL,
  reference    TEXT           UNIQUE,   -- M-Pesa transaction ID, Stripe charge ID, etc.
  metadata     JSONB          NOT NULL DEFAULT '{}'::jsonb,

  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  refunded_at  TIMESTAMPTZ
);

-- ============================================================================
--  SECTION 16 — ADMIN AUDIT LOG
-- ============================================================================

CREATE TABLE admin_audit_log (
  id           UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id     UUID               NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action       admin_action_type  NOT NULL,
  target_id    UUID               NOT NULL,  -- user_id, property_id, etc.
  target_type  TEXT               NOT NULL,  -- 'profile', 'property', 'verification', ...
  before_state JSONB,             -- snapshot of record before change
  after_state  JSONB,             -- snapshot of record after change
  note         TEXT,
  ip_address   INET,
  user_agent   TEXT,
  created_at   TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE admin_audit_log IS 'Immutable audit trail of all admin actions. Never delete rows. Used for compliance and accountability.';


-- ============================================================================
--  SECTION 17 — INDEXES
-- ============================================================================
--
--  Strategy:
--  ─────────────────────────────────────────────────────────────────────────
--  • B-Tree  → equality/range lookups on scalar columns (id, status, price)
--  • GIN     → full-text search (tsvector), array containment (@>), JSONB
--  • GiST    → geographic proximity (lat/lon), trigram similarity
--  • Partial → index only rows matching a WHERE condition (massive savings)
--  • Covering→ INCLUDE extra columns to enable index-only scans
--  ─────────────────────────────────────────────────────────────────────────

-- profiles
CREATE INDEX idx_profiles_role            ON profiles(role);
CREATE INDEX idx_profiles_status          ON profiles(status);
CREATE INDEX idx_profiles_email           ON profiles(email);
CREATE INDEX idx_profiles_created         ON profiles(created_at DESC);

-- properties — listing feed (most common query)
CREATE INDEX idx_properties_area          ON properties(area);
CREATE INDEX idx_properties_type          ON properties(type);
CREATE INDEX idx_properties_price         ON properties(price);
CREATE INDEX idx_properties_landlord      ON properties(landlord_id);
CREATE INDEX idx_properties_created       ON properties(created_at DESC);
CREATE INDEX idx_properties_views         ON properties(views_count DESC);
CREATE INDEX idx_properties_gender        ON properties(gender_preference);
CREATE INDEX idx_properties_distance      ON properties(distance_from_campus);
CREATE INDEX idx_properties_furnishing    ON properties(furnishing);

-- Composite: the most common search filter combination
CREATE INDEX idx_properties_search_core
  ON properties(area, type, price, is_available, is_published, approval_status);

-- Partial indexes — only index rows that will actually be queried
CREATE INDEX idx_properties_available_only
  ON properties(area, price, created_at DESC)
  WHERE (is_available = TRUE AND is_published = TRUE AND approval_status = 'approved');

CREATE INDEX idx_properties_featured
  ON properties(featured_until DESC)
  WHERE (is_featured = TRUE AND featured_until IS NOT NULL);

-- Full-text search (GIN on tsvector column — fastest FTS pattern)
CREATE INDEX idx_properties_fts
  ON properties USING GIN (search_vector);

-- GeoSpatial: lat/lon box queries (upgrade to PostGIS for radius queries)
CREATE INDEX idx_properties_geo
  ON properties(latitude, longitude)
  WHERE (latitude IS NOT NULL AND longitude IS NOT NULL);

-- Amenities/array containment
CREATE INDEX idx_properties_amenities
  ON properties USING GIN (amenities);

-- property_images
CREATE INDEX idx_images_property          ON property_images(property_id, sort_order);
CREATE INDEX idx_images_primary           ON property_images(property_id) WHERE is_primary = TRUE;

-- favorites
CREATE INDEX idx_favorites_user           ON favorites(user_id, created_at DESC);
CREATE INDEX idx_favorites_property       ON favorites(property_id);  -- for saves_count aggregation

-- reviews
CREATE INDEX idx_reviews_property         ON reviews(property_id, created_at DESC);
CREATE INDEX idx_reviews_landlord         ON reviews(landlord_id);
CREATE INDEX idx_reviews_reviewer         ON reviews(reviewer_id);
CREATE INDEX idx_reviews_visible          ON reviews(property_id, rating) WHERE is_visible = TRUE;

-- inquiries
CREATE INDEX idx_inquiries_tenant         ON inquiries(tenant_id, created_at DESC);
CREATE INDEX idx_inquiries_landlord       ON inquiries(landlord_id, status, created_at DESC);
CREATE INDEX idx_inquiries_property       ON inquiries(property_id);
CREATE INDEX idx_inquiries_open           ON inquiries(landlord_id, updated_at DESC) WHERE status = 'new';

-- messages
CREATE INDEX idx_messages_inquiry         ON messages(inquiry_id, created_at ASC);
CREATE INDEX idx_messages_sender          ON messages(sender_id);
CREATE INDEX idx_messages_unread          ON messages(inquiry_id) WHERE is_read = FALSE AND is_deleted = FALSE;

-- bookings
CREATE INDEX idx_bookings_tenant          ON bookings(tenant_id, created_at DESC);
CREATE INDEX idx_bookings_landlord        ON bookings(landlord_id, status, requested_date);
CREATE INDEX idx_bookings_property        ON bookings(property_id);
CREATE INDEX idx_bookings_date            ON bookings(requested_date) WHERE status IN ('pending', 'confirmed');

-- verifications
CREATE INDEX idx_verifications_user       ON verifications(user_id);
CREATE INDEX idx_verifications_status     ON verifications(status, submitted_at DESC);
CREATE INDEX idx_verifications_type       ON verifications(type, status);

-- notifications
CREATE INDEX idx_notifications_user       ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread     ON notifications(user_id) WHERE is_read = FALSE;

-- property_views
CREATE INDEX idx_views_property_time      ON property_views(property_id, viewed_at DESC);
CREATE INDEX idx_views_user               ON property_views(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_views_daily              ON property_views(property_id, DATE(viewed_at));

-- reports
CREATE INDEX idx_reports_status           ON reports(status, created_at DESC);
CREATE INDEX idx_reports_target           ON reports(target_type, target_id);
CREATE INDEX idx_reports_reporter         ON reports(reporter_id);

-- fraud_alerts
CREATE INDEX idx_fraud_user               ON fraud_alerts(user_id);
CREATE INDEX idx_fraud_severity           ON fraud_alerts(severity, created_at DESC) WHERE is_resolved = FALSE;

-- revenue
CREATE INDEX idx_revenue_user             ON revenue_records(user_id, created_at DESC);
CREATE INDEX idx_revenue_status           ON revenue_records(status, created_at DESC);
CREATE INDEX idx_revenue_type             ON revenue_records(type);

-- audit log
CREATE INDEX idx_audit_admin              ON admin_audit_log(admin_id, created_at DESC);
CREATE INDEX idx_audit_target             ON admin_audit_log(target_type, target_id, created_at DESC);

-- roommate_posts
CREATE INDEX idx_roommate_area            ON roommate_posts(area, is_active);
CREATE INDEX idx_roommate_budget          ON roommate_posts(budget_min, budget_max) WHERE is_active = TRUE;


-- ============================================================================
--  SECTION 18 — TRIGGERS & FUNCTIONS
-- ============================================================================

-- ── 1. Auto-create profile on Supabase Auth signup ───────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'tenant')::user_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ── 2. Auto-update updated_at on row change ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at   BEFORE UPDATE ON profiles   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_inquiries_updated_at  BEFORE UPDATE ON inquiries  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_bookings_updated_at   BEFORE UPDATE ON bookings   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_reviews_updated_at    BEFORE UPDATE ON reviews    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_roommate_updated_at   BEFORE UPDATE ON roommate_posts FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ── 3. Maintain properties.search_vector (full-text index) ───────────────────
CREATE OR REPLACE FUNCTION public.update_property_search_vector()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')),       'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.area, '')),        'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.location, '')),    'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.type::text, '')),  'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_property_search_vector
  BEFORE INSERT OR UPDATE OF title, description, area, location, type
  ON properties FOR EACH ROW EXECUTE FUNCTION update_property_search_vector();


-- ── 4. Increment / decrement saves_count on properties ───────────────────────
CREATE OR REPLACE FUNCTION public.sync_saves_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE properties SET saves_count = saves_count + 1 WHERE id = NEW.property_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE properties SET saves_count = GREATEST(saves_count - 1, 0) WHERE id = OLD.property_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_favorites_saves_count
  AFTER INSERT OR DELETE ON favorites
  FOR EACH ROW EXECUTE FUNCTION sync_saves_count();


-- ── 5. Increment inquiries_count on properties ────────────────────────────────
CREATE OR REPLACE FUNCTION public.sync_inquiry_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE properties SET inquiries_count = inquiries_count + 1 WHERE id = NEW.property_id;
    -- Notify landlord
    INSERT INTO notifications (user_id, type, title, body, href, entity_id, entity_type)
    VALUES (
      NEW.landlord_id, 'inquiry',
      'New inquiry received',
      'Someone asked about your listing.',
      '/dashboard/inquiries',
      NEW.id, 'inquiry'
    );
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_inquiry_count
  AFTER INSERT ON inquiries
  FOR EACH ROW EXECUTE FUNCTION sync_inquiry_count();


-- ── 6. Update inquiry metadata when a message is sent ─────────────────────────
CREATE OR REPLACE FUNCTION public.sync_inquiry_on_message()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE inquiries
  SET
    messages_count      = messages_count + 1,
    last_message_at     = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 120),
    status = CASE
      WHEN status = 'new' THEN 'replied'
      ELSE status
    END
  WHERE id = NEW.inquiry_id;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_message_sync_inquiry
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION sync_inquiry_on_message();


-- ── 7. Recompute property avg_rating after review insert/update/delete ────────
CREATE OR REPLACE FUNCTION public.sync_property_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_prop_id UUID;
BEGIN
  v_prop_id := COALESCE(NEW.property_id, OLD.property_id);

  UPDATE properties p SET
    avg_rating    = subq.avg_r,
    reviews_count = subq.cnt
  FROM (
    SELECT
      AVG(rating)::DECIMAL(3,2) AS avg_r,
      COUNT(*)                   AS cnt
    FROM reviews
    WHERE property_id = v_prop_id AND is_visible = TRUE
  ) subq
  WHERE p.id = v_prop_id;

  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_review_sync_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION sync_property_rating();


-- ── 8. Booking status change → notification ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.notify_booking_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status = NEW.status THEN RETURN NULL; END IF;

  IF NEW.status = 'confirmed' THEN
    INSERT INTO notifications (user_id, type, title, body, href, entity_id, entity_type)
    VALUES (
      NEW.tenant_id, 'booking',
      'Viewing confirmed!',
      'Your viewing request has been confirmed. Check the details.',
      '/dashboard/bookings', NEW.id, 'booking'
    );
  ELSIF NEW.status = 'cancelled' THEN
    INSERT INTO notifications (user_id, type, title, body, href, entity_id, entity_type)
    VALUES (
      NEW.tenant_id, 'booking',
      'Viewing cancelled',
      COALESCE(NEW.cancellation_reason, 'Your viewing was cancelled.'),
      '/dashboard/bookings', NEW.id, 'booking'
    );
  ELSIF NEW.status = 'completed' THEN
    -- Prompt tenant to leave a review
    INSERT INTO notifications (user_id, type, title, body, href, entity_id, entity_type)
    VALUES (
      NEW.tenant_id, 'review',
      'How was your visit?',
      'Share your experience to help other students.',
      '/listings/' || NEW.property_id::text, NEW.property_id, 'property'
    );
  END IF;

  -- Also update property bookings_count
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    UPDATE properties SET bookings_count = bookings_count + 1 WHERE id = NEW.property_id;
  END IF;

  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_booking_notify
  AFTER UPDATE OF status ON bookings
  FOR EACH ROW EXECUTE FUNCTION notify_booking_change();


-- ── 9. Verification approved → set is_verified on profile ─────────────────────
CREATE OR REPLACE FUNCTION public.sync_verification_status()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Update user verification status
    UPDATE profiles SET is_verified = TRUE WHERE id = NEW.user_id;

    -- Notify user
    INSERT INTO notifications (user_id, type, title, body, href, entity_id, entity_type)
    VALUES (
      NEW.user_id, 'verification',
      'You are now verified! ✓',
      'Your verification has been approved. Your badge is now visible.',
      '/dashboard/verification', NEW.id, 'verification'
    );

    -- If property verification, mark property verified too
    IF NEW.property_id IS NOT NULL THEN
      UPDATE properties SET is_verified = TRUE WHERE id = NEW.property_id;
    END IF;

  ELSIF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    INSERT INTO notifications (user_id, type, title, body, href, entity_id, entity_type)
    VALUES (
      NEW.user_id, 'verification',
      'Verification not approved',
      COALESCE(NEW.rejection_reason, 'Your verification was rejected. Please review and resubmit.'),
      '/dashboard/verification', NEW.id, 'verification'
    );
  END IF;

  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_verification_sync
  AFTER UPDATE OF status ON verifications
  FOR EACH ROW EXECUTE FUNCTION sync_verification_status();


-- ── 10. Increment views_count (called via edge function, not trigger) ──────────
--  We use a separate RPC so the client can batch-debounce view calls.
CREATE OR REPLACE FUNCTION public.record_property_view(
  p_property_id UUID,
  p_user_id     UUID DEFAULT NULL,
  p_session_id  TEXT DEFAULT NULL,
  p_referrer    TEXT DEFAULT NULL,
  p_device_type TEXT DEFAULT NULL
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO property_views (property_id, user_id, session_id, referrer, device_type)
  VALUES (p_property_id, p_user_id, p_session_id, p_referrer, p_device_type);

  UPDATE properties SET views_count = views_count + 1 WHERE id = p_property_id;
END;
$$;


-- ── 11. Auto-expire roommate posts after 60 days ──────────────────────────────
CREATE OR REPLACE FUNCTION public.expire_roommate_posts()
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE roommate_posts
  SET is_active = FALSE
  WHERE is_active = TRUE
    AND created_at < NOW() - INTERVAL '60 days';
END;
$$;
-- Schedule via pg_cron: SELECT cron.schedule('expire-roommate-posts', '0 2 * * *', 'SELECT expire_roommate_posts()');


-- ── 12. Landlord listings_count maintenance ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.sync_landlord_listings_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET listings_count = listings_count + 1 WHERE id = NEW.landlord_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET listings_count = GREATEST(listings_count - 1, 0) WHERE id = OLD.landlord_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_landlord_listings_count
  AFTER INSERT OR DELETE ON properties
  FOR EACH ROW EXECUTE FUNCTION sync_landlord_listings_count();


-- ============================================================================
--  SECTION 19 — VIEWS (commonly needed data shapes)
-- ============================================================================

-- Active listings with primary image and landlord name (used in listing cards)
CREATE OR REPLACE VIEW vw_active_listings AS
SELECT
  p.id,
  p.title,
  p.type,
  p.price,
  p.price_period,
  p.area,
  p.location,
  p.latitude,
  p.longitude,
  p.distance_from_campus,
  p.furnishing,
  p.gender_preference,
  p.amenities,
  p.bedrooms,
  p.bathrooms,
  p.max_occupants,
  p.is_verified,
  p.is_featured,
  p.views_count,
  p.saves_count,
  p.avg_rating,
  p.reviews_count,
  p.created_at,
  pi.url          AS primary_image_url,
  pr.full_name    AS landlord_name,
  pr.avatar_url   AS landlord_avatar,
  pr.is_verified  AS landlord_verified,
  pr.phone        AS landlord_phone
FROM properties p
LEFT JOIN LATERAL (
  SELECT url FROM property_images
  WHERE property_id = p.id AND is_primary = TRUE
  LIMIT 1
) pi ON TRUE
LEFT JOIN profiles pr ON pr.id = p.landlord_id
WHERE
  p.is_available    = TRUE
  AND p.is_published  = TRUE
  AND p.approval_status = 'approved';

COMMENT ON VIEW vw_active_listings IS 'Tenant-facing listing cards. Only approved, published, available listings.';


-- Unread message counts per user (for sidebar badges)
CREATE OR REPLACE VIEW vw_unread_counts AS
SELECT
  i.tenant_id   AS user_id,
  COUNT(m.id)   AS unread_messages
FROM messages m
JOIN inquiries i ON i.id = m.inquiry_id
WHERE m.is_read = FALSE AND m.is_deleted = FALSE AND m.sender_id != i.tenant_id
GROUP BY i.tenant_id

UNION ALL

SELECT
  i.landlord_id AS user_id,
  COUNT(m.id)   AS unread_messages
FROM messages m
JOIN inquiries i ON i.id = m.inquiry_id
WHERE m.is_read = FALSE AND m.is_deleted = FALSE AND m.sender_id != i.landlord_id
GROUP BY i.landlord_id;


-- Property analytics view (landlord dashboard)
CREATE OR REPLACE VIEW vw_property_analytics AS
SELECT
  p.id              AS property_id,
  p.title,
  p.landlord_id,
  p.views_count,
  p.saves_count,
  p.inquiries_count,
  p.bookings_count,
  p.avg_rating,
  p.reviews_count,
  COUNT(pv.id) FILTER (WHERE pv.viewed_at >= NOW() - INTERVAL '7 days')  AS views_7d,
  COUNT(pv.id) FILTER (WHERE pv.viewed_at >= NOW() - INTERVAL '30 days') AS views_30d,
  COUNT(f.id)  AS favorites_total
FROM properties p
LEFT JOIN property_views pv ON pv.property_id = p.id
LEFT JOIN favorites f ON f.property_id = p.id
GROUP BY p.id, p.title, p.landlord_id, p.views_count, p.saves_count,
         p.inquiries_count, p.bookings_count, p.avg_rating, p.reviews_count;


-- ============================================================================
--  SECTION 20 — ROW LEVEL SECURITY (RLS)
-- ============================================================================
--
--  Policy Matrix:
--  ─────────────────────────────────────────────────────────────────────────
--  Table                  Public  Tenant  Landlord  Admin
--  ─────────────────────────────────────────────────────────────────────────
--  profiles               READ    UPDATE  UPDATE    ALL
--  properties             READ    —       CRUD      ALL
--  property_images        READ    —       CRUD      ALL
--  favorites              —       CRUD    —         ALL
--  reviews                READ    INSERT  —         ALL
--  inquiries              —       CRUD    READ/UPD  ALL
--  messages               —       CRUD    CRUD      ALL
--  bookings               —       CRUD    READ/UPD  ALL
--  verifications          —       INSERT  —         ALL
--  notifications          —       READ    READ      ALL
--  property_views         INSERT  INSERT  —         ALL
--  roommate_posts         READ    CRUD    —         ALL
--  reports                —       INSERT  —         ALL
--  fraud_alerts           —       —       —         ALL
--  revenue_records        —       READ    READ      ALL
--  admin_audit_log        —       —       —         READ
--  ─────────────────────────────────────────────────────────────────────────

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties        ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images   ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites         ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews           ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries         ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_views    ENABLE ROW LEVEL SECURITY;
ALTER TABLE roommate_posts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports           ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_alerts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_records   ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log   ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin (inline — avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
  );
$$;

-- ── profiles ──────────────────────────────────────────────────────────────────
CREATE POLICY "profiles_public_select"
  ON profiles FOR SELECT USING (TRUE);

CREATE POLICY "profiles_owner_update"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_admin_all"
  ON profiles FOR ALL USING (is_admin());


-- ── properties ───────────────────────────────────────────────────────────────
-- Public read: only approved + published + available
CREATE POLICY "properties_public_select"
  ON properties FOR SELECT
  USING (
    (is_published = TRUE AND approval_status = 'approved')
    OR landlord_id = auth.uid()   -- landlords always see their own drafts
    OR is_admin()
  );

CREATE POLICY "properties_landlord_insert"
  ON properties FOR INSERT
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "properties_landlord_update"
  ON properties FOR UPDATE
  USING (auth.uid() = landlord_id OR is_admin());

CREATE POLICY "properties_landlord_delete"
  ON properties FOR DELETE
  USING (auth.uid() = landlord_id OR is_admin());


-- ── property_images ───────────────────────────────────────────────────────────
CREATE POLICY "images_public_select"
  ON property_images FOR SELECT USING (TRUE);

CREATE POLICY "images_landlord_manage"
  ON property_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE id = property_images.property_id AND landlord_id = auth.uid()
    ) OR is_admin()
  );


-- ── favorites ─────────────────────────────────────────────────────────────────
CREATE POLICY "favorites_owner_all"
  ON favorites FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "favorites_admin_all"
  ON favorites FOR ALL USING (is_admin());


-- ── reviews ───────────────────────────────────────────────────────────────────
CREATE POLICY "reviews_public_select"
  ON reviews FOR SELECT USING (is_visible = TRUE OR reviewer_id = auth.uid() OR is_admin());

CREATE POLICY "reviews_tenant_insert"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id
    -- Gate: reviewer must have a completed booking for this property
    AND EXISTS (
      SELECT 1 FROM bookings
      WHERE tenant_id = auth.uid()
        AND property_id = reviews.property_id
        AND status = 'completed'
    )
  );

CREATE POLICY "reviews_tenant_update"
  ON reviews FOR UPDATE
  USING (auth.uid() = reviewer_id);

CREATE POLICY "reviews_admin_all"
  ON reviews FOR ALL USING (is_admin());


-- ── inquiries ─────────────────────────────────────────────────────────────────
CREATE POLICY "inquiries_participant_select"
  ON inquiries FOR SELECT
  USING (auth.uid() IN (tenant_id, landlord_id) OR is_admin());

CREATE POLICY "inquiries_tenant_insert"
  ON inquiries FOR INSERT
  WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "inquiries_participant_update"
  ON inquiries FOR UPDATE
  USING (auth.uid() IN (tenant_id, landlord_id) OR is_admin());


-- ── messages ─────────────────────────────────────────────────────────────────
CREATE POLICY "messages_participant_select"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM inquiries
      WHERE id = messages.inquiry_id
        AND auth.uid() IN (tenant_id, landlord_id)
    ) OR is_admin()
  );

CREATE POLICY "messages_sender_insert"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM inquiries
      WHERE id = messages.inquiry_id
        AND auth.uid() IN (tenant_id, landlord_id)
        AND status != 'closed'
    )
  );

CREATE POLICY "messages_sender_update"
  ON messages FOR UPDATE
  USING (auth.uid() = sender_id OR is_admin());


-- ── bookings ─────────────────────────────────────────────────────────────────
CREATE POLICY "bookings_participant_select"
  ON bookings FOR SELECT
  USING (auth.uid() IN (tenant_id, landlord_id) OR is_admin());

CREATE POLICY "bookings_tenant_insert"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "bookings_participant_update"
  ON bookings FOR UPDATE
  USING (auth.uid() IN (tenant_id, landlord_id) OR is_admin());


-- ── verifications ─────────────────────────────────────────────────────────────
CREATE POLICY "verifications_owner_select"
  ON verifications FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "verifications_owner_insert"
  ON verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "verifications_admin_update"
  ON verifications FOR UPDATE
  USING (is_admin() OR (auth.uid() = user_id AND status = 'pending'));


-- ── notifications ─────────────────────────────────────────────────────────────
CREATE POLICY "notifications_owner_select"
  ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_owner_update"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "notifications_system_insert"
  ON notifications FOR INSERT WITH CHECK (TRUE);  -- server/triggers insert freely


-- ── property_views ────────────────────────────────────────────────────────────
CREATE POLICY "views_insert_all"
  ON property_views FOR INSERT WITH CHECK (TRUE);  -- anonymous views allowed

CREATE POLICY "views_select_owner_or_admin"
  ON property_views FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM properties WHERE id = property_id AND landlord_id = auth.uid())
    OR is_admin()
  );


-- ── roommate_posts ────────────────────────────────────────────────────────────
CREATE POLICY "roommate_public_select"
  ON roommate_posts FOR SELECT USING (is_active = TRUE OR user_id = auth.uid() OR is_admin());

CREATE POLICY "roommate_owner_manage"
  ON roommate_posts FOR ALL USING (auth.uid() = user_id OR is_admin());


-- ── reports ───────────────────────────────────────────────────────────────────
CREATE POLICY "reports_reporter_insert"
  ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "reports_admin_all"
  ON reports FOR ALL USING (is_admin());

CREATE POLICY "reports_reporter_select"
  ON reports FOR SELECT USING (auth.uid() = reporter_id OR is_admin());


-- ── fraud_alerts ──────────────────────────────────────────────────────────────
CREATE POLICY "fraud_admin_all"
  ON fraud_alerts FOR ALL USING (is_admin());


-- ── revenue_records ───────────────────────────────────────────────────────────
CREATE POLICY "revenue_owner_select"
  ON revenue_records FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "revenue_admin_all"
  ON revenue_records FOR ALL USING (is_admin());


-- ── admin_audit_log ───────────────────────────────────────────────────────────
CREATE POLICY "audit_admin_select"
  ON admin_audit_log FOR SELECT USING (is_admin());

CREATE POLICY "audit_admin_insert"
  ON admin_audit_log FOR INSERT WITH CHECK (is_admin());

-- Audit log is APPEND-ONLY — no update or delete policies


-- ============================================================================
--  SECTION 21 — STORAGE BUCKETS
-- ============================================================================
--
--  Run these commands in the Supabase Dashboard → Storage → New Bucket,
--  or via the Supabase CLI / Management API.
--
--  Bucket: property-images   (public)
--    - Max file size: 5 MB
--    - Allowed MIME types: image/jpeg, image/png, image/webp, image/avif
--    - Path pattern: {landlord_id}/{property_id}/{filename}
--    - Policy: landlords upload to their own folder, public read
--
--  Bucket: avatars            (public)
--    - Max file size: 2 MB
--    - Allowed MIME types: image/jpeg, image/png, image/webp
--    - Path pattern: {user_id}/avatar.{ext}
--    - Policy: users upload to their own folder, public read
--
--  Bucket: verifications      (private)
--    - Max file size: 10 MB
--    - Allowed MIME types: image/jpeg, image/png, application/pdf
--    - Path pattern: {user_id}/{verification_id}/{filename}
--    - Policy: users upload to their own folder; only service_role can read
--    - NOTE: Admin reads via service_role key in edge functions only
--
--  Bucket: message-attachments (private)
--    - Max file size: 20 MB
--    - Allowed MIME types: image/*, application/pdf, text/plain
--    - Path pattern: {inquiry_id}/{sender_id}/{filename}
--    - Policy: inquiry participants only


-- ============================================================================
--  SECTION 22 — SCALABILITY RECOMMENDATIONS
-- ============================================================================
--
--  ┌─────────────────────────────────────────────────────────────────────┐
--  │  CURRENT STATE (0–10K users)                                        │
--  │  ─────────────────────────────────────────────────────────────────  │
--  │  • Single Supabase project (shared compute)                         │
--  │  • All tables in public schema                                      │
--  │  • Mock data replaced by real Supabase queries                      │
--  │  • Supabase free tier: 500 MB DB, 1 GB storage, 2 GB bandwidth      │
--  │                                                                     │
--  │  SCALE PHASE 1 (10K–100K users)                                     │
--  │  ─────────────────────────────────────────────────────────────────  │
--  │  1. Upgrade to Supabase Pro (8 GB DB, dedicated Postgres)           │
--  │  2. Enable pg_cron for background jobs (expire roommate posts,      │
--  │     send digest emails, recompute analytics)                        │
--  │  3. Add Redis/Upstash for:                                          │
--  │     - Rate limiting (API routes)                                    │
--  │     - Session caching (dashboard stats)                             │
--  │     - Search suggestions / autocomplete                             │
--  │  4. Partition property_views by month:                              │
--  │     CREATE TABLE property_views_2026_05 PARTITION OF property_views │
--  │     FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');               │
--  │  5. Use Supabase Realtime for live notifications and chat           │
--  │  6. Add CDN (Cloudflare) in front of property-images bucket         │
--  │                                                                     │
--  │  SCALE PHASE 2 (100K–1M users)                                      │
--  │  ─────────────────────────────────────────────────────────────────  │
--  │  1. Read replicas for listing queries (Supabase Read Replicas)      │
--  │  2. Separate analytics pipeline:                                    │
--  │     property_views → Kafka → ClickHouse (OLAP)                      │
--  │  3. Elasticsearch / Typesense for full-text search                  │
--  │     (replaces search_vector GIN index)                              │
--  │  4. Horizontal sharding by area/region for properties table         │
--  │  5. Move fraud detection to async ML pipeline                       │
--  │     (Supabase Edge Function → Python microservice)                  │
--  │  6. GraphQL subscriptions for real-time dashboard                   │
--  │                                                                     │
--  │  GENERAL BEST PRACTICES (applied now)                               │
--  │  ─────────────────────────────────────────────────────────────────  │
--  │  ✓ Denormalise counters (views_count, saves_count) — avoid          │
--  │    expensive COUNT(*) on every page load                            │
--  │  ✓ Partial indexes for filtered queries (is_available=TRUE only)    │
--  │  ✓ ENUM types instead of CHECK constraints — safer refactors        │
--  │  ✓ JSONB for flexible metadata (attachments, notification_prefs)    │
--  │  ✓ search_vector maintained by trigger — search is always up-to-date│
--  │  ✓ Soft-delete on messages (is_deleted flag) — preserve audit trail │
--  │  ✓ Immutable audit log (no DELETE policy) — compliance-ready        │
--  │  ✓ ip_hash instead of raw IP — GDPR compliant analytics             │
--  │  ✓ SECURITY DEFINER on auth functions — prevents privilege escalation│
--  └─────────────────────────────────────────────────────────────────────┘


-- ============================================================================
--  SECTION 23 — USEFUL QUERIES (reference)
-- ============================================================================

-- Search listings with full-text + filters
-- SELECT * FROM vw_active_listings
-- WHERE
--   search_vector @@ plainto_tsquery('english', 'bedsitter ruiru wifi')
--   AND price BETWEEN 8000 AND 15000
--   AND area = 'Kahawa West'
--   AND 'wifi' = ANY(amenities)
-- ORDER BY ts_rank(search_vector, plainto_tsquery('english', 'bedsitter ruiru wifi')) DESC
-- LIMIT 20 OFFSET 0;

-- Landlord dashboard stats (single query)
-- SELECT
--   COUNT(*) FILTER (WHERE is_published)                    AS total_listings,
--   COUNT(*) FILTER (WHERE is_available AND is_published)   AS active_listings,
--   SUM(views_count)                                        AS total_views,
--   SUM(saves_count)                                        AS total_saves,
--   SUM(inquiries_count)                                    AS total_inquiries,
--   AVG(avg_rating) FILTER (WHERE avg_rating IS NOT NULL)   AS portfolio_avg_rating
-- FROM properties
-- WHERE landlord_id = auth.uid();

-- Unread notification count (for badge)
-- SELECT COUNT(*) FROM notifications
-- WHERE user_id = auth.uid() AND is_read = FALSE;

-- Record a property view (call via API route)
-- SELECT record_property_view(
--   'property-uuid-here',
--   auth.uid(),        -- NULL if not logged in
--   'session-id-here',
--   'search',          -- referrer
--   'mobile'
-- );
