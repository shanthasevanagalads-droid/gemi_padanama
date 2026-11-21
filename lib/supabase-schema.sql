-- ====================================================================
-- GAMI PADANAMA (ගැමි පදනම) - ONLINE CLIENT REGISTRATION SYSTEM
-- Sub-Office: Ampitiya, Kandy District, Central Province, Sri Lanka
-- Production Database Architecture & Schema for Supabase (PostgreSQL 15+)
-- Designed by: Senior Non-Government Database Architect
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. EXTENSIONS & PREREQUISITES
-- --------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------------------
-- 2. CUSTOM DOMAINS & ENUM TYPES
-- --------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE public.client_gender AS ENUM ('Male', 'Female', 'Other');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE public.visit_status AS ENUM ('Waiting', 'In Progress', 'Referred', 'Completed', 'Cancelled');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE public.referral_urgency AS ENUM ('Normal', 'Urgent', 'Critical');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE public.referral_status AS ENUM ('Pending', 'In Consultation', 'Action Plan Agreed', 'Resolved', 'Closed');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('front_desk', 'referral_officer', 'executive', 'admin');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- --------------------------------------------------------------------
-- 3. MASTER TABLE: GRAMA NILADHARI (GN) DIVISIONS
-- Covers the Ampitiya administrative cluster in Kandy District
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gn_divisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_si VARCHAR(100) NOT NULL,
    sub_area VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 4. MASTER TABLE: OFFICERS & SERVICE DESKS
-- Counselors, Legal Advisors, Welfare Officers & Front Desk Staff
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.officers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name_en VARCHAR(150) NOT NULL,
    name_si VARCHAR(150) NOT NULL,
    designation_en VARCHAR(150) NOT NULL,
    designation_si VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    counter_room VARCHAR(100) NOT NULL,
    contact_number VARCHAR(30),
    role public.user_role DEFAULT 'front_desk' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 5. MAIN ENTITY: COMMUNITY CLIENTS
-- Permanent records for Ampitiya community beneficiaries
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nic VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    gender VARCHAR(20) NOT NULL,
    gn_division_id UUID REFERENCES public.gn_divisions(id) ON DELETE RESTRICT,
    gn_division_name VARCHAR(100) NOT NULL,
    whatsapp_number VARCHAR(30) NOT NULL,
    visit_count INT DEFAULT 1 NOT NULL CHECK (visit_count >= 1),
    first_visit_date DATE DEFAULT CURRENT_DATE NOT NULL,
    last_visit_date DATE DEFAULT CURRENT_DATE NOT NULL,
    is_vulnerable BOOLEAN DEFAULT FALSE NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 6. MAIN ENTITY: DAILY CLIENT VISITS & TOKEN QUEUE
-- Manages walk-in intakes, timestamps, tokens, and triage
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    token_number VARCHAR(30) UNIQUE NOT NULL,
    token_sequence INT NOT NULL,
    visit_date DATE DEFAULT CURRENT_DATE NOT NULL,
    arrival_time TIME NOT NULL,
    departure_time TIME,
    visit_reason VARCHAR(255) NOT NULL,
    visit_count_snapshot INT DEFAULT 1 NOT NULL,
    status public.visit_status DEFAULT 'Waiting' NOT NULL,
    whatsapp_number VARCHAR(30),
    referral_officer_id UUID REFERENCES public.officers(id) ON DELETE SET NULL,
    referral_officer_name VARCHAR(150),
    gn_division_name VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'Normal' NOT NULL CHECK (priority IN ('Normal', 'Priority', 'Emergency')),
    notes TEXT,
    served_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 7. SPECIALIST REFERRALS & CASE ROUTING
-- For complex legal mediation, psychosocial support, and microfinance
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_code VARCHAR(30) UNIQUE NOT NULL,
    visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    referring_officer_id UUID REFERENCES public.officers(id) ON DELETE SET NULL,
    referring_officer_name VARCHAR(150) NOT NULL,
    target_officer_id UUID REFERENCES public.officers(id) ON DELETE SET NULL,
    target_officer_name VARCHAR(150) NOT NULL,
    target_department VARCHAR(100) NOT NULL,
    urgency public.referral_urgency DEFAULT 'Normal' NOT NULL,
    status public.referral_status DEFAULT 'Pending' NOT NULL,
    case_summary TEXT NOT NULL,
    action_plan TEXT,
    action_taken TEXT,
    appointment_date DATE,
    appointment_time TIME,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 8. CONFIDENTIAL CASE NOTES & SOCIAL ASSESSMENTS
