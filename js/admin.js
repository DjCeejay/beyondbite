import { getAdminSession, adminSignIn, adminSignOut, onAuthStateChange } from './auth.js';
import { fetchMenuItems, saveMenuItem, deleteMenuItem, fetchSlideshowSlides, saveSlideshowSlide, deleteSlideshowSlide, syncLocalSlideshowSlidesToSupabase, getLocalSlideshowSlideCount } from './supabase.js';
import { CONFIG } from './config.js';

let currentAdminSession = null;
let adminMenuItems = [];
let adminSlides = [];

export async function initAdmin() {
  currentAdminSession = await getAdminSession();
  
  onAuthStateChange((session) => {
    currentAdminSession = session;
    renderAdminUI();
  });

  renderAdminUI();
  setupLoginEvents();
}

function renderAdminUI() {
  const loginView = document.getElementById('admin-login-view');
  const dashboardView = document.getElementById('admin-dashboard-view');

  if (!loginView || !dashboardView) return;

  if (currentAdminSession) {
    loginView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    loadAdminDashboardData();
  } else {
    loginView.classList.remove('hidden');
    dashboardView.classList.add('hidden');
  }
}

function setupLoginEvents() {
  const loginForm = document.getElementById('admin-login-form');
  const logoutBtn = document.getElementById('admin-logout-btn');

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorAlert = document.getElementById('login-error-msg');

    if (errorAlert) errorAlert.classList.add('hidden');

    try {
      await adminSignIn(email, password);
      renderAdminUI();
    } catch (err) {
      if (errorAlert) {
        errorAlert.innerText = err.message || 'Login failed. Check your credentials.';
        errorAlert.classList.remove('hidden');
      }
    }
  });

  logoutBtn?.addEventListener('click', async () => {
    await adminSignOut();
  });
}

async function loadAdminDashboardData() {
  setupTabs();
  await migrateLocalSlideshowUploads();
  await refreshMenuItemsTable();
  await refreshSlideshowTable();
}

async function migrateLocalSlideshowUploads() {
  try {
    const result = await syncLocalSlideshowSlidesToSupabase();
    if (result.synced > 0) {
      console.info(`Synced ${result.synced} local slideshow upload(s) to Supabase.`);
    }
  } catch (err) {
    console.warn('Could not sync local slideshow uploads to Supabase:', err);
  }
}

function setupTabs() {
  const tabMenuBtn = document.getElementById('tab-btn-menu');
  const tabSlideBtn = document.getElementById('tab-btn-slides');
  const viewMenuSection = document.getElementById('section-menu-manager');
  const viewSlideSection = document.getElementById('section-slide-manager');

  tabMenuBtn?.addEventListener('click', () => {
    tabMenuBtn.classList.add('bg-brand-brown', 'text-white');
    tabMenuBtn.classList.remove('bg-white', 'text-brand-darkbrown');
    tabSlideBtn?.classList.remove('bg-brand-brown', 'text-white');
    tabSlideBtn?.classList.add('bg-white', 'text-brand-darkbrown');

    viewMenuSection?.classList.remove('hidden');
    viewSlideSection?.classList.add('hidden');
  });

  tabSlideBtn?.addEventListener('click', () => {
    tabSlideBtn.classList.add('bg-brand-brown', 'text-white');
    tabSlideBtn.classList.remove('bg-white', 'text-brand-darkbrown');
    tabMenuBtn?.classList.remove('bg-brand-brown', 'text-white');
    tabMenuBtn?.classList.add('bg-white', 'text-brand-darkbrown');

    viewSlideSection?.classList.remove('hidden');
    viewMenuSection?.classList.add('hidden');
  });

  // Setup Modals
  document.getElementById('btn-add-menu-item')?.addEventListener('click', () => openMenuItemModal());
  document.getElementById('btn-add-slide')?.addEventListener('click', () => openSlideModal());
  document.getElementById('btn-sync-local-slides')?.addEventListener('click', () => handleLocalSlidesSync());

  document.getElementById('close-item-modal')?.addEventListener('click', () => closeModal('item-modal'));
  document.getElementById('close-slide-modal')?.addEventListener('click', () => closeModal('slide-modal'));

  // Setup Form Submissions
  document.getElementById('menu-item-form')?.addEventListener('submit', handleSaveMenuItem);
  document.getElementById('slide-form')?.addEventListener('submit', handleSaveSlide);

  // Media Upload Triggers
  setupMediaUploader();
}

