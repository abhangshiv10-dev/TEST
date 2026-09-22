-- ==============================================================================
-- 🏠 माझ्या घराचे बांधकाम (Home Construction Expense Tracker) - Supabase Schema
-- Simple, Minimal, Premium 3-Table Architecture with RLS & Storage
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SETTINGS TABLE (One row per user with total construction budget)
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    total_budget NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (total_budget >= 0),
    project_name TEXT DEFAULT 'माझ्या घराचे बांधकाम',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CATEGORIES TABLE (User-specific expense categories)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_category_name UNIQUE(user_id, name)
);

-- 3. EXPENSES TABLE (Core expense transactions)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    photo_path TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for blazing fast queries
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON public.settings(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category_id);

-- Auto-update updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS tr_settings_updated_at ON public.settings;
CREATE TRIGGER tr_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_categories_updated_at ON public.categories;
CREATE TRIGGER tr_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_expenses_updated_at ON public.expenses;
CREATE TRIGGER tr_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 🔒 ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Settings Policies
CREATE POLICY "Users can view their own settings" ON public.settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own settings" ON public.settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own settings" ON public.settings FOR DELETE USING (auth.uid() = user_id);

-- Categories Policies
CREATE POLICY "Users can view their own categories" ON public.categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own categories" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own categories" ON public.categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own categories" ON public.categories FOR DELETE USING (auth.uid() = user_id);

-- Expenses Policies
CREATE POLICY "Users can view their own expenses" ON public.expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own expenses" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own expenses" ON public.expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expenses" ON public.expenses FOR DELETE USING (auth.uid() = user_id);

-- ==============================================================================
-- 📦 SUPABASE STORAGE: expense-photos
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('expense-photos', 'expense-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Allow authenticated user to view own expense photos" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'expense-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Allow public read if public bucket" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'expense-photos');

CREATE POLICY "Allow authenticated user to upload expense photos" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'expense-photos' AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow authenticated user to update own expense photos" ON storage.objects
FOR UPDATE TO authenticated USING (
    bucket_id = 'expense-photos' AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow authenticated user to delete own expense photos" ON storage.objects
FOR DELETE TO authenticated USING (
    bucket_id = 'expense-photos' AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ==============================================================================
-- 🚀 AUTOMATIC SEED FUNCTION FOR NEW USERS (18 Marathi Default Categories)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user_setup()
RETURNS TRIGGER AS $$
BEGIN
    -- Create default settings
    INSERT INTO public.settings (user_id, total_budget, project_name)
    VALUES (NEW.id, 0.00, 'माझ्या घराचे बांधकाम')
    ON CONFLICT (user_id) DO NOTHING;

    -- Seed 18 standard Marathi construction categories
    INSERT INTO public.categories (user_id, name) VALUES
        (NEW.id, 'सिमेंट'),
        (NEW.id, 'वाळू'),
        (NEW.id, 'स्टील'),
        (NEW.id, 'विटा'),
        (NEW.id, 'खडी'),
        (NEW.id, 'माती'),
        (NEW.id, 'मजुरी'),
        (NEW.id, 'वीज साहित्य'),
        (NEW.id, 'प्लंबिंग साहित्य'),
        (NEW.id, 'टाइल्स'),
        (NEW.id, 'फरशी'),
        (NEW.id, 'पेंट'),
        (NEW.id, 'लाकूड'),
        (NEW.id, 'दरवाजे'),
        (NEW.id, 'खिडक्या'),
        (NEW.id, 'हार्डवेअर'),
        (NEW.id, 'वाहतूक'),
        (NEW.id, 'इतर')
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to seed on auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_setup();