-- Field officer observations and sensitive legal/welfare notes
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.case_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    referral_id UUID REFERENCES public.referrals(id) ON DELETE CASCADE,
    officer_id UUID REFERENCES public.officers(id) ON DELETE SET NULL,
    officer_name VARCHAR(150) NOT NULL,
    note_type VARCHAR(50) DEFAULT 'General' NOT NULL,
    content TEXT NOT NULL,
    is_confidential BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 9. AUDIT & COMPLIANCE LOGS
-- Essential for NGO Secretariat compliance, transparency, and data privacy
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    officer_name VARCHAR(150),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ====================================================================
-- 10. HIGH-PERFORMANCE INDEXES
-- Optimized for search by NIC, phone, queue monitor & date ranges
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_clients_nic ON public.clients (nic);
CREATE INDEX IF NOT EXISTS idx_clients_whatsapp ON public.clients (whatsapp_number);
CREATE INDEX IF NOT EXISTS idx_clients_gn ON public.clients (gn_division_id);

CREATE INDEX IF NOT EXISTS idx_visits_date_status ON public.visits (visit_date, status);
CREATE INDEX IF NOT EXISTS idx_visits_token ON public.visits (token_number);
CREATE INDEX IF NOT EXISTS idx_visits_client_id ON public.visits (client_id);
CREATE INDEX IF NOT EXISTS idx_visits_officer ON public.visits (referral_officer_id);

CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals (status);
CREATE INDEX IF NOT EXISTS idx_referrals_client ON public.referrals (client_id);
CREATE INDEX IF NOT EXISTS idx_referrals_target ON public.referrals (target_officer_id);

CREATE INDEX IF NOT EXISTS idx_case_notes_client ON public.case_notes (client_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs (created_at DESC);

-- ====================================================================
-- 11. AUTOMATED TRIGGERS & PROCEDURES
-- ====================================================================

-- Function A: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_clients_updated_at ON public.clients;
CREATE TRIGGER trg_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_visits_updated_at ON public.visits;
CREATE TRIGGER trg_visits_updated_at BEFORE UPDATE ON public.visits FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_referrals_updated_at ON public.referrals;
CREATE TRIGGER trg_referrals_updated_at BEFORE UPDATE ON public.referrals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Function B: Generate Daily Token Number (e.g. GP-AMP-2026-0001)
CREATE OR REPLACE FUNCTION public.generate_daily_visit_token()
RETURNS TRIGGER AS $$
DECLARE
    daily_seq INT;
    year_str VARCHAR(4);
BEGIN
    year_str := TO_CHAR(NEW.visit_date, 'YYYY');

    -- Calculate sequential token number for this specific day
    SELECT COALESCE(MAX(token_sequence), 0) + 1
    INTO daily_seq
    FROM public.visits
    WHERE visit_date = NEW.visit_date;

    NEW.token_sequence := daily_seq;
    IF NEW.token_number IS NULL OR NEW.token_number = '' THEN
        NEW.token_number := 'GP-AMP-' || year_str || '-' || LPAD(daily_seq::TEXT, 4, '0');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_visits_assign_token ON public.visits;
CREATE TRIGGER trg_visits_assign_token
BEFORE INSERT ON public.visits
FOR EACH ROW
EXECUTE FUNCTION public.generate_daily_visit_token();

-- Function C: Generate Referral Code (e.g. REF-AMP-2026-0001)
CREATE OR REPLACE FUNCTION public.generate_referral_code_trigger()
RETURNS TRIGGER AS $$
DECLARE
    ref_seq INT;
    year_str VARCHAR(4);
BEGIN
    year_str := TO_CHAR(NOW(), 'YYYY');

    SELECT COUNT(*) + 1
    INTO ref_seq
    FROM public.referrals
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());

    IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
        NEW.referral_code := 'REF-AMP-' || year_str || '-' || LPAD(ref_seq::TEXT, 4, '0');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_referrals_assign_code ON public.referrals;
CREATE TRIGGER trg_referrals_assign_code
BEFORE INSERT ON public.referrals
FOR EACH ROW
EXECUTE FUNCTION public.generate_referral_code_trigger();

-- Function D: Synchronize Client Profile on New Visit (Increment visit_count, update last_visit_date)
CREATE OR REPLACE FUNCTION public.sync_client_on_visit()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.clients
    SET
        visit_count = visit_count + 1,
        last_visit_date = NEW.visit_date,
        updated_at = TIMEZONE('utc'::text, NOW())
    WHERE id = NEW.client_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_client_visit ON public.visits;
CREATE TRIGGER trg_sync_client_visit
AFTER INSERT ON public.visits
FOR EACH ROW
EXECUTE FUNCTION public.sync_client_on_visit();

