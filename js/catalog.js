document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('product-grid');
  const searchInput = document.getElementById('search-input');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const sortSelect = document.getElementById('sort-select');

  if (!grid) return;

  let currentCategory = 'All';
  let currentSearch = '';
  let currentSort = 'default';

  const categoryColors = {
    Electronics: { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)', text: '#6366f1', glow: 'rgba(99,102,241,0.15)' },
    Fashion: { bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.3)', text: '#ec4899', glow: 'rgba(236,72,153,0.15)' },
    Grocery: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', text: '#10b981', glow: 'rgba(16,185,129,0.15)' },
    Stationary: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b', glow: 'rgba(245,158,11,0.15)' },
    Others: { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)', text: '#8b5cf6', glow: 'rgba(139,92,246,0.15)' }
  };

  function renderProducts() {
    grid.innerHTML = '';

    let filtered = window.products.filter(p => {
      const matchCategory = currentCategory === 'All' || p.category === currentCategory;
      const matchSearch = p.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
                          p.description.toLowerCase().includes(currentSearch.toLowerCase());
      return matchCategory && matchSearch;
    });

    // Sort
    if (currentSort === 'low') filtered.sort((a, b) => a.price - b.price);
    else if (currentSort === 'high') filtered.sort((a, b) => b.price - a.price);
    else if (currentSort === 'rating') filtered.sort((a, b) => b.rating - a.rating);

    if (filtered.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-secondary);"><i class="fas fa-search" style="font-size:3rem;margin-bottom:15px;display:block;opacity:0.3;"></i>No products found matching your criteria.</div>';
      return;
    }

    filtered.forEach((product, index) => {
      const cc = categoryColors[product.category] || categoryColors.Others;
      const mrp = Math.round(product.price * 1.3);
      const discount = Math.round(((mrp - product.price) / mrp) * 100);
      const card = document.createElement('a');
      card.href = `product.html?id=${product.id}`;
      card.className = 'product-card animate-fade-in';
      card.style.animationDelay = `${index * 0.04}s`;
      card.style.setProperty('--cat-glow', cc.glow);

      card.innerHTML = `
        <div class="product-img-wrap">
          <span class="product-category" style="background:${cc.bg};color:${cc.text};border:1px solid ${cc.border};">${product.category}</span>
          <span class="discount-badge">${discount}% OFF</span>
          <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
          <div class="img-overlay">
            <span class="quick-view"><i class="fas fa-eye"></i> Quick View</span>
          </div>
        </div>
        <div class="product-info">
          <h3 class="product-title">${product.name}</h3>
          <div class="product-rating-row">
            <span class="rating-badge" style="background:${product.rating >= 4.5 ? '#10b981' : product.rating >= 4 ? '#f59e0b' : '#ef4444'};">
              ${product.rating} <i class="fas fa-star" style="font-size:0.65rem;"></i>
            </span>
            <span class="review-count">(${product.reviews.toLocaleString()})</span>
          </div>
          <div class="product-price-row">
            <span class="product-price" style="color:${cc.text};">₹${product.price.toLocaleString('en-IN')}</span>
            <span class="product-mrp">₹${mrp.toLocaleString('en-IN')}</span>
          </div>
          <button class="btn-add-cart" data-id="${product.id}" style="background:${cc.text};" onclick="event.preventDefault(); event.stopPropagation();">
            <i class="fas fa-shopping-cart"></i> Add to Cart
          </button>
        </div>
      `;
      grid.appendChild(card);
    });

    // Cart buttons
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = parseInt(e.currentTarget.getAttribute('data-id'));
        const product = window.products.find(p => p.id === id);
        if (product) App.addToCart({ id: product.id, name: product.name, price: product.price, image: product.images[0], category: product.category });
      });
    });
  }

  renderProducts();

  searchInput?.addEventListener('input', (e) => { currentSearch = e.target.value; renderProducts(); });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentCategory = e.target.getAttribute('data-category');
      renderProducts();
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => { currentSort = e.target.value; renderProducts(); });
  }

  // Trending Products (top rated)
  const trendingGrid = document.getElementById('trending-grid');
  if (trendingGrid) {
    const trending = [...window.products].sort((a, b) => b.rating - a.rating).slice(0, 4);
    trending.forEach(product => {
      const cc = categoryColors[product.category] || categoryColors.Others;
      const mrp = Math.round(product.price * 1.3);
      trendingGrid.innerHTML += `
        <a href="product.html?id=${product.id}" class="product-card" style="--cat-glow:${cc.glow};">
          <div class="product-img-wrap">
            <span class="product-category" style="background:${cc.bg};color:${cc.text};border:1px solid ${cc.border};">${product.category}</span>
            <span class="discount-badge" style="background:#f59e0b;">⭐ TRENDING</span>
            <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
            <div class="img-overlay"><span class="quick-view"><i class="fas fa-eye"></i> Quick View</span></div>
          </div>
          <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <div class="product-rating-row">
              <span class="rating-badge" style="background:#10b981;">${product.rating} <i class="fas fa-star" style="font-size:.65rem;"></i></span>
              <span class="review-count">(${product.reviews.toLocaleString()})</span>
            </div>
            <div class="product-price-row">
              <span class="product-price" style="color:${cc.text};">₹${product.price.toLocaleString('en-IN')}</span>
              <span class="product-mrp">₹${mrp.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </a>`;
    });
  }

  // Recently Viewed
  const rvSection = document.getElementById('recently-viewed-section');
  const rvGrid = document.getElementById('recently-viewed-grid');
  if (rvSection && rvGrid) {
    const rvIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    if (rvIds.length > 0) {
      rvSection.style.display = 'block';
      rvIds.slice(0, 4).forEach(id => {
        const p = window.products.find(pr => pr.id === id);
        if (p) {
          rvGrid.innerHTML += `
            <a href="product.html?id=${p.id}" style="border-radius:var(--radius-md);overflow:hidden;background:var(--bg-surface);border:1px solid var(--border-color);transition:transform .3s;text-decoration:none;color:inherit;display:block;">
              <img src="${p.images[0]}" alt="${p.name}" style="width:100%;height:160px;object-fit:cover;" loading="lazy">
              <div style="padding:12px;">
                <h4 style="font-size:.9rem;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</h4>
                <span style="color:var(--accent-primary);font-weight:700;">₹${p.price.toLocaleString('en-IN')}</span>
              </div>
            </a>`;
        }
      });
    }
  }
});
