(function () {
  var categories = window.STACKLY_CATEGORIES || ["All Products","Computer & Laptop","Smartphone","Headphones","Accessories","Camera & Photo","TV & Homes","Gaming"];
  var productList = window.STACKLY_PRODUCTS || [];
  window.stacklyEscape = window.stacklyEscape || function (value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[character];
    });
  };
  var productById = function (id) { return productList.find(function (item) { return item.id === id; }); };
  var header = '<div class="utility-strip"><div class="wrap utility-inner"><div class="utility-left"><span>Welcome to Stackly</span><span>Follow us</span><div class="social-mini" aria-label="Social links"><a href="https://www.instagram.com/thestackly" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram">ig</a><a href="https://www.facebook.com/people/Stackly-Stackly/pfbid02NmgSaxmeD8WJngqrhKudvxzak9GvzPLz6YS9NMdJJM9rSeJ7ZTyG6h3HF3p3koBEl/?rdid=3qmngFeLJe3ChGfe&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1BrqaZkJRe%2F" target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook">f</a><a href="https://x.com/The_Stackly" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" title="X (Twitter)">x</a><a href="https://www.linkedin.com/company/the-stackly/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn">in</a></div></div><div class="utility-right"><label><span class="sr-only">Language</span><select aria-label="Language"><option>English</option><option>Español</option><option>Français</option></select></label><label><span class="sr-only">Currency</span><select aria-label="Currency"><option>USD $</option><option>EUR €</option><option>GBP £</option></select></label></div></div></div>'+
    '<div class="main-header"><div class="wrap header-inner"><a class="brand" href="index.html" aria-label="Stackly home"><span class="brand-mark">S</span>stackly</a><form class="search-form" id="site-search"><input type="search" name="q" placeholder="Search for products..." aria-label="Search products"><select name="category" aria-label="Search category"><option value="">All Categories</option>'+categories.slice(1).map(function(c){return '<option value="'+window.stacklyEscape(c)+'">'+window.stacklyEscape(c)+'</option>';}).join("")+'</select><button aria-label="Search" type="submit">⌕</button></form><div class="header-actions"><a class="header-action" href="wishlist.html" aria-label="Wishlist"><span class="action-icon">♡</span><span class="count-badge" id="wishlist-count">0</span><small>Wishlist</small></a><a class="header-action" href="cart.html" aria-label="Shopping cart"><span class="action-icon">▱</span><span class="count-badge" id="cart-count">0</span><small>Cart</small></a><a class="header-action profile-action" href="signin.html" aria-label="Sign in"><span class="action-icon">♙</span><small>Account</small></a><button class="mobile-menu-button" type="button" aria-label="Open navigation menu" aria-expanded="false">☰</button></div></div></div>'+
    '<div class="nav-row" id="nav-row"><nav class="wrap nav-inner" aria-label="Main navigation"><div class="category-nav"><span class="hamburger-mark">☷</span><button type="button" id="category-menu-toggle" aria-expanded="false">All Categories⌄</button><div class="category-menu" id="category-menu">'+categories.slice(1).map(function(c){return '<a href="products.html?category='+encodeURIComponent(c)+'">'+window.stacklyEscape(c)+'</a>';}).join("")+'</div></div><a class="nav-link" href="track-order.html">Track Order</a><a class="nav-link" href="compare.html">Compare</a><a class="nav-link" href="contact.html">Contact Us</a><a class="nav-link nav-help" href="contact.html">Need Help?</a><a class="nav-phone" href="tel:+18005550198">☎ +1 (800) 555-0198</a></nav></div>';
  var footer = '<footer class="site-footer"><div class="wrap footer-main"><section class="footer-column"><a class="brand footer-brand" href="index.html"><span class="brand-mark">S</span>stackly</a><p>Thoughtful technology for the way you live, work and play.</p><p class="support-caption">Customer Support</p><a class="support-phone" href="tel:+18005550198">+1 (800) 555-0198</a><p>Available every day, 24 hours</p></section><section class="footer-column"><h3>Top Categories</h3><a href="products.html?category=Computer%20%26%20Laptop">Computer & Laptop</a><a href="products.html?category=Smartphone">Smartphone</a><a href="products.html?category=Headphones">Headphones</a><a href="products.html?category=Accessories">Accessories</a><a href="products.html?category=TV%20%26%20Homes">TV & Homes</a></section><section class="footer-column"><h3>Quick Links</h3><a href="products.html">Shop Products</a><a href="track-order.html">Track Order</a><a href="compare.html">Compare Products</a><a href="wishlist.html">My Wishlist</a><a href="signin.html">My Account</a><a href="contact.html">Contact Us</a></section><section class="footer-column"><h3>Download App</h3><p>Shop your favorites on the go.</p><div class="store-badges"><a class="store-badge" href="404.html"><b>▶</b><span>GET IT ON<br><strong>Google Play</strong></span></a><a class="store-badge" href="404.html"><b>●</b><span>Download on the<br><strong>App Store</strong></span></a></div></section><section class="footer-column"><h3>Popular Tags</h3><div class="tag-cloud"><a href="products.html?category=Gaming">Gaming</a><a href="products.html?category=Smartphone">Smartphones</a><a href="products.html?category=Computer%20%26%20Laptop">Laptops</a><a href="products.html?category=Headphones">Audio</a><a href="products.html?category=Accessories">Accessories</a><a href="products.html">New arrivals</a><a href="products.html">Best deals</a></div></section></div><div class="footer-bottom wrap"><span>© 2025 Stackly. All rights reserved.</span><span class="payment-list" aria-label="Accepted payment methods">VISA · ●Pay · AMEX · ◉</span><span>Demo storefront · Terms &nbsp; Privacy</span></div></footer>';


  function renderShell() {
    if (!document.querySelector('link[data-stackly-components]')) {
      var components = document.createElement("link");
      components.rel = "stylesheet";
      components.href = "components.css";
      components.dataset.stacklyComponents = "true";
      document.head.appendChild(components);
    }
    var headerNode = document.getElementById("site-header");
    var footerNode = document.getElementById("site-footer");
    if (headerNode) headerNode.innerHTML = header;
    if (footerNode) footerNode.innerHTML = footer;
  }
  function syncCounts() {
    var cartCount = document.getElementById("cart-count");
    var wishCount = document.getElementById("wishlist-count");
    var cart = readStoredArray("stackly-cart");
    var wish = readStoredArray("stackly-wishlist");
    if (cartCount) cartCount.textContent = cart.reduce(function (sum, line) { return sum + line.quantity; }, 0);
    if (wishCount) wishCount.textContent = wish.length;
    var session = localStorage.getItem("stackly-demo-session");
    var profile = document.querySelector(".profile-action");
    if (profile && session) {
      try {
        var user = JSON.parse(session);
        profile.href = "signin.html";
        profile.querySelector("small").textContent = user.name ? "Hi, "+user.name.split(" ")[0] : "Account";
        if (!document.querySelector(".header-action.logout-action")) {
          var logoutBtn = document.createElement("button");
          logoutBtn.className = "header-action logout-action";
          logoutBtn.type = "button";
          logoutBtn.title = "Sign out of your account";
          logoutBtn.style.cssText = "background:none;border:none;cursor:pointer;display:inline-flex;flex-direction:column;align-items:center;";
          logoutBtn.innerHTML = '<span class="action-icon">⎋</span><small>Logout</small>';
          logoutBtn.addEventListener("click", function() {
            if (typeof window.stacklyLogout === "function") {
              window.stacklyLogout();
            } else {
              localStorage.removeItem("stackly-auth-token");
              localStorage.removeItem("stackly-demo-session");
              location.href = "signin.html";
            }
          });
          profile.insertAdjacentElement("afterend", logoutBtn);
        }
      } catch (error) {
        console.error("Could not read Stackly demo session.", error);
      }
    }
  }
  function readStoredArray(key) {
    var value=localStorage.getItem(key);
    if(!value)return [];
    try { var parsed=JSON.parse(value); return Array.isArray(parsed)?parsed:[]; }
    catch(error) { console.error("Could not read "+key+" from local storage.",error); return []; }
  }
  function renderProductPage() {
    var featured = document.getElementById("featured-products");
    if (featured) featured.innerHTML = productList.slice(0, Number(featured.dataset.limit || 8)).map(window.stacklyProductCard).join("");
    var listing = document.getElementById("all-products");
    if (listing) {
      var params = new URLSearchParams(location.search);
      var category = params.get("category") || "";
      var search = (params.get("q") || "").trim();
      var heading = document.querySelector(".page-title h1");
      if (heading && category) heading.textContent = category;
      var searchInput = document.querySelector('#site-search input[name="q"]');
      if (searchInput) searchInput.value = search;
      var catSelect = document.querySelector('#site-search select[name="category"]');
      if (catSelect && categories.indexOf(category) !== -1) catSelect.value = category;
      var filters = document.getElementById("category-filters");
      if (filters) filters.innerHTML = categories.map(function (item) {
        var target = item === "All Products" ? "products.html" : "products.html?category="+encodeURIComponent(item);
        var selected = item === "All Products" ? !category : item === category;
        return '<a class="'+(selected?"selected":"")+'" href="'+target+'">'+window.stacklyEscape(item)+'<span>›</span></a>';
      }).join("");
      var results = productList.filter(function (p) {
        var matchesCategory = !category || p.category === category;
        var haystack = (p.name+" "+p.category+" "+p.description).toLowerCase();
        return matchesCategory && (!search || haystack.indexOf(search.toLowerCase()) !== -1);
      });
      var sortSelect = document.getElementById("sort-products");
      var mobileSort = document.getElementById("sort-products-mobile");
      var sortValue = sortSelect ? sortSelect.value : "featured";
      if (sortSelect) sortSelect.addEventListener("change", function(){ if(mobileSort)mobileSort.value=this.value; updateListingSort(this.value); });
      if (mobileSort) mobileSort.addEventListener("change", function(){ if(sortSelect)sortSelect.value=this.value; updateListingSort(this.value); });
      function updateListingSort(value) {
        var sorted = results.slice();
        if (value === "price-low") sorted.sort(function(a,b){return a.price-b.price;});
        if (value === "price-high") sorted.sort(function(a,b){return b.price-a.price;});
        if (value === "rating") sorted.sort(function(a,b){return b.rating-a.rating;});
        listing.innerHTML = sorted.map(window.stacklyProductCard).join("");
        var empty = document.getElementById("no-products");
        if (empty) empty.classList.toggle("hidden", sorted.length > 0);
        var count = document.getElementById("results-count");
        if (count) count.textContent = sorted.length+" products";
      }
      updateListingSort(sortValue);
    }
    var detail = document.getElementById("product-detail");
    if (detail) {
      var id = new URLSearchParams(location.search).get("id");
      var product = productById(id) || productList[0];
      document.title = product.name+" — Stackly";
      detail.innerHTML = '<section class="detail-layout"><div class="detail-image"><img src="'+product.image+'" alt="'+window.stacklyEscape(product.name)+'"></div><div class="detail-copy"><span class="eyebrow">'+window.stacklyEscape(product.category)+'</span><h1>'+window.stacklyEscape(product.name)+'</h1><div class="product-rating">★★★★★ <span>'+product.rating+' · '+product.reviews+' reviews</span></div><p>'+window.stacklyEscape(product.description)+'</p><div class="detail-price">$'+product.price.toLocaleString("en-US",{minimumFractionDigits:2})+' <del style="font-size:13px;color:#99a0a4;font-weight:400">$'+product.oldPrice.toLocaleString("en-US",{minimumFractionDigits:2})+'</del></div><p class="detail-stock">✓ In stock — ready to ship</p><div class="detail-actions"><div class="quantity-field"><button type="button" data-quantity="-1" aria-label="Decrease quantity">−</button><input id="detail-quantity" value="1" min="1" max="99" type="number" aria-label="Quantity"><button type="button" data-quantity="1" aria-label="Increase quantity">+</button></div><button class="button button-orange" type="button" data-detail-add="'+product.id+'">Add to cart</button></div><div class="detail-actions"><button class="button button-outline" type="button" data-wishlist="'+product.id+'">♡ Add to wishlist</button><button class="button button-outline" type="button" data-compare="'+product.id+'">⇄ Compare</button></div></div></section>';
    }
  }
  function showQuickView(product) {
    var overlay = document.createElement("div");
    overlay.className = "quick-overlay";
    overlay.innerHTML = '<section class="quick-modal" role="dialog" aria-modal="true" aria-label="Quick view: '+window.stacklyEscape(product.name)+'"><button class="quick-close" aria-label="Close quick view">×</button><div class="quick-image"><img src="'+product.image+'" alt="'+window.stacklyEscape(product.name)+'"></div><div class="quick-copy"><span class="eyebrow">'+window.stacklyEscape(product.category)+'</span><h2>'+window.stacklyEscape(product.name)+'</h2><div class="product-rating">★★★★★ <span>'+product.rating+' · '+product.reviews+' reviews</span></div><p>'+window.stacklyEscape(product.description)+'</p><strong class="quick-price">$'+product.price.toFixed(2)+'</strong><div><button class="button button-orange" type="button" data-add-cart="'+product.id+'">Add to cart</button> <a class="button button-outline" href="product-details.html?id='+encodeURIComponent(product.id)+'">Full details</a></div></div></section>';
    document.body.appendChild(overlay);
    function close() { overlay.remove(); document.removeEventListener("keydown", onKey); }
    function onKey(event) { if (event.key === "Escape") close(); }
    overlay.addEventListener("click", function(event) { if (event.target === overlay || event.target.closest(".quick-close")) close(); });
    document.addEventListener("keydown", onKey);
  }
  function carousel() {
    var hero = document.querySelector(".hero-main");
    if (!hero) return;
    var slides = [
      {eyebrow:"LEVEL UP YOUR PLAY",title:"Power your<br>next adventure.",description:"Meet the Xbox Series X. The fastest, most powerful Xbox ever.",price:"$499.00",image:"https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1000&q=85",category:"Gaming"},
      {eyebrow:"SMARTER BY GOOGLE",title:"Make every<br>moment brilliant.",description:"Meet Pixel. A little more helpful, every single day.",price:"$699.00",image:"https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=85",category:"Smartphone"},
      {eyebrow:"SOUND THAT MOVES YOU",title:"Find your<br>own frequency.",description:"Immersive audio and all-day comfort, wherever life takes you.",price:"$119.00",image:"https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=1000&q=85",category:"Headphones"}
    ];
    var buttons = hero.querySelectorAll(".hero-dots button");
    var index = 0;
    function show(i) {
      index = i;
      var slide = slides[i];
      hero.querySelector(".eyebrow").textContent = slide.eyebrow;
      hero.querySelector("h1").innerHTML = slide.title;
      hero.querySelector(".hero-copy p").textContent = slide.description;
      hero.querySelector(".hero-price strong").textContent = slide.price;
      hero.querySelector(".hero-product").src = slide.image;
      hero.querySelector(".hero-copy .button").href = "products.html?category="+encodeURIComponent(slide.category);
      buttons.forEach(function (button, buttonIndex) { button.classList.toggle("active", buttonIndex === i); });
    }
    buttons.forEach(function (button, i) { button.addEventListener("click", function(){ show(i); }); });
    window.setInterval(function(){ show((index+1)%slides.length); }, 6500);
  }
  function countdown() {
    var node = document.getElementById("deal-countdown");
    if (!node) return;
    var remaining = 8*3600+12*60+45;
    window.setInterval(function(){
      remaining = remaining > 0 ? remaining-1 : 24*3600-1;
      var hours=Math.floor(remaining/3600), minutes=Math.floor((remaining%3600)/60), seconds=remaining%60;
      node.textContent=[hours,minutes,seconds].map(function(v){return String(v).padStart(2,"0");}).join(" : ");
    },1000);
  }
  function ready() {
    renderShell();
    renderProductPage();
    syncCounts();
    carousel();
    countdown();
    var search = document.getElementById("site-search");
    if (search) search.addEventListener("submit", function(event) {
      event.preventDefault();
      var data = new FormData(search);
      var query = new URLSearchParams();
      if (data.get("q")) query.set("q", data.get("q").trim());
      if (data.get("category")) query.set("category", data.get("category"));
      location.href = "products.html"+(query.toString() ? "?"+query.toString() : "");
    });
    var categoryToggle = document.getElementById("category-menu-toggle");
    var categoryMenu = document.getElementById("category-menu");
    if (categoryToggle && categoryMenu) categoryToggle.addEventListener("click", function(){
      var open = categoryMenu.classList.toggle("open");
      categoryToggle.setAttribute("aria-expanded", String(open));
    });
    var menuButton = document.querySelector(".mobile-menu-button");
    var navRow = document.getElementById("nav-row");
    if (menuButton && navRow) menuButton.addEventListener("click", function(){
      var open = navRow.classList.toggle("mobile-open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", function(event) {
      var add = event.target.closest("[data-add-cart], [data-detail-add]");
      if (add && window.StacklyStore) {
        var id = add.dataset.addCart || add.dataset.detailAdd;
        var quantity = add.dataset.detailAdd ? Number(document.getElementById("detail-quantity").value) : 1;
        window.StacklyStore.addToCart(id, quantity);
        add.textContent = "Added to cart";
        window.setTimeout(function(){ if(add.isConnected) add.textContent = add.dataset.detailAdd ? "Add to cart" : "Add to cart"; }, 1100);
        return;
      }
      var compare = event.target.closest("[data-compare]");
      if (compare && window.StacklyStore) { window.StacklyStore.toggleCompare(compare.dataset.compare); return; }
      var quick = event.target.closest("[data-quick]");
      if (quick) {
        var product = productById(quick.dataset.quick);
        if (product) showQuickView(product);
        return;
      }
      var quantityButton = event.target.closest("[data-quantity]");
      if (quantityButton) {
        var field = document.getElementById("detail-quantity");
        if (field) field.value = Math.max(1, Math.min(99, Number(field.value || 1) + Number(quantityButton.dataset.quantity)));
      }
    });
    var goBack = document.getElementById("go-back");
    if (goBack) goBack.addEventListener("click", function(){ if (history.length > 1) history.back(); else location.href = "index.html"; });
    var track = document.getElementById("track-form");
    if (track) track.addEventListener("submit", function(event){
      event.preventDefault();
      document.getElementById("track-message").textContent = "This is a demo storefront. No matching order status is available.";
    });
    window.addEventListener("storage", syncCounts);
    window.addEventListener("stackly:store-updated", syncCounts);
  }
  document.addEventListener("DOMContentLoaded", ready);
})();