async function refreshMenuItemsTable() {
  adminMenuItems = await fetchMenuItems();
  const tableBody = document.getElementById('admin-menu-table-body');
  if (!tableBody) return;

  if (adminMenuItems.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-stone-500">No menu items added yet.</td></tr>`;
    return;
  }

  tableBody.innerHTML = adminMenuItems.map(item => `
    <tr class="border-b border-brand-creamDark hover:bg-brand-cream/50 transition-colors">
      <td class="p-4 font-semibold flex items-center gap-3">
        <img src="${item.image_url || ''}" class="w-12 h-12 rounded-xl object-cover border border-brand-creamDark" alt="${item.name}">
        <div>
          <p class="font-serif font-bold text-brand-darkbrown">${item.name}</p>
          ${item.set_info ? `<span class="text-xs font-bold text-brand-gold">${item.set_info}</span>` : ''}
        </div>
      </td>
      <td class="p-4 text-sm font-semibold">${item.category}</td>
      <td class="p-4 text-sm font-bold text-brand-brown">₦${Number(item.price).toLocaleString()}</td>
      <td class="p-4 text-sm">
        ${item.is_best_value ? '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-gold text-brand-darkbrown">🔥 Best Value</span>' : '-'}
      </td>
      <td class="p-4 text-sm">
        <button data-toggle-stock="${item.id}" class="px-3 py-1 rounded-full text-xs font-bold transition-all ${item.in_stock ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-rose-100 text-rose-800 hover:bg-rose-200'}">
          ${item.in_stock ? 'In Stock' : 'Sold Out'}
        </button>
      </td>
      <td class="p-4 text-sm text-right space-x-2">
        <button data-edit-item="${item.id}" class="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 font-bold text-xs">Edit</button>
        <button data-delete-item="${item.id}" class="px-3 py-1.5 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 font-bold text-xs">Delete</button>
      </td>
    </tr>
  `).join('');

  // Item Action Listeners
  tableBody.querySelectorAll('[data-toggle-stock]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.toggleStock;
      const item = adminMenuItems.find(i => i.id === id);
      if (item) {
        item.in_stock = !item.in_stock;
        await saveMenuItem(item);
        await refreshMenuItemsTable();
      }
    });
  });

  tableBody.querySelectorAll('[data-edit-item]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.editItem;
      const item = adminMenuItems.find(i => i.id === id);
      if (item) openMenuItemModal(item);
    });
  });

  tableBody.querySelectorAll('[data-delete-item]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.deleteItem;
      if (confirm('Are you sure you want to delete this menu item?')) {
        await deleteMenuItem(id);
        await refreshMenuItemsTable();
      }
    });
  });
}

async function refreshSlideshowTable() {
  adminSlides = await fetchSlideshowSlides();
  const tableBody = document.getElementById('admin-slides-table-body');
  if (!tableBody) return;
  updateLocalSlidesSyncStatus();

  if (adminSlides.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-stone-500">No slideshow items uploaded yet.</td></tr>`;
    return;
  }

  tableBody.innerHTML = adminSlides.map(slide => `
    <tr class="border-b border-brand-creamDark hover:bg-brand-cream/50 transition-colors">
      <td class="p-4 font-semibold flex items-center gap-3">
        ${slide.type === 'video' ? `
          <div class="w-16 h-12 rounded-xl bg-brand-dark flex items-center justify-center text-brand-gold font-bold text-xs">📹 Video</div>
        ` : `
          <img src="${slide.url}" class="w-16 h-12 rounded-xl object-cover border border-brand-creamDark" alt="${slide.title}">
        `}
        <p class="font-serif font-bold text-brand-darkbrown text-sm">${slide.title || 'Untitled Slide'}</p>
      </td>
      <td class="p-4 text-sm font-semibold capitalize">${slide.type}</td>
      <td class="p-4 text-sm font-bold">${slide.display_order || 0}</td>
      <td class="p-4 text-sm">
        <span class="px-2.5 py-1 rounded-full text-xs font-bold ${slide.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'}">
          ${slide.is_active ? 'Active' : 'Disabled'}
        </span>
      </td>
      <td class="p-4 text-sm text-right space-x-2">
        <button data-delete-slide="${slide.id}" class="px-3 py-1.5 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 font-bold text-xs">Delete</button>
      </td>
    </tr>
  `).join('');

  tableBody.querySelectorAll('[data-delete-slide]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.deleteSlide;
      if (confirm('Are you sure you want to delete this slide?')) {
        await deleteSlideshowSlide(id);
        await refreshSlideshowTable();
      }
    });
  });
}

