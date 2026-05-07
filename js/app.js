const App = {
  theme: localStorage.getItem('theme') || 'dark',

  init() {
    this.applyTheme(this.theme);
    this.setupThemeToggle();
    this.updateCartBadge();
    this.setupAuthUI();
    this.setupScrollTop();
    this.setupScrollReveal();
    this.setupMobileMenu();
    this.setupHeroSlider();
  },

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    document.querySelectorAll('#theme-icon').forEach(el => {
      el.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });
  },

  setupThemeToggle() {
    document.querySelectorAll('#theme-toggle, #mobile-theme-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme(this.theme);
      });
    });
  },

  getCart() { return JSON.parse(localStorage.getItem('cart')) || []; },

  saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    this.updateCartBadge();
  },

  addToCart(product) {
    const cart = this.getCart();
    const existing = cart.find(item => item.id === product.id);
    if (existing) existing.quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    this.saveCart(cart);
    this.showToast(`${product.name} added to cart!`);
  },

  updateCartBadge() {
    document.querySelectorAll('#cart-badge, .cart-badge-mobile').forEach(badge => {
      const cart = this.getCart();
      const count = cart.reduce((t, i) => t + i.quantity, 0);
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
      badge.style.transform = 'scale(1.2)';
      setTimeout(() => badge.style.transform = 'scale(1)', 200);
    });
  },

  getUser() { return JSON.parse(localStorage.getItem('currentUser')) || null; },

  setupAuthUI() {
    const user = this.getUser();
    document.querySelectorAll('#auth-link, #mobile-auth-link').forEach(link => {
      if (user) {
        link.innerHTML = `<i class="fas fa-user"></i> ${user.name.split(' ')[0]}`;
        link.href = 'profile.html';
      } else {
        link.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        link.href = 'login.html';
      }
    });
  },

  setupScrollTop() {
    const btn = document.getElementById('scroll-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  },

  setupScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  },

  setupMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const drawer = document.getElementById('mobile-drawer');
    const overlay = document.getElementById('mobile-overlay');
    const closeBtn = document.getElementById('mobile-drawer-close');
    if (!menuBtn) return;

    const open = () => { drawer.classList.add('active'); overlay.classList.add('active'); document.body.style.overflow = 'hidden'; };
    const close = () => { drawer.classList.remove('active'); overlay.classList.remove('active'); document.body.style.overflow = ''; };

    menuBtn.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);
    overlay?.addEventListener('click', close);
  },

  setupHeroSlider() {
    const sliderWrapper = document.getElementById('slider-wrapper');
    const dotsContainer = document.getElementById('slider-dots');
    if (!sliderWrapper || !dotsContainer) return;

    const slides = sliderWrapper.querySelectorAll('img');
    let currentSlide = 0;
    
    // Create dots
    slides.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = `slider-dot ${i === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.slider-dot');

    function goToSlide(index) {
      currentSlide = index;
      sliderWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
      dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
    }

    let interval = setInterval(() => {
      goToSlide((currentSlide + 1) % slides.length);
    }, 4000);

    const sliderCont = document.getElementById('hero-slider');
    sliderCont.addEventListener('mouseenter', () => clearInterval(interval));
    sliderCont.addEventListener('mouseleave', () => {
      interval = setInterval(() => {
        goToSlide((currentSlide + 1) % slides.length);
      }, 4000);
    });
  },

  showToast(message) {
    const toast = document.createElement('div');
    Object.assign(toast.style, {
      position: 'fixed', bottom: '20px', left: '50%',
      transform: 'translateX(-50%) translateY(100px)',
      background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover))',
      color: 'white', padding: '14px 28px', borderRadius: 'var(--radius-md)',
      boxShadow: '0 10px 25px rgba(99,102,241,0.4)', zIndex: '9999',
      transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      fontSize: '0.95rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px'
    });
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.transform = 'translateX(-50%) translateY(0)'; });
    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(100px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
