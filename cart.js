(function () {
  var products = window.STACKLY_PRODUCTS || [];
  function read(key) {
    var value = localStorage.getItem(key);
    if (!value) return [];
    try { return JSON.parse(value); } catch (error) {
      console.error("Could not read Stackly data from local storage.", error);
      return [];
    }
  }
  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("stackly:store-updated"));
  }
  function find(id) { return products.find(function (item) { return item.id === id; }); }
  function cart() { return read("stackly-cart"); }
  function saveCart(lines) { save("stackly-cart", lines); renderCart(); }
  function addToCart(id, quantity) {
    var product = find(id);
    if (!product || product.label === "Sold out") return false;
    var lines = cart();
    var line = lines.find(function (item) { return item.id === id; });
    if (line) line.quantity += Math.max(1, Number(quantity) || 1);
    else lines.push({id:id, quantity:Math.max(1, Number(quantity) || 1)});
    saveCart(lines);
    return true;
  }
  function removeFromCart(id) {
    saveCart(cart().filter(function (line) { return line.id !== id; }));
  }
  function changeQuantity(id, amount) {
    var lines = cart();
    var line = lines.find(function (item) { return item.id === id; });
    if (!line) return;
    line.quantity = Math.max(1, Math.min(99, line.quantity + amount));
    saveCart(lines);
  }
  function money(value) { return "$"+value.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function renderCart() {
    var root = document.getElementById("cart-content");
    if (!root) return;
    var lines = cart().filter(function (line) { return !!find(line.id); });
    if (!lines.length) {
      root.innerHTML = '<div class="empty-state"><p>Your cart is ready for something great.</p><a class="button button-orange" href="products.html">Explore products <span>→</span></a></div>';
      return;
    }
    var subtotal = lines.reduce(function(sum,line){return sum+find(line.id).price*line.quantity;},0);
    root.innerHTML = '<div class="cart-layout"><div><table class="cart-table"><thead><tr><th>Product</th><th>Price</th><th>Quantity</th><th>Subtotal</th><th></th></tr></thead><tbody>'+lines.map(function(line){
      var product=find(line.id);
      return '<tr><td><div class="cart-product"><a href="product-details.html?id='+encodeURIComponent(product.id)+'"><img src="'+product.image+'" alt="'+window.stacklyEscape(product.name)+'"></a><div><b><a href="product-details.html?id='+encodeURIComponent(product.id)+'">'+window.stacklyEscape(product.name)+'</a></b><small>'+window.stacklyEscape(product.category)+'</small></div></div></td><td>'+money(product.price)+'</td><td><div class="quantity-field"><button type="button" data-cart-change="-1" data-id="'+product.id+'" aria-label="Decrease quantity">−</button><input value="'+line.quantity+'" readonly aria-label="Quantity"><button type="button" data-cart-change="1" data-id="'+product.id+'" aria-label="Increase quantity">+</button></div></td><td><b>'+money(product.price*line.quantity)+'</b></td><td><button class="remove-item" type="button" data-cart-remove="'+product.id+'" aria-label="Remove '+window.stacklyEscape(product.name)+'">×</button></td></tr>';
    }).join("")+'</tbody></table></div><aside class="cart-summary"><h2>Cart total</h2><div class="summary-row"><span>Subtotal</span><strong>'+money(subtotal)+'</strong></div><div class="summary-row"><span>Shipping</span><strong>Free</strong></div><div class="summary-row total"><span>Total</span><strong>'+money(subtotal)+'</strong></div><button class="button button-orange" type="button" id="checkout-demo">Proceed to checkout <span>→</span></button><p class="form-message" id="checkout-message" role="status"></p></aside></div>';
    var checkout = document.getElementById("checkout-demo");
    if (checkout) checkout.addEventListener("click", function(){
      var message=document.getElementById("checkout-message");
      message.textContent="Checkout is a demo only; no payment will be collected.";
    });
  }
  function toggleCompare(id) {
    var list=read("stackly-compare");
    if(list.indexOf(id)!==-1) list=list.filter(function(item){return item!==id;});
    else if(list.length>=4) { window.alert("You can compare up to four products at a time."); return; }
    else list.push(id);
    save("stackly-compare",list);
    renderCompare();
  }
  function renderCompare() {
    var root=document.getElementById("compare-content");
    if(!root)return;
    var list=read("stackly-compare").map(find).filter(Boolean);
    if(!list.length){root.innerHTML='<div class="compare-empty"><p>No products to compare yet.</p><a class="button button-orange" href="products.html">Browse products <span>→</span></a></div>';return;}
    root.innerHTML='<table class="compare-table"><tbody><tr><th>Product</th>'+list.map(function(p){return '<td><img src="'+p.image+'" alt="'+window.stacklyEscape(p.name)+'"><b>'+window.stacklyEscape(p.name)+'</b><p><button class="remove-item" data-compare-remove="'+p.id+'" type="button">Remove</button></p></td>';}).join("")+'</tr><tr><th>Price</th>'+list.map(function(p){return '<td><strong>'+money(p.price)+'</strong></td>';}).join("")+'</tr><tr><th>Rating</th>'+list.map(function(p){return '<td>★ '+p.rating+' / 5 <small>('+p.reviews+' reviews)</small></td>';}).join("")+'</tr><tr><th>Category</th>'+list.map(function(p){return '<td>'+window.stacklyEscape(p.category)+'</td>';}).join("")+'</tr><tr><th>Availability</th>'+list.map(function(p){return '<td>'+(p.label==="Sold out"?"Out of stock":"In stock")+'</td>';}).join("")+'</tr><tr><th></th>'+list.map(function(p){return '<td><a class="button button-orange" href="product-details.html?id='+encodeURIComponent(p.id)+'">View product</a></td>';}).join("")+'</tr></tbody></table>';
  }
  document.addEventListener("DOMContentLoaded", function(){
    renderCart();
    renderCompare();
    document.addEventListener("click",function(event){
      var remove=event.target.closest("[data-cart-remove]");
      if(remove){removeFromCart(remove.dataset.cartRemove);return;}
      var change=event.target.closest("[data-cart-change]");
      if(change)changeQuantity(change.dataset.id,Number(change.dataset.cartChange));
      var compareRemove=event.target.closest("[data-compare-remove]");
      if(compareRemove){save("stackly-compare",read("stackly-compare").filter(function(id){return id!==compareRemove.dataset.compareRemove;}));renderCompare();}
    });
    window.addEventListener("stackly:store-updated",renderCart);
    window.addEventListener("storage",function(event){if(event.key==="stackly-cart"||event.key==="stackly-compare") {renderCart();renderCompare();}});
  });
  window.StacklyStore={addToCart:addToCart,removeFromCart:removeFromCart,toggleCompare:toggleCompare,getCart:cart};
})();
