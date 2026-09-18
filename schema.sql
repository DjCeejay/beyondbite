-- ========================================================
-- BEYOND BITES - SUPABASE DATABASE SCHEMA & INITIAL DATA
-- Run this script in your Supabase SQL Editor
-- ========================================================

-- 1. Create Menu Items Table
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Sandwiches', -- 'Sandwiches', 'Combos', 'Extras'
    price NUMERIC NOT NULL,
    description TEXT,
    set_info TEXT, -- e.g. "(2 IN 1 OF 3 SETS)"
    is_best_value BOOLEAN DEFAULT FALSE,
    in_stock BOOLEAN DEFAULT TRUE,
    includes_sides TEXT, -- e.g. "Comes with 2 Sausages + 30cl 5Alive Pulpy Orange Drink"
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Hero Slideshow Table (Supports both pictures and videos)
CREATE TABLE IF NOT EXISTS public.slideshow_slides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT,
    type TEXT NOT NULL CHECK (type IN ('image', 'video')), -- 'image' or 'video'
    url TEXT NOT NULL,
    poster_url TEXT, -- Video thumbnail fallback URL
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slideshow_slides ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies

-- Public Read-Only Access
CREATE POLICY "Public menu_items are viewable by everyone" ON public.menu_items
    FOR SELECT USING (true);

CREATE POLICY "Public slideshow_slides are viewable by everyone" ON public.slideshow_slides
    FOR SELECT USING (is_active = true);

-- Authenticated Admin Full Access (Insert, Update, Delete)
CREATE POLICY "Admin full access to menu_items" ON public.menu_items
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access to slideshow_slides" ON public.slideshow_slides
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Insert Initial Menu Data matching the Beyond Bites Flyer
INSERT INTO public.menu_items (name, category, price, set_info, description, is_best_value, includes_sides, image_url) VALUES
(
    'Toasted Bread', 
    'Sandwiches', 
    2000, 
    '(2 IN 1 OF 3 SETS)', 
    'Stuffed with sardine, eggs, mayonnaise.', 
    false, 
    NULL,
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80'
),
(
    'Club Sandwich', 
    'Sandwiches', 
    3000, 
    '(3 IN 1 OF 2 SETS)', 
    'Stuffed with eggs, sardines, mayonnaise, carrot, lettuce, cabbage.', 
    false, 
    NULL,
    'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?auto=format&fit=crop&w=800&q=80'
),
(
    'Loaf Cheese Stacked Sandwich', 
    'Sandwiches', 
    5000, 
    NULL, 
    'Stacked with cheese, mayonnaise, chunked protein, suya, carrot, lettuce, cabbage and eggs.', 
    false, 
    NULL,
    'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=800&q=80'
),
(
    'Mega Loaf Cheese Stacked Sandwich', 
    'Combos', 
    7000, 
    NULL, 
    'Stacked with cheese, mayonnaise, chunked protein, carrot, lettuce, cabbage, eggs.', 
    true, 
    'Comes with: 2 Sausages + 30cl 5Alive Pulpy Orange Drink',
    'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80'
),
(
    'Cheese Extra', 
    'Extras', 
    500, 
    NULL, 
    'Extra creamy cheese slice', 
    false, 
    NULL,
    'https://images.unsplash.com/photo-1552767059-ce182ead8c1b?auto=format&fit=crop&w=800&q=80'
),
(
    'Toasted Bread Extra', 
    'Extras', 
    700, 
    NULL, 
    'Extra toasted bread set', 
    false, 
    NULL,
    'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=800&q=80'
),
(
    'Sausages Extra', 
    'Extras', 
    300, 
    NULL, 
    'Extra delicious sausage piece', 
    false, 
    NULL,
    'https://images.unsplash.com/photo-1585325701165-351af916e581?auto=format&fit=crop&w=800&q=80'
);

-- 6. Insert Default Slideshow Items (Images & Demo Video)
INSERT INTO public.slideshow_slides (title, type, url, poster_url, display_order, is_active) VALUES
(
    'Freshly Toasting Our Signature Sandwiches', 
    'image', 
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=1200&q=80', 
    NULL, 
    1, 
    true
),
(
    'Savour the Bite - Fresh Ingredients Daily', 
    'image', 
    'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=1200&q=80', 
    NULL, 
    2, 
    true
),
(
    'Beyond Bites Special Breakfast Video', 
    'video', 
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 
    'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=1200&q=80', 
    3, 
    true
);
