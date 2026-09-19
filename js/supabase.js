import { createClient } from '@supabase/supabase-js';
import { CONFIG, DEFAULT_MENU_ITEMS, DEFAULT_SLIDES } from './config.js';

let supabaseClient = null;

// Initialize Supabase Client
export function getSupabase() {
  if (supabaseClient) return supabaseClient;
  
  if (CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY && CONFIG.SUPABASE_URL.includes('supabase.co')) {
    try {
      supabaseClient = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
      return supabaseClient;
    } catch (e) {
      console.warn('Supabase client initialization failed, fallback to local state:', e);
    }
  }
  return null;
}

// Fetch Menu Items from Supabase or Fallback
export async function fetchMenuItems() {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn('Error fetching menu items from Supabase, using fallback:', e);
    }
  }
  
  // Return local storage or default items
  const local = localStorage.getItem('beyond_bites_menu');
  return local ? JSON.parse(local) : DEFAULT_MENU_ITEMS;
}

// Fetch Hero Slideshow from Supabase or Fallback
export async function fetchSlideshowSlides() {
  const localSlides = getLocalSlides();
  const client = getSupabase();
  let remoteSlides = [];

  if (client) {
    try {
      const { data, error } = await client
        .from('slideshow_slides')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data) {
        remoteSlides = data;
      }
    } catch (e) {
      console.warn('Error fetching slides from Supabase, using fallback:', e);
    }
  }

  const slides = mergeSlides(remoteSlides, localSlides);
  return slides.length > 0 ? sortSlides(slides) : sortSlides(DEFAULT_SLIDES);
}

// Save Menu Item (Admin)
export async function saveMenuItem(item) {
  const client = getSupabase();
  if (client) {
    const isNew = !item.id || item.id.startsWith('demo-');
    if (isNew) {
      const { id, ...newObj } = item;
      const { data, error } = await client.from('menu_items').insert([newObj]).select();
      if (error) throw error;
      return data[0];
    } else {
      const { data, error } = await client.from('menu_items').update(item).eq('id', item.id).select();
      if (error) throw error;
      return data[0];
    }
  }

  // Fallback to localStorage for local testing
  const items = await fetchMenuItems();
  const index = items.findIndex(i => i.id === item.id);
  if (index >= 0) {
    items[index] = item;
  } else {
    item.id = 'item-' + Date.now();
    items.push(item);
  }
  localStorage.setItem('beyond_bites_menu', JSON.stringify(items));
  return item;
}

// Delete Menu Item (Admin)
export async function deleteMenuItem(id) {
  const client = getSupabase();
  if (client && !id.startsWith('demo-')) {
    const { error } = await client.from('menu_items').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  const items = await fetchMenuItems();
  const filtered = items.filter(i => i.id !== id);
  localStorage.setItem('beyond_bites_menu', JSON.stringify(filtered));
  return true;
}

// Save Slideshow Slide (Admin)
export async function saveSlideshowSlide(slide) {
  const client = getSupabase();
  if (client) {
    const isNew = !slide.id || slide.id.startsWith('slide-');
    if (isNew) {
      const { id, ...newObj } = slide;
      const { data, error } = await client.from('slideshow_slides').insert([newObj]).select();
      if (error) throw error;
      return data[0];
    } else {
      const { data, error } = await client.from('slideshow_slides').update(slide).eq('id', slide.id).select();
      if (error) throw error;
      return data[0];
    }
  }

  const slides = await fetchSlideshowSlides();
  const index = slides.findIndex(s => s.id === slide.id);
  if (index >= 0) {
    slides[index] = slide;
  } else {
    slide.id = 'slide-' + Date.now();
    slides.push(slide);
  }
  localStorage.setItem('beyond_bites_slides', JSON.stringify(slides));
  return slide;
}

export async function syncLocalSlideshowSlidesToSupabase() {
  const client = getSupabase();
  const localSlides = getLocalSlides();

  if (!client || localSlides.length === 0) return { synced: 0, skipped: localSlides.length };

  const { data: remoteSlides = [], error: fetchError } = await client
    .from('slideshow_slides')
    .select('url');

  if (fetchError) throw fetchError;

  const remoteUrls = new Set(remoteSlides.map(slide => slide.url));
  const unsyncedSlides = localSlides.filter(slide => slide.url && !remoteUrls.has(slide.url));

  if (unsyncedSlides.length === 0) {
    localStorage.removeItem('beyond_bites_slides');
    return { synced: 0, skipped: localSlides.length };
  }

  const payload = unsyncedSlides.map(({ id, ...slide }) => slide);
  const { error: insertError } = await client.from('slideshow_slides').insert(payload);
  if (insertError) throw insertError;

  localStorage.removeItem('beyond_bites_slides');
  return { synced: unsyncedSlides.length, skipped: localSlides.length - unsyncedSlides.length };
}

// Delete Slideshow Slide (Admin)
export async function deleteSlideshowSlide(id) {
  const client = getSupabase();
  if (client && !id.startsWith('slide-')) {
    const { error } = await client.from('slideshow_slides').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  const slides = await fetchSlideshowSlides();
  const filtered = slides.filter(s => s.id !== id);
  localStorage.setItem('beyond_bites_slides', JSON.stringify(filtered));
  return true;
}

function getLocalSlides() {
  try {
    const local = localStorage.getItem('beyond_bites_slides');
    return local ? JSON.parse(local) : [];
  } catch (e) {
    console.warn('Could not parse local slideshow slides:', e);
    return [];
  }
}

function mergeSlides(remoteSlides, localSlides) {
  const merged = [];
  const seenUrls = new Set();

  [...remoteSlides, ...localSlides].forEach(slide => {
    if (!slide?.url || seenUrls.has(slide.url)) return;
    seenUrls.add(slide.url);
    merged.push(slide);
  });

  return merged;
}

function sortSlides(slides) {
  return [...slides].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
}
