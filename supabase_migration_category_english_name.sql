-- ==============================================================================
-- Language support (Marathi / English)
-- Safe to run on an existing database: it only ADDS a column and fills it in.
-- Run it once in the Supabase SQL editor.
-- ==============================================================================

-- 1. English name of every category (shown when the website language is English)
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS name_en TEXT;

-- 2. Fill in the English names of the 18 built-in categories
UPDATE public.categories AS c
SET name_en = v.name_en
FROM (VALUES
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
) AS v(name_mr, name_en)
WHERE c.name = v.name_mr
  AND (c.name_en IS NULL OR c.name_en = '');

-- 3. The project name is no longer stored as a fixed Marathi sentence.
--    An empty name makes the website show "My House Construction" / "माझ्या घराचे बांधकाम"
--    according to the selected language.
ALTER TABLE public.settings ALTER COLUMN project_name DROP DEFAULT;
UPDATE public.settings SET project_name = NULL WHERE project_name = 'माझ्या घराचे बांधकाम';

-- Custom categories you added earlier have no English name yet: open Settings and
-- use the edit (pencil) button on each of them to add the English name.