async function handleLocalSlidesSync() {
  const status = document.getElementById('local-slides-sync-status');
  if (status) {
    status.classList.remove('hidden', 'border-red-200', 'bg-red-50', 'text-red-700');
    status.classList.add('border-brand-gold/30', 'bg-brand-gold/10', 'text-brand-darkbrown');
    status.innerText = 'Syncing local slideshow uploads to Supabase...';
  }

  try {
    const result = await syncLocalSlideshowSlidesToSupabase();
    await refreshSlideshowTable();
    if (status) {
      status.classList.remove('hidden');
      status.innerText = result.synced > 0
        ? `Synced ${result.synced} local slideshow upload(s). They should now show on mobile after refreshing.`
        : 'No local-only slideshow uploads found to sync.';
    }
  } catch (err) {
    if (status) {
      status.classList.remove('hidden', 'border-brand-gold/30', 'bg-brand-gold/10', 'text-brand-darkbrown');
      status.classList.add('border-red-200', 'bg-red-50', 'text-red-700');
      status.innerText = `Could not sync local slides: ${err.message || 'Supabase rejected the request. Make sure you are logged in with the Supabase admin account.'}`;
    }
  }
}

function updateLocalSlidesSyncStatus() {
  const status = document.getElementById('local-slides-sync-status');
  if (!status) return;

  const localCount = getLocalSlideshowSlideCount();
  if (localCount === 0) {
    status.classList.add('hidden');
    return;
  }

  status.classList.remove('hidden', 'border-red-200', 'bg-red-50', 'text-red-700');
  status.classList.add('border-brand-gold/30', 'bg-brand-gold/10', 'text-brand-darkbrown');
  status.innerText = `${localCount} slideshow upload(s) are still stored only on this device. Click "Sync Local Slides" so mobile visitors can see them too.`;
}

function openMenuItemModal(item = null) {
  const modal = document.getElementById('item-modal');
  const title = document.getElementById('item-modal-title');
  if (!modal) return;

  document.getElementById('item-id').value = item ? item.id : '';
  document.getElementById('item-name').value = item ? item.name : '';
  document.getElementById('item-category').value = item ? item.category : 'Sandwiches';
  document.getElementById('item-price').value = item ? item.price : '';
  document.getElementById('item-set-info').value = item ? (item.set_info || '') : '';
  document.getElementById('item-description').value = item ? (item.description || '') : '';
  document.getElementById('item-sides').value = item ? (item.includes_sides || '') : '';
  document.getElementById('item-best-value').checked = item ? item.is_best_value : false;
  document.getElementById('item-image-url').value = item ? (item.image_url || '') : '';

  title.innerText = item ? 'Edit Menu Item' : 'Add New Menu Item';
  modal.classList.remove('hidden');
}

function openSlideModal() {
  const modal = document.getElementById('slide-modal');
  if (!modal) return;

  document.getElementById('slide-title-input').value = '';
  document.getElementById('slide-url-input').value = '';
  document.getElementById('slide-poster-input').value = '';
  document.getElementById('slide-type-input').value = 'image';
  document.getElementById('slide-order-input').value = adminSlides.length + 1;

  modal.classList.remove('hidden');
}

function closeModal(modalId) {
  document.getElementById(modalId)?.classList.add('hidden');
}