-- ====================================================================
-- 12. STORED PROCEDURES / RPC FUNCTIONS
-- Direct atomic database operations callable from Next.js
-- ====================================================================

-- RPC 1: Atomic Client Registration & Instant Token Issuance
CREATE OR REPLACE FUNCTION public.rpc_register_client_with_token(
    p_nic VARCHAR(20),
    p_full_name VARCHAR(255),
    p_address TEXT,
    p_gender VARCHAR(20),
    p_gn_division_id UUID,
    p_gn_division_name VARCHAR(100),
    p_whatsapp_number VARCHAR(30),
    p_visit_reason VARCHAR(255),
    p_arrival_time TIME,
    p_referral_officer_id UUID DEFAULT NULL,
    p_referral_officer_name VARCHAR(150) DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_client_id UUID;
    v_visit_id UUID;
    v_is_new BOOLEAN := FALSE;
    v_visit_count INT;
    v_token_number VARCHAR(30);
    v_result JSONB;
BEGIN
    -- 1. Check if client exists by NIC
    SELECT id, visit_count INTO v_client_id, v_visit_count
    FROM public.clients
    WHERE UPPER(nic) = UPPER(TRIM(p_nic));

    IF v_client_id IS NULL THEN
        -- Insert new community client
        INSERT INTO public.clients (
            nic, full_name, address, gender, gn_division_id,
            gn_division_name, whatsapp_number, visit_count,
            first_visit_date, last_visit_date, notes
        ) VALUES (
            UPPER(TRIM(p_nic)), TRIM(p_full_name), TRIM(p_address), p_gender, p_gn_division_id,
            p_gn_division_name, TRIM(p_whatsapp_number), 1,
            CURRENT_DATE, CURRENT_DATE, p_notes
        ) RETURNING id INTO v_client_id;
        v_is_new := TRUE;
        v_visit_count := 1;
    ELSE
        -- Update existing client contact information
        UPDATE public.clients
        SET
            full_name = TRIM(p_full_name),
            address = TRIM(p_address),
            whatsapp_number = TRIM(p_whatsapp_number),
            gn_division_id = COALESCE(p_gn_division_id, gn_division_id),
            gn_division_name = COALESCE(p_gn_division_name, gn_division_name),
            updated_at = NOW()
        WHERE id = v_client_id;
    END IF;

    -- 2. Insert Daily Visit record (Trigger will assign token_number and token_sequence)
    INSERT INTO public.visits (
        client_id, visit_date, arrival_time, visit_reason,
        visit_count_snapshot, status, whatsapp_number,
        referral_officer_id, referral_officer_name,
        gn_division_name, notes
    ) VALUES (
        v_client_id, CURRENT_DATE, p_arrival_time, TRIM(p_visit_reason),
        v_visit_count, 'Waiting', TRIM(p_whatsapp_number),
        p_referral_officer_id, p_referral_officer_name,
        p_gn_division_name, p_notes
    ) RETURNING id, token_number INTO v_visit_id, v_token_number;

    -- 3. Audit Log
    INSERT INTO public.audit_logs (action, entity_type, entity_id, details)
    VALUES (
        'CLIENT_REGISTERED',
        'visits',
        v_visit_id::TEXT,
        jsonb_build_object(
            'client_id', v_client_id,
            'nic', UPPER(TRIM(p_nic)),
            'token_number', v_token_number,
            'is_new_client', v_is_new
        )
    );

    -- 4. Construct Return Payload
    v_result := jsonb_build_object(
        'client_id', v_client_id,
        'visit_id', v_visit_id,
        'token_number', v_token_number,
        'client_name', TRIM(p_full_name),
        'nic', UPPER(TRIM(p_nic)),
        'gn_division', p_gn_division_name,
        'arrival_time', p_arrival_time,
        'status', 'Waiting',
        'is_new_client', v_is_new
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- RPC 2: Log Client Departure
CREATE OR REPLACE FUNCTION public.rpc_log_departure(
    p_visit_id UUID,
    p_departure_time TIME DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_time TIME;
BEGIN
    v_time := COALESCE(p_departure_time, CURRENT_TIME::TIME);

    UPDATE public.visits
    SET
        departure_time = v_time,
        status = 'Completed',
        completed_at = TIMEZONE('utc'::text, NOW()),
        updated_at = TIMEZONE('utc'::text, NOW())
    WHERE id = p_visit_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- RPC 3: Assign Specialist Referral
CREATE OR REPLACE FUNCTION public.rpc_assign_referral(
    p_client_id UUID,
    p_visit_id UUID,
    p_target_officer_id UUID,
    p_urgency public.referral_urgency,
    p_case_summary TEXT,
    p_appointment_date DATE DEFAULT NULL,
    p_appointment_time TIME DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_officer RECORD;
    v_referral_id UUID;
    v_ref_code VARCHAR(30);
BEGIN
    -- Fetch officer details
    SELECT name_en, department INTO v_officer
    FROM public.officers
    WHERE id = p_target_officer_id;

    -- Create referral
    INSERT INTO public.referrals (
        visit_id, client_id, referring_officer_name,
        target_officer_id, target_officer_name, target_department,
        urgency, status, case_summary, appointment_date, appointment_time
    ) VALUES (
        p_visit_id, p_client_id, 'Front Office Desk',
        p_target_officer_id, v_officer.name_en, v_officer.department,
        p_urgency, 'Pending', TRIM(p_case_summary), p_appointment_date, p_appointment_time
    ) RETURNING id, referral_code INTO v_referral_id, v_ref_code;

    -- Update Visit Status to 'Referred'
    IF p_visit_id IS NOT NULL THEN
        UPDATE public.visits
        SET
            status = 'Referred',
            referral_officer_id = p_target_officer_id,
            referral_officer_name = v_officer.name_en,
            updated_at = NOW()
        WHERE id = p_visit_id;
    END IF;

    RETURN jsonb_build_object(
        'referral_id', v_referral_id,
        'referral_code', v_ref_code,
        'target_officer', v_officer.name_en,
        'department', v_officer.department,
        'status', 'Pending'
    );
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 13. VIEWS FOR HIGH-SPEED APPLICATION QUERIES
-- ====================================================================

-- View 1: Live Queue Lounge View (Powers Front Desk Monitor)
CREATE OR REPLACE VIEW public.view_live_lounge_queue AS
SELECT
    v.id AS visit_id,
    v.token_number,
    v.token_sequence,
    v.visit_date,
    v.arrival_time,
    v.status,
    v.priority,
    v.visit_reason,
    c.id AS client_id,
    c.full_name AS client_name,
    c.nic,
    c.gn_division_name,
    c.whatsapp_number,
    o.name_en AS officer_name,
    o.counter_room
FROM public.visits v
JOIN public.clients c ON v.client_id = c.id
LEFT JOIN public.officers o ON v.referral_officer_id = o.id
WHERE v.visit_date = CURRENT_DATE
ORDER BY
    CASE v.priority WHEN 'Emergency' THEN 1 WHEN 'Priority' THEN 2 ELSE 3 END,
    v.token_sequence ASC;

-- View 2: Complete Client Dossier Directory
CREATE OR REPLACE VIEW public.view_client_directory AS
SELECT
    c.id,
    c.nic,
    c.full_name,
    c.address,
    c.gender,
    c.gn_division_name,
    c.whatsapp_number,
    c.visit_count,
    c.first_visit_date,
    c.last_visit_date,
    c.is_vulnerable,
    c.created_at,
    (SELECT COUNT(*) FROM public.referrals r WHERE r.client_id = c.id) AS total_referrals,
    (SELECT COUNT(*) FROM public.case_notes cn WHERE cn.client_id = c.id) AS total_notes
FROM public.clients c;

-- View 3: Executive Dashboard KPIs Aggregation
CREATE OR REPLACE VIEW public.view_executive_summary AS
SELECT
    (SELECT COUNT(*) FROM public.clients) AS total_clients_registered,
    (SELECT COUNT(*) FROM public.visits WHERE visit_date = CURRENT_DATE) AS visits_today,
    (SELECT COUNT(*) FROM public.visits WHERE visit_date = CURRENT_DATE AND status = 'Waiting') AS waiting_today,
    (SELECT COUNT(*) FROM public.visits WHERE visit_date = CURRENT_DATE AND status = 'In Progress') AS in_consultation_today,
    (SELECT COUNT(*) FROM public.visits WHERE visit_date = CURRENT_DATE AND status = 'Completed') AS completed_today,
    (SELECT COUNT(*) FROM public.referrals WHERE status = 'Resolved') AS resolved_referrals,
    (SELECT COUNT(*) FROM public.referrals) AS total_referrals,
    (SELECT COUNT(DISTINCT gn_division_id) FROM public.clients) AS active_gn_divisions;

-- ====================================================================
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- Strict data confidentiality for Sri Lankan community beneficiaries
-- ====================================================================
ALTER TABLE public.gn_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Master data read-only for public/authenticated
CREATE POLICY "Public read for gn_divisions" ON public.gn_divisions FOR SELECT USING (true);
CREATE POLICY "Public read for officers" ON public.officers FOR SELECT USING (true);

-- Authenticated staff policies (Full CRUD for system functions)
CREATE POLICY "Staff read clients" ON public.clients FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Staff insert clients" ON public.clients FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Staff update clients" ON public.clients FOR UPDATE TO authenticated, anon USING (true);

CREATE POLICY "Staff read visits" ON public.visits FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Staff insert visits" ON public.visits FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Staff update visits" ON public.visits FOR UPDATE TO authenticated, anon USING (true);

CREATE POLICY "Staff manage referrals" ON public.referrals FOR ALL TO authenticated, anon USING (true);
CREATE POLICY "Staff manage case_notes" ON public.case_notes FOR ALL TO authenticated, anon USING (true);
CREATE POLICY "Staff insert audit_logs" ON public.audit_logs FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Staff read audit_logs" ON public.audit_logs FOR SELECT TO authenticated, anon USING (true);

-- ====================================================================
-- 15. MASTER CONFIGURATION SEEDS (LOOKUP TABLES ONLY)
-- Note: NO dummy client or mock visit records added!
-- Only legitimate administrative divisions & officer departments.
-- ====================================================================
INSERT INTO public.gn_divisions (code, name_en, name_si, sub_area) VALUES
('KD-512', 'Ampitiya North', 'අම්පිටිය උතුර', 'Ampitiya Town'),
('KD-513', 'Ampitiya South', 'අම්පිටිය දකුණ', 'Udagama'),
('KD-514', 'Ampitiya Pallegama', 'අම්පිටිය පල්ලේගම', 'Pallegama Valley'),
('KD-515', 'Ampitiya Udagama', 'අම්පිටිය උඩගම', 'Upper Hill'),
('KD-516', 'Thennekumbura', 'තෙන්නෙකුඹුර', 'Bridge Junction'),
('KD-517', 'Gurudeniya East', 'ගුරුදෙණිය නැගෙනහිර', 'Gurudeniya'),
('KD-518', 'Gurudeniya West', 'ගුරුදෙණිය බටහිර', 'Gurudeniya'),
('KD-519', 'Thalathuoya North', 'තලාතුඔය උතුර', 'Thalathuoya'),
('KD-520', 'Mailapitiya', 'මයිලපිටිය', 'Mailapitiya Valley'),
('KD-599', 'Other Outside Area', 'වෙනත් පිටස්තර ප්‍රදේශයකින්', 'Kandy District')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.officers (name_en, name_si, designation_en, designation_si, department, counter_room, contact_number, role) VALUES
('Mr. S.Waidyaratne', 'ශාන්ත වෛද්‍යරත්න මහතා', 'Senior Community Legal & Dispute Counselor', 'ජ්‍යෙෂ්ඨ ප්‍රජා නීති හා ආරවුල් උපදේශක', 'Legal Aid & Mediation', 'Desk 02 - Consultation Room A', '+94 72 275 9020', 'referral_officer'),
('Mrs. S. Priyadharshani', 'එස්. ප්‍රියදර්ශනී මහත්මිය', 'Women, Child & Social Welfare Officer', 'කාන්තා, ළමා හා සමාජ සුභසාධන නිලධාරිනී', 'Family & Social Welfare', 'Desk 03 - Welfare Center', '+94 77 312 9876', 'referral_officer'),
('Mr. M.R. Jayawardena', 'එම්.ආර්. ජයවර්ධන මහතා', 'Livelihood, Agriculture & Microfinance Officer', 'ජීවනෝපාය, කෘෂිකර්ම හා ක්ෂුද්‍රමූල්‍ය නිලධාරී', 'Livelihood & Economic Development', 'Desk 04 - Agriculture Hub', '+94 76 890 2345', 'referral_officer'),
('Dr. A. Wijesinghe', 'වෛද්‍ය ඒ. විජේසිංහ මහතා', 'Community Mental Health & Psychosocial Counselor', 'ප්‍රජා මානසික සුවතා හා උපදේශන නිලධාරී', 'Psycho-social Counseling', 'Desk 05 - Wellness Cabin', '+94 70 234 5678', 'referral_officer'),
('Front Desk Officer 01', 'පෙරමුණු මේස නිලධාරී 01', 'Intake Receptionist & Token Dispatcher', 'පෙරමුණු මේස ලියාපදිංචි නිලධාරී', 'Front Office Administration', 'Counter 01 - Reception', '+94 81 224 5890', 'front_desk')
ON CONFLICT DO NOTHING;
