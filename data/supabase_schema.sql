-- NetSentry Supabase PostgreSQL Schema
-- Run this in your Supabase project's SQL Editor (https://app.supabase.com -> SQL Editor)

-- 1. Create Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Persons / Suspects Table
CREATE TABLE IF NOT EXISTS public.persons (
    id TEXT PRIMARY KEY,
    canonical_name TEXT NOT NULL,
    risk_score INTEGER DEFAULT 50 CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_tier TEXT DEFAULT 'medium' CHECK (risk_tier IN ('critical', 'high', 'medium', 'low')),
    betweenness_centrality DOUBLE PRECISION DEFAULT 0.0,
    orbit_level INTEGER DEFAULT 2 CHECK (orbit_level >= 0 AND orbit_level <= 3),
    is_cross_jurisdiction BOOLEAN DEFAULT FALSE,
    primary_state TEXT DEFAULT 'Maharashtra',
    jurisdictions TEXT[] DEFAULT ARRAY['Maharashtra'],
    aliases TEXT[] DEFAULT ARRAY[]::TEXT[],
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Identifiers Table (Phones, Vehicle Plates, Bank Accounts)
CREATE TABLE IF NOT EXISTS public.identifiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id TEXT NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
    identifier_type TEXT NOT NULL CHECK (identifier_type IN ('PHONE', 'VEHICLE', 'BANK_ACCOUNT', 'AADHAAR', 'PAN')),
    value TEXT NOT NULL,
    state TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FIRs Table (Law Enforcement Case Records)
CREATE TABLE IF NOT EXISTS public.firs (
    fir_id TEXT PRIMARY KEY,
    person_id TEXT NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
    police_station TEXT NOT NULL,
    crime_type TEXT NOT NULL,
    sections TEXT NOT NULL,
    incident_date TIMESTAMPTZ,
    state TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Network Edges Table (Graph Relationships)
CREATE TABLE IF NOT EXISTS public.network_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id TEXT NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
    target_id TEXT NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
    relation_type TEXT NOT NULL CHECK (relation_type IN ('CALLED', 'TRANSFERRED_FUNDS', 'ASSOCIATED_WITH', 'SAME_AS')),
    weight DOUBLE PRECISION DEFAULT 1.0,
    label TEXT,
    is_cross_jurisdiction BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_edge UNIQUE (source_id, target_id, relation_type)
);

-- 6. Human-in-the-Loop (HITL) Adjudication Queue
CREATE TABLE IF NOT EXISTS public.hitl_resolutions (
    candidate_id TEXT PRIMARY KEY,
    primary_id TEXT NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
    primary_name TEXT NOT NULL,
    primary_dept TEXT NOT NULL,
    secondary_id TEXT NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
    secondary_name TEXT NOT NULL,
    secondary_dept TEXT NOT NULL,
    confidence_score DOUBLE PRECISION NOT NULL,
    adjudication_tier TEXT NOT NULL CHECK (adjudication_tier IN ('AUTO_MERGE', 'HITL_REVIEW', 'SEPARATE')),
    breakdown JSONB NOT NULL DEFAULT '{}'::JSONB,
    shared_identifiers JSONB NOT NULL DEFAULT '{}'::JSONB,
    legal_reasoning TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'MERGED', 'REJECTED')),
    officer_notes TEXT,
    resolved_by TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Section 65B Audit Trail
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    officer_id TEXT NOT NULL,
    candidate_id TEXT,
    primary_id TEXT,
    secondary_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_persons_risk_score ON public.persons(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_persons_betweenness ON public.persons(betweenness_centrality DESC);
CREATE INDEX IF NOT EXISTS idx_identifiers_lookup ON public.identifiers(identifier_type, value);
CREATE INDEX IF NOT EXISTS idx_firs_person_id ON public.firs(person_id);
CREATE INDEX IF NOT EXISTS idx_network_edges_source ON public.network_edges(source_id);
CREATE INDEX IF NOT EXISTS idx_network_edges_target ON public.network_edges(target_id);
CREATE INDEX IF NOT EXISTS idx_hitl_status ON public.hitl_resolutions(status);

-- 9. Enable Row Level Security (RLS) with Public Read for demo
ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.firs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hitl_resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated / anon keys
CREATE POLICY "Allow public read access on persons" ON public.persons FOR SELECT USING (true);
CREATE POLICY "Allow public insert on persons" ON public.persons FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on persons" ON public.persons FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on identifiers" ON public.identifiers FOR SELECT USING (true);
CREATE POLICY "Allow public insert on identifiers" ON public.identifiers FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on firs" ON public.firs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on firs" ON public.firs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on network_edges" ON public.network_edges FOR SELECT USING (true);
CREATE POLICY "Allow public insert on network_edges" ON public.network_edges FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on hitl_resolutions" ON public.hitl_resolutions FOR SELECT USING (true);
CREATE POLICY "Allow public update on hitl_resolutions" ON public.hitl_resolutions FOR UPDATE USING (true);
CREATE POLICY "Allow public insert on hitl_resolutions" ON public.hitl_resolutions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert on audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on audit_logs" ON public.audit_logs FOR SELECT USING (true);
