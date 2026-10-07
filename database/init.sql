-- ============================================================
-- Launchpad SaaS — Complete Production Database Schema (init.sql)
-- Exported and verified from active database schema.
-- Compatible with PostgreSQL 14, 15, 16, 17, 18+
--
-- INCLUDES:
--   • All 23 application tables with exact columns, types, defaults & checks
--   • Primary key and unique constraints
--   • Foreign key relationships with cascade/restrict rules
--   • Performance indexes (composite, unique, and foreign key indexes)
--   • Automatic updated_at trigger function and table triggers
--   • Complete column and table metadata documentation comments
--
-- ZERO mock data, ZERO seed data included. Pure production schema.
-- ============================================================

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET search_path = public, pg_catalog;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: asset_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.asset_categories (
    id character varying(100) NOT NULL,
    name character varying(150) NOT NULL,
    label character varying(150) NOT NULL,
    asset_type character varying(50) NOT NULL,
    description character varying(255),
    icon character varying(100),
    color character varying(30),
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: asset_subcategories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.asset_subcategories (
    id character varying(100) NOT NULL,
    category_id character varying(100) NOT NULL,
    name character varying(150) NOT NULL,
    label character varying(150) NOT NULL,
    description character varying(255),
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.assets (
    id character varying(100) DEFAULT (public.uuid_generate_v4())::text NOT NULL,
    user_id uuid,
    name character varying(255) NOT NULL,
    type text DEFAULT 'image'::text NOT NULL,
    file_path text,
    file_url text,
    file_size bigint DEFAULT 0 NOT NULL,
    mime_type character varying(100) DEFAULT 'application/octet-stream'::character varying NOT NULL,
    width integer,
    height integer,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_builtin boolean DEFAULT false NOT NULL,
    is_premium boolean DEFAULT false NOT NULL,
    category character varying(100) DEFAULT 'General'::character varying NOT NULL,
    use_count integer DEFAULT 0 NOT NULL,
    group_id character varying(100),
    group_label character varying(255),
    spec jsonb,
    subcategory character varying(100),
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT assets_type_check CHECK ((type = ANY (ARRAY['image'::text, 'illustration'::text, 'icon'::text, 'mockup'::text, 'shape'::text, 'svg'::text, 'badge'::text, 'sticker'::text, 'video'::text, 'font'::text, 'json'::text, 'other'::text])))
);


--
-- Name: TABLE assets; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.assets IS 'Unified asset store for user uploads and system built-ins';


--
-- Name: COLUMN assets.file_size; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assets.file_size IS 'File size in bytes';


--
-- Name: COLUMN assets.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assets.metadata IS 'Arbitrary asset metadata (EXIF, dimensions, palette)';


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    action character varying(100) NOT NULL,
    resource_type character varying(100),
    resource_id uuid,
    ip_address character varying(45),
    user_agent character varying(500),
    severity text DEFAULT 'info'::text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT audit_logs_severity_check CHECK ((severity = ANY (ARRAY['info'::text, 'warning'::text, 'critical'::text])))
);


--
-- Name: TABLE audit_logs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.audit_logs IS 'Immutable audit logging for security, billing, and system operations';


--
-- Name: COLUMN audit_logs.action; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.audit_logs.action IS 'Dot-namespaced action, e.g. user.login, project.delete';


--
-- Name: color_palettes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.color_palettes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    name character varying(100) NOT NULL,
    type character varying(30) DEFAULT 'solid'::character varying NOT NULL,
    category character varying(50) DEFAULT 'brand'::character varying NOT NULL,
    config jsonb NOT NULL,
    is_builtin boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TABLE color_palettes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.color_palettes IS 'Harmonious colorways, solid palettes, and gradients';


--
-- Name: device_presets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.device_presets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(120) NOT NULL,
    slug character varying(100) NOT NULL,
    width integer NOT NULL,
    height integer NOT NULL,
    device_type character varying(50) DEFAULT 'smartphone'::character varying,
    format_id uuid,
    is_standard boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: fcm_device_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.fcm_device_tokens (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    token text NOT NULL,
    device_type character varying(50) DEFAULT 'web'::character varying NOT NULL,
    last_used_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: font_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.font_categories (
    id character varying(100) NOT NULL,
    name character varying(150) NOT NULL,
    label character varying(150) NOT NULL,
    description character varying(255),
    color character varying(30),
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: fonts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.fonts (
    id character varying(100) NOT NULL,
    user_id uuid,
    name character varying(100) NOT NULL,
    family character varying(255) NOT NULL,
    category character varying(50) DEFAULT 'sans-serif'::character varying NOT NULL,
    font_url text,
    weights jsonb DEFAULT '[400, 600, 700]'::jsonb NOT NULL,
    is_builtin boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TABLE fonts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.fonts IS 'Typography library of system and custom web fonts';


--
-- Name: mockups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.mockups (
    id character varying(100) NOT NULL,
    user_id uuid,
    name character varying(255) NOT NULL,
    slug character varying(100),
    category character varying(100) DEFAULT 'Phones'::character varying NOT NULL,
    style character varying(50) DEFAULT 'realistic'::character varying NOT NULL,
    image_url text NOT NULL,
    featured_image text,
    natural_width integer DEFAULT 393 NOT NULL,
    natural_height integer DEFAULT 852 NOT NULL,
    screen_slot jsonb NOT NULL,
    spec jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_builtin boolean DEFAULT false NOT NULL,
    is_premium boolean DEFAULT false NOT NULL,
    tags text[],
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TABLE mockups; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mockups IS 'Device mockups library with dynamic hardware screens and bezels';


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(255) NOT NULL,
    body text NOT NULL,
    type character varying(50) DEFAULT 'info'::character varying NOT NULL,
    audience character varying(50) DEFAULT 'all'::character varying NOT NULL,
    action_url character varying(500),
    channel character varying(50) DEFAULT 'push_and_inapp'::character varying NOT NULL,
    status character varying(50) DEFAULT 'sent'::character varying NOT NULL,
    sent_by uuid,
    fcm_message_id character varying(255),
    metadata jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.projects (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(1000),
    canvas_data jsonb,
    thumbnail_url text,
    width integer DEFAULT 1920 NOT NULL,
    height integer DEFAULT 1080 NOT NULL,
    is_public boolean DEFAULT false NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    tags text[],
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT projects_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text])))
);


--
-- Name: TABLE projects; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.projects IS 'User design projects containing canvas JSON compositions';


--
-- Name: COLUMN projects.canvas_data; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.projects.canvas_data IS 'Full Fabric.js JSON state — can be multi-MB';


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.refresh_tokens (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    token_hash character varying(64) NOT NULL,
    user_agent character varying(500),
    ip_address character varying(45),
    is_revoked boolean DEFAULT false NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.refresh_tokens IS 'Hashed JWT refresh tokens';


--
-- Name: COLUMN refresh_tokens.token_hash; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.refresh_tokens.token_hash IS 'SHA-256 hex of the raw JWT string';


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(50) NOT NULL,
    description character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TABLE roles; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.roles IS 'System access control roles';


--
-- Name: COLUMN roles.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.roles.name IS 'Unique role identifier, e.g. admin, user';


--
-- Name: shapes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.shapes (
    id character varying(100) NOT NULL,
    name character varying(100) NOT NULL,
    group_id character varying(50) DEFAULT 'basic'::character varying NOT NULL,
    group_label character varying(100) DEFAULT 'Basic'::character varying NOT NULL,
    preview_type character varying(20) DEFAULT 'svg'::character varying NOT NULL,
    preview_data jsonb,
    svg_path text,
    fabric_type character varying(50) DEFAULT 'Path'::character varying NOT NULL,
    default_props jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TABLE shapes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.shapes IS 'Vector shapes library and Fabric.js drawing primitives';


--
-- Name: showcase_formats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.showcase_formats (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(150) NOT NULL,
    slug character varying(100) NOT NULL,
    description character varying(255),
    badge_text character varying(80),
    badge_color character varying(30) DEFAULT '#10B981'::character varying,
    visual_type character varying(50) DEFAULT 'app-store'::character varying,
    image_url text,
    gradient text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id character varying(64) NOT NULL,
    name character varying(128) NOT NULL,
    description text,
    price_monthly integer DEFAULT 0,
    price_yearly integer DEFAULT 0,
    currency character varying(10) DEFAULT 'usd'::character varying,
    stripe_product_id character varying(128),
    stripe_price_id_monthly character varying(128),
    stripe_price_id_yearly character varying(128),
    design_limit integer DEFAULT 3,
    storage_limit_mb bigint DEFAULT '100'::bigint,
    max_seats integer DEFAULT 1,
    can_export_4k boolean DEFAULT false,
    has_brand_kits boolean DEFAULT false,
    has_priority_support boolean DEFAULT false,
    features jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    is_custom boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TABLE subscription_plans; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.subscription_plans IS 'Master subscription tier definitions and entitlements';


--
-- Name: COLUMN subscription_plans.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_plans.id IS 'Unique slug identifier, e.g. free, pro, team, enterprise';


--
-- Name: COLUMN subscription_plans.price_monthly; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_plans.price_monthly IS 'Price in decimal currency units (e.g. 12.00)';


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    plan text DEFAULT 'free'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    stripe_customer_id character varying(255),
    stripe_subscription_id character varying(255),
    stripe_price_id character varying(255),
    trial_ends_at timestamp with time zone,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    canceled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    subscription_plan_id character varying(64),
    CONSTRAINT subscriptions_plan_check CHECK ((plan = ANY (ARRAY['free'::text, 'pro'::text, 'team'::text, 'enterprise'::text]))),
    CONSTRAINT subscriptions_status_check CHECK ((status = ANY (ARRAY['active'::text, 'canceled'::text, 'past_due'::text, 'trialing'::text, 'incomplete'::text])))
);


--
-- Name: TABLE subscriptions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.subscriptions IS 'User subscription ledger linking accounts to subscription_plans';


--
-- Name: COLUMN subscriptions.stripe_customer_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscriptions.stripe_customer_id IS 'cus_xxx from Stripe';


--
-- Name: COLUMN subscriptions.stripe_subscription_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscriptions.stripe_subscription_id IS 'sub_xxx from Stripe';


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.system_settings (
    key character varying(100) NOT NULL,
    value jsonb DEFAULT '{}'::jsonb NOT NULL,
    description character varying(255),
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by uuid
);


--
-- Name: template_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.template_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description character varying(500),
    icon character varying(50) DEFAULT 'Category'::character varying,
    color character varying(20) DEFAULT '#10B981'::character varying,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.templates (
    id character varying(100) DEFAULT (public.uuid_generate_v4())::text NOT NULL,
    creator_id uuid,
    name character varying(255) NOT NULL,
    description character varying(1000),
    category character varying(100) DEFAULT 'general'::character varying NOT NULL,
    canvas_data jsonb NOT NULL,
    thumbnail_url text,
    is_public boolean DEFAULT true NOT NULL,
    is_premium boolean DEFAULT false NOT NULL,
    width integer DEFAULT 1920 NOT NULL,
    height integer DEFAULT 1080 NOT NULL,
    tags text[],
    use_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    source character varying(20) DEFAULT 'admin'::character varying NOT NULL,
    promoted_at timestamp with time zone,
    is_featured boolean DEFAULT false NOT NULL,
    CONSTRAINT templates_source_check CHECK (((source)::text = ANY ((ARRAY['admin'::character varying, 'user'::character varying])::text[])))
);


--
-- Name: TABLE templates; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.templates IS 'Multi-screen and single-screen reusable design templates';


--
-- Name: COLUMN templates.is_premium; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.templates.is_premium IS 'Requires pro/team/enterprise plan to use';


--
-- Name: user_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.user_notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    notification_id uuid NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    name character varying(100) NOT NULL,
    avatar_url text,
    role text DEFAULT 'user'::text NOT NULL,
    plan text DEFAULT 'free'::text NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    verification_token character varying(255),
    password_reset_token character varying(255),
    password_reset_expires timestamp with time zone,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role_id uuid,
    subscription_plan_id character varying(64),
    CONSTRAINT users_plan_check CHECK ((plan = ANY (ARRAY['free'::text, 'pro'::text, 'team'::text, 'enterprise'::text]))),
    CONSTRAINT users_role_check CHECK ((LOWER(role) = ANY (ARRAY['user'::text, 'admin'::text, 'superadmin'::text])))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.users IS 'Platform user accounts with relational role and plan references';


--
-- Name: COLUMN users.password_hash; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.password_hash IS 'bcrypt hash — never store plaintext';


--
-- Name: COLUMN users.role; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.role IS 'user | admin (product owner & super-admin)';


--
-- Name: COLUMN users.plan; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.plan IS 'Subscription plan tier';


--
-- Name: COLUMN users.role_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.role_id IS 'Foreign key reference to roles table';


--
-- Name: COLUMN users.subscription_plan_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.subscription_plan_id IS 'Foreign key reference to subscription_plans table';


--
-- Name: asset_categories asset_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_categories
    ADD CONSTRAINT asset_categories_pkey PRIMARY KEY (id);


--
-- Name: asset_subcategories asset_subcategories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_subcategories
    ADD CONSTRAINT asset_subcategories_pkey PRIMARY KEY (id);


--
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: color_palettes color_palettes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.color_palettes
    ADD CONSTRAINT color_palettes_pkey PRIMARY KEY (id);


--
-- Name: device_presets device_presets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_presets
    ADD CONSTRAINT device_presets_pkey PRIMARY KEY (id);


--
-- Name: device_presets device_presets_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_presets
    ADD CONSTRAINT device_presets_slug_unique UNIQUE (slug);


--
-- Name: fcm_device_tokens fcm_device_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fcm_device_tokens
    ADD CONSTRAINT fcm_device_tokens_pkey PRIMARY KEY (id);


--
-- Name: fcm_device_tokens fcm_device_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fcm_device_tokens
    ADD CONSTRAINT fcm_device_tokens_token_unique UNIQUE (token);


--
-- Name: font_categories font_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.font_categories
    ADD CONSTRAINT font_categories_pkey PRIMARY KEY (id);


--
-- Name: fonts fonts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fonts
    ADD CONSTRAINT fonts_pkey PRIMARY KEY (id);


--
-- Name: mockups mockups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mockups
    ADD CONSTRAINT mockups_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_hash_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_unique UNIQUE (token_hash);


--
-- Name: roles roles_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_unique UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: shapes shapes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shapes
    ADD CONSTRAINT shapes_pkey PRIMARY KEY (id);


--
-- Name: showcase_formats showcase_formats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.showcase_formats
    ADD CONSTRAINT showcase_formats_pkey PRIMARY KEY (id);


--
-- Name: showcase_formats showcase_formats_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.showcase_formats
    ADD CONSTRAINT showcase_formats_slug_unique UNIQUE (slug);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_stripe_customer_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_stripe_customer_id_unique UNIQUE (stripe_customer_id);


--
-- Name: subscriptions subscriptions_stripe_subscription_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_stripe_subscription_id_unique UNIQUE (stripe_subscription_id);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (key);


--
-- Name: template_categories template_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.template_categories
    ADD CONSTRAINT template_categories_name_key UNIQUE (name);


--
-- Name: template_categories template_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.template_categories
    ADD CONSTRAINT template_categories_pkey PRIMARY KEY (id);


--
-- Name: template_categories template_categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.template_categories
    ADD CONSTRAINT template_categories_slug_key UNIQUE (slug);


--
-- Name: templates templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_pkey PRIMARY KEY (id);


--
-- Name: user_notifications user_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_asset_categories_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_asset_categories_type ON public.asset_categories USING btree (asset_type, is_active, sort_order);


--
-- Name: idx_asset_subcategories_cat; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_asset_subcategories_cat ON public.asset_subcategories USING btree (category_id, is_active, sort_order);


--
-- Name: idx_assets_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_assets_category ON public.assets USING btree (category);


--
-- Name: idx_assets_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_assets_created_at ON public.assets USING btree (created_at DESC);


--
-- Name: idx_assets_is_builtin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_assets_is_builtin ON public.assets USING btree (is_builtin);


--
-- Name: idx_assets_subcategory; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_assets_subcategory ON public.assets USING btree (type, category, subcategory);


--
-- Name: idx_assets_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_assets_type ON public.assets USING btree (type);


--
-- Name: idx_assets_type_builtin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_assets_type_builtin ON public.assets USING btree (type, is_builtin);


--
-- Name: idx_assets_type_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_assets_type_category ON public.assets USING btree (type, category);


--
-- Name: idx_assets_type_premium; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_assets_type_premium ON public.assets USING btree (type, is_premium);


--
-- Name: idx_assets_type_use_count; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_assets_type_use_count ON public.assets USING btree (type, use_count DESC);


--
-- Name: idx_assets_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_assets_user_id ON public.assets USING btree (user_id);


--
-- Name: idx_audit_logs_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs USING btree (action);


--
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs USING btree (created_at);


--
-- Name: idx_audit_logs_severity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON public.audit_logs USING btree (severity);


--
-- Name: idx_audit_logs_user_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON public.audit_logs USING btree (user_id, action);


--
-- Name: idx_audit_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);


--
-- Name: idx_color_palettes_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_color_palettes_category ON public.color_palettes USING btree (category);


--
-- Name: idx_color_palettes_is_builtin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_color_palettes_is_builtin ON public.color_palettes USING btree (is_builtin);


--
-- Name: idx_color_palettes_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_color_palettes_type ON public.color_palettes USING btree (type);


--
-- Name: idx_color_palettes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_color_palettes_user_id ON public.color_palettes USING btree (user_id);


--
-- Name: idx_fcm_tokens_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_fcm_tokens_token ON public.fcm_device_tokens USING btree (token);


--
-- Name: idx_fcm_tokens_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user_id ON public.fcm_device_tokens USING btree (user_id);


--
-- Name: idx_font_categories_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_font_categories_active ON public.font_categories USING btree (is_active, sort_order);


--
-- Name: idx_fonts_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_fonts_category ON public.fonts USING btree (category);


--
-- Name: idx_fonts_is_builtin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_fonts_is_builtin ON public.fonts USING btree (is_builtin);


--
-- Name: idx_fonts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_fonts_user_id ON public.fonts USING btree (user_id);


--
-- Name: idx_mockups_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_mockups_category ON public.mockups USING btree (category);


--
-- Name: idx_mockups_is_builtin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_mockups_is_builtin ON public.mockups USING btree (is_builtin);


--
-- Name: idx_mockups_style; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_mockups_style ON public.mockups USING btree (style);


--
-- Name: idx_mockups_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_mockups_user_id ON public.mockups USING btree (user_id);


--
-- Name: idx_notifications_audience; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_notifications_audience ON public.notifications USING btree (audience);


--
-- Name: idx_notifications_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications USING btree (created_at);


--
-- Name: idx_projects_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects USING btree (created_at DESC);


--
-- Name: idx_projects_is_public; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_projects_is_public ON public.projects USING btree (is_public);


--
-- Name: idx_projects_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects USING btree (status);


--
-- Name: idx_projects_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects USING btree (user_id);


--
-- Name: idx_projects_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_projects_user_status ON public.projects USING btree (user_id, status);


--
-- Name: idx_refresh_tokens_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON public.refresh_tokens USING btree (expires_at);


--
-- Name: idx_refresh_tokens_token_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON public.refresh_tokens USING btree (token_hash);


--
-- Name: idx_refresh_tokens_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON public.refresh_tokens USING btree (user_id);


--
-- Name: idx_roles_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_roles_name ON public.roles USING btree (name);


--
-- Name: idx_shapes_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_shapes_group_id ON public.shapes USING btree (group_id);


--
-- Name: idx_sub_plans_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_sub_plans_is_active ON public.subscription_plans USING btree (is_active);


--
-- Name: idx_sub_plans_sort_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_sub_plans_sort_order ON public.subscription_plans USING btree (sort_order);


--
-- Name: idx_subscriptions_plan_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON public.subscriptions USING btree (subscription_plan_id);


--
-- Name: idx_subscriptions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions USING btree (status);


--
-- Name: idx_subscriptions_stripe_customer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions USING btree (stripe_customer_id);


--
-- Name: idx_subscriptions_stripe_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions USING btree (stripe_customer_id);


--
-- Name: idx_subscriptions_stripe_sub; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON public.subscriptions USING btree (stripe_subscription_id);


--
-- Name: idx_subscriptions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions USING btree (user_id);


--
-- Name: idx_subscriptions_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions USING btree (user_id, status);


--
-- Name: idx_templates_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates USING btree (category);


--
-- Name: idx_templates_category_public; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_templates_category_public ON public.templates USING btree (category, is_public);


--
-- Name: idx_templates_creator_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_templates_creator_id ON public.templates USING btree (creator_id);


--
-- Name: idx_templates_is_premium; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_templates_is_premium ON public.templates USING btree (is_premium);


--
-- Name: idx_templates_is_public; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_templates_is_public ON public.templates USING btree (is_public);


--
-- Name: idx_templates_use_count; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_templates_use_count ON public.templates USING btree (use_count DESC);


--
-- Name: idx_user_notifs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_user_notifs_created_at ON public.user_notifications USING btree (created_at);


--
-- Name: idx_user_notifs_user_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_user_notifs_user_read ON public.user_notifications USING btree (user_id, is_read);


--
-- Name: idx_users_active_verified; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_users_active_verified ON public.users USING btree (is_active, is_verified);


--
-- Name: idx_users_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users USING btree (created_at DESC);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_plan; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_users_plan ON public.users USING btree (plan);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users USING btree (role);


--
-- Name: idx_users_role_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_users_role_id ON public.users USING btree (role_id);


--
-- Name: idx_users_role_plan; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_users_role_plan ON public.users USING btree (role, plan);


--
-- Name: idx_users_subscription_plan_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_users_subscription_plan_id ON public.users USING btree (subscription_plan_id);


--
-- Name: assets trigger_assets_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

DROP TRIGGER IF EXISTS trigger_assets_updated_at ON public.assets;
CREATE TRIGGER trigger_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: color_palettes trigger_color_palettes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

DROP TRIGGER IF EXISTS trigger_color_palettes_updated_at ON public.color_palettes;
CREATE TRIGGER trigger_color_palettes_updated_at BEFORE UPDATE ON public.color_palettes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: fonts trigger_fonts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

DROP TRIGGER IF EXISTS trigger_fonts_updated_at ON public.fonts;
CREATE TRIGGER trigger_fonts_updated_at BEFORE UPDATE ON public.fonts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: mockups trigger_mockups_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

DROP TRIGGER IF EXISTS trigger_mockups_updated_at ON public.mockups;
CREATE TRIGGER trigger_mockups_updated_at BEFORE UPDATE ON public.mockups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: projects trigger_projects_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

DROP TRIGGER IF EXISTS trigger_projects_updated_at ON public.projects;
CREATE TRIGGER trigger_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: roles trigger_roles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

DROP TRIGGER IF EXISTS trigger_roles_updated_at ON public.roles;
CREATE TRIGGER trigger_roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: shapes trigger_shapes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

DROP TRIGGER IF EXISTS trigger_shapes_updated_at ON public.shapes;
CREATE TRIGGER trigger_shapes_updated_at BEFORE UPDATE ON public.shapes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subscription_plans trigger_subscription_plans_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

DROP TRIGGER IF EXISTS trigger_subscription_plans_updated_at ON public.subscription_plans;
CREATE TRIGGER trigger_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subscriptions trigger_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

DROP TRIGGER IF EXISTS trigger_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trigger_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: templates trigger_templates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

DROP TRIGGER IF EXISTS trigger_templates_updated_at ON public.templates;
CREATE TRIGGER trigger_templates_updated_at BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users trigger_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

DROP TRIGGER IF EXISTS trigger_users_updated_at ON public.users;
CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: asset_subcategories asset_subcategories_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_subcategories
    ADD CONSTRAINT asset_subcategories_category_id_foreign FOREIGN KEY (category_id) REFERENCES public.asset_categories(id) ON DELETE CASCADE;


--
-- Name: assets assets_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: color_palettes color_palettes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.color_palettes
    ADD CONSTRAINT color_palettes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: device_presets device_presets_format_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_presets
    ADD CONSTRAINT device_presets_format_id_foreign FOREIGN KEY (format_id) REFERENCES public.showcase_formats(id) ON DELETE SET NULL;


--
-- Name: fcm_device_tokens fcm_device_tokens_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fcm_device_tokens
    ADD CONSTRAINT fcm_device_tokens_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: fonts fonts_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fonts
    ADD CONSTRAINT fonts_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: mockups mockups_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mockups
    ADD CONSTRAINT mockups_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_sent_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_sent_by_foreign FOREIGN KEY (sent_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: projects projects_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_subscription_plan_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_subscription_plan_id_foreign FOREIGN KEY (subscription_plan_id) REFERENCES public.subscription_plans(id) ON DELETE RESTRICT;


--
-- Name: subscriptions subscriptions_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: system_settings system_settings_updated_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_updated_by_foreign FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: templates templates_creator_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_creator_id_foreign FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_notifications user_notifications_notification_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_notification_id_foreign FOREIGN KEY (notification_id) REFERENCES public.notifications(id) ON DELETE CASCADE;


--
-- Name: user_notifications user_notifications_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE RESTRICT;


--
-- Name: users users_subscription_plan_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_subscription_plan_id_foreign FOREIGN KEY (subscription_plan_id) REFERENCES public.subscription_plans(id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--


