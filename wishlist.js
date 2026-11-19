(function () {
  function readWishlist() {
    var value=localStorage.getItem("stackly-wishlist");
    if(!value)return [];
    try{return JSON.parse(value);}catch(error){console.error("Could not read Stackly wishlist from local storage.",error);return [];}
  }
  function saveWishlist(ids) {
    localStorage.setItem("stackly-wishlist",JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent("stackly:store-updated"));
    renderWishlist();
  }
  function toggleWishlist(id) {
    var ids=readWishlist();
    if(ids.indexOf(id)!==-1) ids=ids.filter(function(item){return item!==id;});
    else ids.push(id);
    saveWishlist(ids);
  }
  function renderWishlist() {
    var root=document.getElementById("wishlist-products");
    if(!root)return;
    var products=(window.STACKLY_PRODUCTS||[]).filter(function(product){return readWishlist().indexOf(product.id)!==-1;});
    root.innerHTML=products.map(window.stacklyProductCard).join("");
    var empty=document.getElementById("wishlist-empty");
    if(empty)empty.classList.toggle("hidden",products.length>0);
  }
  document.addEventListener("DOMContentLoaded",function(){
    renderWishlist();
    document.addEventListener("click",function(event){
      var button=event.target.closest("[data-wishlist]");
      if(button) {
        toggleWishlist(button.dataset.wishlist);
        button.classList.toggle("active",readWishlist().indexOf(button.dataset.wishlist)!==-1);
        button.textContent=readWishlist().indexOf(button.dataset.wishlist)!==-1?"♥":"♡";
      }
    });
    window.addEventListener("stackly:store-updated",renderWishlist);
    window.addEventListener("storage",function(event){if(event.key==="stackly-wishlist")renderWishlist();});
  });
  window.StacklyWishlist={toggle:toggleWishlist,get:readWishlist};
})();
