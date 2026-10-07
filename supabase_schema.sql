-- ==============================================================================
-- 🏠 माझ्या घराचे बांधकाम (Home Construction Expense Tracker) - Direct Supabase Cloud Schema
-- Works seamlessly with Mobile Login & Direct Cloud PostgreSQL Database
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop previous tables if they have strict auth.users foreign key constraints
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;

-- 1. SETTINGS TABLE (Single shared household budget / project settings)
CREATE TABLE public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL DEFAULT 'user-shared',
    total_budget NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (total_budget >= 0),
    project_name TEXT, -- empty = the website shows the default name in the selected language
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CATEGORIES TABLE (Marathi expense categories)
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT DEFAULT 'user-shared',
    name TEXT NOT NULL UNIQUE,   -- Marathi name
    name_en TEXT,                -- English name (shown when the website language is English)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. EXPENSES TABLE (Transactions saved live in database)
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL DEFAULT 'user-shared',
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_status TEXT NOT NULL DEFAULT 'Paid',
    description TEXT,
    photo_path TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. BUDGET HISTORY TABLE (Tracks initial budget, additions and changes)
CREATE TABLE IF NOT EXISTS public.budget_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT DEFAULT 'user-shared',
    change_type TEXT NOT NULL DEFAULT 'add', -- 'initial', 'add', 'set'
    amount_changed NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    previous_budget NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    new_budget NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migration support if table already exists
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'Paid';

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_settings_user ON public.settings(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(name);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_budget_history_date ON public.budget_history(created_at DESC);

-- Disable Row Level Security (RLS) so all authorized logins can read & write directly
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_history DISABLE ROW LEVEL SECURITY;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;

-- Grant full table & schema permissions to anon & authenticated API roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 4. SEED 18 DEFAULT MARATHI CATEGORIES IN DATABASE
INSERT INTO public.categories (name, name_en) VALUES
    ('सिमेंट', 'Cement'),
    ('वाळू', 'Sand'),
    ('स्टील', 'Steel'),
    ('विटा', 'Bricks'),
    ('खडी', 'Gravel'),
    ('माती', 'Soil'),
    ('मजुरी', 'Labour'),
    ('वीज साहित्य', 'Electrical'),
    ('प्लंबिंग साहित्य', 'Plumbing'),
    ('टाइल्स', 'Tiles'),
    ('फरशी', 'Flooring'),
    ('पेंट', 'Paint'),
    ('लाकूड', 'Wood'),
    ('दरवाजे', 'Doors'),
    ('खिडक्या', 'Windows'),
    ('हार्डवेअर', 'Hardware'),
    ('वाहतूक', 'Transport'),
    ('इतर', 'Other')
ON CONFLICT (name) DO NOTHING;

-- 5. INITIALIZE SHARED SETTINGS ROW IN DATABASE
INSERT INTO public.settings (user_id, total_budget, project_name)
VALUES ('user-shared', 0.00, NULL)
ON CONFLICT DO NOTHING;

-- 6. STORAGE BUCKET FOR RECEIPT / BILL PHOTOS
INSERT INTO storage.buckets (id, name, public)
VALUES ('expense-photos', 'expense-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public uploads & reads to expense-photos
DROP POLICY IF EXISTS "Public access to expense-photos" ON storage.objects;
CREATE POLICY "Public access to expense-photos" ON storage.objects
FOR ALL TO public USING (bucket_id = 'expense-photos') WITH CHECK (bucket_id = 'expense-photos');