async function handleSaveMenuItem(e) {
  e.preventDefault();
  const id = document.getElementById('item-id').value;
  const item = {
    id: id || undefined,
    name: document.getElementById('item-name').value,
    category: document.getElementById('item-category').value,
    price: parseFloat(document.getElementById('item-price').value),
    set_info: document.getElementById('item-set-info').value || null,
    description: document.getElementById('item-description').value || null,
    includes_sides: document.getElementById('item-sides').value || null,
    is_best_value: document.getElementById('item-best-value').checked,
    in_stock: true,
    image_url: document.getElementById('item-image-url').value || 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80'
  };

  try {
    await saveMenuItem(item);
    closeModal('item-modal');
    await refreshMenuItemsTable();
  } catch (err) {
    alert('Error saving menu item: ' + err.message);
  }
}

async function handleSaveSlide(e) {
  e.preventDefault();
  const slide = {
    title: document.getElementById('slide-title-input').value,
    type: document.getElementById('slide-type-input').value,
    url: document.getElementById('slide-url-input').value,
    poster_url: document.getElementById('slide-poster-input').value || null,
    display_order: parseInt(document.getElementById('slide-order-input').value, 10) || 1,
    is_active: true
  };

  try {
    await saveSlideshowSlide(slide);
    closeModal('slide-modal');
    await refreshSlideshowTable();
  } catch (err) {
    alert('Error saving slide: ' + err.message);
  }
}

// Direct Cloudinary Upload Integration
function setupMediaUploader() {
  const itemImageUploadBtn = document.getElementById('btn-upload-item-image');
  const slideMediaUploadBtn = document.getElementById('btn-upload-slide-media');

  itemImageUploadBtn?.addEventListener('click', () => {
    triggerCloudinaryWidget((url) => {
      document.getElementById('item-image-url').value = url;
    }, 'image');
  });

  slideMediaUploadBtn?.addEventListener('click', () => {
    const slideType = document.getElementById('slide-type-input').value;
    triggerCloudinaryWidget((url) => {
      document.getElementById('slide-url-input').value = url;
    }, slideType);
  });
}

function triggerCloudinaryWidget(onSuccessCallback, resourceType = 'auto') {
  // Check if Cloudinary Widget script is loaded
  if (window.cloudinary && CONFIG.CLOUDINARY_CLOUD_NAME !== 'demo') {
    const widget = window.cloudinary.createUploadWidget({
      cloudName: CONFIG.CLOUDINARY_CLOUD_NAME,
      uploadPreset: CONFIG.CLOUDINARY_UPLOAD_PRESET,
      folder: CONFIG.CLOUDINARY_FOLDER,
      resourceType: resourceType,
      sources: ['local', 'camera', 'url'],
      multiple: false
    }, (error, result) => {
      if (error) {
        alert(getCloudinaryUploadErrorMessage(error));
        return;
      }

      if (result && result.event === 'success') {
        onSuccessCallback(result.info.secure_url);
      }
    });
    widget.open();
  } else {
    // Standard File Input Prompt fallback if Cloudinary credentials are not configured yet
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = resourceType === 'video' ? 'video/*' : 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        alert(`File "${file.name}" selected. (Tip: Configure your Cloudinary Cloud Name in .env for direct automatic CDN uploads).`);
        // Simulate uploaded URL using object URL for local preview
        const localUrl = URL.createObjectURL(file);
        onSuccessCallback(localUrl);
      }
    };
    input.click();
  }
}

function getCloudinaryUploadErrorMessage(error) {
  const rawMessage = error?.message || error?.statusText || String(error || '');

  if (rawMessage.toLowerCase().includes('upload preset')) {
    return `Cloudinary upload preset "${CONFIG.CLOUDINARY_UPLOAD_PRESET}" was not found for cloud "${CONFIG.CLOUDINARY_CLOUD_NAME}". Create an unsigned upload preset with that exact name in Cloudinary, or update VITE_CLOUDINARY_UPLOAD_PRESET to the preset that already exists.`;
  }

  return `Cloudinary upload failed: ${rawMessage}`;
}
