// Beyond Bites App Configuration
export const CONFIG = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://maommxcopvdmihfqnkse.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hb21teGNvcHZkbWloZnFua3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MDIwNzIsImV4cCI6MjA3MzA3ODA3Mn0.1KLWKLdYnDDU4tEnxy4cXXCkqc_2-W6UtNho4Tha4es',
  CLOUDINARY_CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'lapch5uz',
  CLOUDINARY_API_KEY: import.meta.env.VITE_CLOUDINARY_API_KEY || '848742736484911',
  CLOUDINARY_FOLDER: import.meta.env.VITE_CLOUDINARY_FOLDER || 'beyondbite',
  CLOUDINARY_UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'beyond_bites_preset',
  PHONE_PRIMARY: '08106794376',
  PHONE_SECONDARY: '08028948665',
  WHATSAPP_NUMBER: '2348106794376', // International format for WhatsApp API
  ADDRESS: 'Plot 10, Akwaka Road 9 Phase 3, Rumuodumaya, Port Harcourt',
  SOCIALS: {
    INSTAGRAM: 'https://instagram.com/Beyond-Bites',
    TIKTOK: 'https://tiktok.com/@Beyond-Bites',
    FACEBOOK: 'https://facebook.com/Beyond-Bites'
  }
};

// Default Fallback Data (used when Supabase is not yet connected)
export const DEFAULT_MENU_ITEMS = [
  {
    id: 'demo-1',
    name: 'Toasted Bread',
    category: 'Sandwiches',
    price: 2000,
    set_info: '(2 IN 1 OF 3 SETS)',
    description: 'Stuffed with sardine, eggs, mayonnaise.',
    is_best_value: false,
    in_stock: true,
    includes_sides: null,
    image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'demo-2',
    name: 'Club Sandwich',
    category: 'Sandwiches',
    price: 3000,
    set_info: '(3 IN 1 OF 2 SETS)',
    description: 'Stuffed with eggs, sardines, mayonnaise, carrot, lettuce, cabbage.',
    is_best_value: false,
    in_stock: true,
    includes_sides: null,
    image_url: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'demo-3',
    name: 'Loaf Cheese Stacked Sandwich',
    category: 'Sandwiches',
    price: 5000,
    set_info: null,
    description: 'Stacked with cheese, mayonnaise, chunked protein, suya, carrot, lettuce, cabbage and eggs.',
    is_best_value: false,
    in_stock: true,
    includes_sides: null,
    image_url: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'demo-4',
    name: 'Mega Loaf Cheese Stacked Sandwich',
    category: 'Combos',
    price: 7000,
    set_info: null,
    description: 'Stacked with cheese, mayonnaise, chunked protein, carrot, lettuce, cabbage, eggs.',
    is_best_value: true,
    in_stock: true,
    includes_sides: 'Comes with: 2 Sausages + 30cl 5Alive Pulpy Orange Drink',
    image_url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'demo-5',
    name: 'Cheese Extra',
    category: 'Extras',
    price: 500,
    set_info: null,
    description: 'Extra creamy cheese slice',
    is_best_value: false,
    in_stock: true,
    includes_sides: null,
    image_url: 'https://images.unsplash.com/photo-1552767059-ce182ead8c1b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'demo-6',
    name: 'Toasted Bread Extra',
    category: 'Extras',
    price: 700,
    set_info: null,
    description: 'Extra toasted bread set',
    is_best_value: false,
    in_stock: true,
    includes_sides: null,
    image_url: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'demo-7',
    name: 'Sausages Extra',
    category: 'Extras',
    price: 300,
    set_info: null,
    description: 'Extra delicious sausage piece',
    is_best_value: false,
    in_stock: true,
    includes_sides: null,
    image_url: 'https://images.unsplash.com/photo-1585325701165-351af916e581?auto=format&fit=crop&w=800&q=80'
  }
];

export const DEFAULT_SLIDES = [
  {
    id: 'slide-1',
    title: 'Freshly Toasting Our Signature Sandwiches',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=1200&q=80',
    poster_url: null,
    display_order: 1,
    is_active: true
  },
  {
    id: 'slide-2',
    title: 'Savour the Bite - Fresh Ingredients Daily',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=1200&q=80',
    poster_url: null,
    display_order: 2,
    is_active: true
  },
  {
    id: 'slide-3',
    title: 'Beyond Bites Special Breakfast Video',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster_url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=1200&q=80',
    display_order: 3,
    is_active: true
  }
];
