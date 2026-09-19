import { fetchSlideshowSlides } from './supabase.js';

class SlideshowPlayer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.slides = [];
    this.currentIndex = 0;
    this.timer = null;
    this.isMuted = true;
    this.slideDuration = 5000; // 5 seconds default for images
    this.videoDuration = 7000; // play the first 7 seconds of each video
  }

  async init() {
    if (!this.container) return;
    
    this.slides = await fetchSlideshowSlides();
    if (!this.slides || this.slides.length === 0) {
      this.container.innerHTML = `<div class="p-8 text-center text-brand-darkbrown font-medium">No slideshow media loaded.</div>`;
      return;
    }

    this.render();
    this.setupEvents();
    this.showSlide(0);
  }

  render() {
    this.container.innerHTML = `
      <div class="relative w-full h-[420px] md:h-[540px] rounded-3xl overflow-hidden shadow-warm-lg border border-brand-creamDark bg-brand-dark">
        
        <!-- Slides Wrapper -->
        <div id="slides-wrapper" class="relative w-full h-full">
          ${this.slides.map((slide, index) => this.createSlideHTML(slide, index)).join('')}
        </div>

        <!-- Gradient Overlays for contrast -->
        <div class="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-brand-dark/20 pointer-events-none"></div>

        <!-- Slide Overlay Content (Title & Badge) -->
        <div class="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8 z-20 flex flex-col md:flex-row md:items-end justify-between gap-4 pointer-events-none">
          <div class="max-w-xl">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-gold text-brand-darkbrown uppercase tracking-wider mb-2 shadow-sm">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
              Fresh Daily
            </span>
            <h3 id="slide-title" class="text-2xl md:text-3xl font-serif font-bold text-white drop-shadow-md leading-tight">
              ${this.slides[0]?.title || 'Savour the bite, Day and night'}
            </h3>
          </div>

          <!-- Controls Bar -->
          <div class="flex items-center gap-3 pointer-events-auto">
            <!-- Mute/Unmute for Videos -->
            <button id="slideshow-mute-btn" class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white flex items-center justify-center transition-all" title="Toggle Sound">
              <svg id="icon-muted" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg>
              <svg id="icon-unmuted" class="w-5 h-5 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
            </button>

            <!-- Next / Prev -->
            <button id="slideshow-prev" class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white flex items-center justify-center transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button id="slideshow-next" class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white flex items-center justify-center transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>

        <!-- Indicators Dots -->
        <div class="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 pointer-events-auto">
          ${this.slides.map((_, index) => `
            <button data-slide-index="${index}" class="slide-dot w-2.5 h-2.5 rounded-full bg-white/40 hover:bg-white transition-all ${index === 0 ? 'w-7 !bg-brand-gold' : ''}"></button>
          `).join('')}
        </div>
      </div>
    `;
  }

  createSlideHTML(slide, index) {
    const activeClass = index === 0 ? 'active' : '';
    
    if (slide.type === 'video') {
      return `
        <div class="slide-item absolute inset-0 w-full h-full ${activeClass}" data-index="${index}" data-type="video">
          <video 
            id="slide-video-${index}"
            class="w-full h-full object-cover" 
            poster="${slide.poster_url || ''}" 
            playsinline 
            muted 
            preload="auto"
          >
            <source src="${slide.url}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>
      `;
    }

    return `
      <div class="slide-item absolute inset-0 w-full h-full ${activeClass}" data-index="${index}" data-type="image">
        <img 
          src="${slide.url}" 
          alt="${slide.title || 'Beyond Bites'}" 
          class="w-full h-full object-cover"
          loading="${index === 0 ? 'eager' : 'lazy'}"
        >
      </div>
    `;
  }

  setupEvents() {
    document.getElementById('slideshow-prev')?.addEventListener('click', () => {
      this.prev();
    });
    document.getElementById('slideshow-next')?.addEventListener('click', () => {
      this.next();
    });

    const muteBtn = document.getElementById('slideshow-mute-btn');
    muteBtn?.addEventListener('click', () => this.toggleMute());

    // Dot indicators
    this.container.querySelectorAll('.slide-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.slideIndex, 10);
        this.showSlide(idx);
      });
    });
  }

  showSlide(index) {
    clearTimeout(this.timer);

    const slideElements = this.container.querySelectorAll('.slide-item');
    const dots = this.container.querySelectorAll('.slide-dot');

    // Pause any playing videos
    slideElements.forEach(el => {
      const vid = el.querySelector('video');
      if (vid) {
        vid.pause();
        vid.currentTime = 0;
      }
      el.classList.remove('active');
    });

    // Reset dots
    dots.forEach((dot, i) => {
      if (i === index) {
        dot.classList.add('w-7', '!bg-brand-gold');
        dot.classList.remove('w-2.5');
      } else {
        dot.classList.remove('w-7', '!bg-brand-gold');
        dot.classList.add('w-2.5');
      }
    });

    this.currentIndex = index;
    const currentSlideEl = slideElements[index];
    const currentSlideData = this.slides[index];

    if (!currentSlideEl) return;
    currentSlideEl.classList.add('active');

    // Update title text smoothly
    const titleEl = document.getElementById('slide-title');
    if (titleEl && currentSlideData) {
      titleEl.innerText = currentSlideData.title || 'Savour the bite, Day and night';
    }

    // Handle video auto-play & custom timer logic
    if (currentSlideData.type === 'video') {
      const videoEl = currentSlideEl.querySelector('video');
      if (videoEl) {
        videoEl.muted = this.isMuted;
        
        // Play video safely
        const playPromise = videoEl.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log('Video autoplay prevented by browser policy, continuing slideshow timer:', error);
          });
        }

      }
    }

    const duration = currentSlideData.type === 'video' ? this.videoDuration : this.slideDuration;
    this.scheduleNext(duration);
  }

  scheduleNext(duration) {
    clearTimeout(this.timer);
    if (this.slides.length <= 1) return;
    this.timer = setTimeout(() => this.next(), duration);
  }

  next() {
    const nextIdx = (this.currentIndex + 1) % this.slides.length;
    this.showSlide(nextIdx);
  }

  prev() {
    const prevIdx = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.showSlide(prevIdx);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    const iconMuted = document.getElementById('icon-muted');
    const iconUnmuted = document.getElementById('icon-unmuted');

    if (this.isMuted) {
      iconMuted?.classList.remove('hidden');
      iconUnmuted?.classList.add('hidden');
    } else {
      iconMuted?.classList.add('hidden');
      iconUnmuted?.classList.remove('hidden');
    }

    const currentVideo = this.container.querySelector('.slide-item.active video');
    if (currentVideo) {
      currentVideo.muted = this.isMuted;
    }
  }
}

export function initSlideshow(containerId = 'hero-slideshow') {
  const player = new SlideshowPlayer(containerId);
  player.init();
  return player;
}
