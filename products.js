window.STACKLY_PRODUCTS = [
  {id:"xbox-series-x",name:"Xbox Series X 1TB Console",category:"Gaming",price:499,oldPrice:549,rating:4.9,reviews:128,label:"Hot",image:"https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=700&q=85",description:"Experience next-generation speed and performance with the Xbox Series X. Play thousands of titles across four generations with a powerful 1TB SSD."},
  {id:"pixel-8-pro",name:"Google Pixel 8 Pro 128GB",category:"Smartphone",price:699,oldPrice:799,rating:4.8,reviews:96,label:"Sale",image:"https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=700&q=85",description:"A brilliant display, incredible camera and helpful AI features come together in a phone designed by Google."},
  {id:"studio-headphones",name:"Studio Wireless Headphones",category:"Headphones",price:189,oldPrice:229,rating:4.7,reviews:84,label:"Hot",image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=85",description:"Sink into rich, balanced sound with comfortable over-ear cushions and wireless freedom for your whole day."},
  {id:"macbook-pro-14",name:"MacBook Pro 14-inch",category:"Computer & Laptop",price:1299,oldPrice:1499,rating:4.9,reviews:152,label:"Sale",image:"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&q=85",description:"Mind-blowing performance and a stunning display make this the ultimate laptop for work, creativity and play."},
  {id:"smart-watch",name:"Active Smart Watch Series 5",category:"Accessories",price:149,oldPrice:179,rating:4.6,reviews:71,label:"",image:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=85",description:"Stay connected and keep your daily goals in sight with a bright display, useful health features and all-day comfort."},
  {id:"mirrorless-camera",name:"Lumix Mirrorless Camera",category:"Camera & Photo",price:849,oldPrice:999,rating:4.8,reviews:58,label:"Sale",image:"https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=700&q=85",description:"Capture your world in stunning detail with a versatile mirrorless camera built for both stills and video."},
  {id:"oled-4k-tv",name:"55-inch OLED 4K Smart TV",category:"TV & Homes",price:1099,oldPrice:1299,rating:4.8,reviews:103,label:"Hot",image:"https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=700&q=85",description:"Bring movies and shows to life with rich contrast, vivid color and smart streaming built right in."},
  {id:"wireless-earbuds",name:"True Wireless Earbuds Pro",category:"Headphones",price:119,oldPrice:149,rating:4.5,reviews:67,label:"",image:"https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=700&q=85",description:"Enjoy clear calls and immersive audio with compact earbuds, a pocket-size charging case and comfortable fit."},
  {id:"ultrabook-15",name:"Everyday 15-inch Laptop",category:"Computer & Laptop",price:799,oldPrice:899,rating:4.6,reviews:44,label:"Sold out",image:"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&q=85",description:"A dependable everyday laptop with a crisp display, a comfortable keyboard and plenty of power for daily tasks."},
  {id:"smartphone-128",name:"Everyday Smartphone 128GB",category:"Smartphone",price:449,oldPrice:499,rating:4.5,reviews:61,label:"",image:"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=85",description:"A polished all-round smartphone with a vibrant display, reliable performance and a camera ready for everyday moments."},
  {id:"portable-speaker",name:"Portable Bluetooth Speaker",category:"Accessories",price:89,oldPrice:109,rating:4.4,reviews:38,label:"",image:"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700&q=85",description:"Take your favorite playlists anywhere with room-filling sound and a compact, travel-friendly design."},
  {id:"gaming-controller",name:"Wireless Gaming Controller",category:"Gaming",price:59,oldPrice:69,rating:4.7,reviews:113,label:"",image:"https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=700&q=85",description:"Play comfortably with responsive controls, precise thumbsticks and wireless connectivity for your setup."}
];

window.STACKLY_CATEGORIES = ["All Products","Computer & Laptop","Smartphone","Headphones","Accessories","Camera & Photo","TV & Homes","Gaming"];

window.stacklyEscape = function(value) {
  return String(value).replace(/[&<>"']/g, function(character) {
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[character];
  });
};

window.stacklyProductCard = function(product) {
  var escapedName = window.stacklyEscape(product.name);
  var label = product.label ? '<span class="product-label '+(product.label==="Hot"?"hot":product.label==="Sold out"?"sold":"")+'">'+window.stacklyEscape(product.label)+'</span>' : "";
  var sold = product.label === "Sold out";
  return '<article class="product-card" data-product-card="'+product.id+'">'+
    '<div class="product-image-wrap">'+label+'<a href="product-details.html?id='+encodeURIComponent(product.id)+'" aria-label="View '+escapedName+'"><img loading="lazy" src="'+product.image+'" alt="'+escapedName+'"></a>'+
    '<div class="product-tools"><button class="icon-button" type="button" data-wishlist="'+product.id+'" aria-label="Add '+escapedName+' to wishlist">♡</button><button class="icon-button" type="button" data-compare="'+product.id+'" aria-label="Compare '+escapedName+'">⇄</button><button class="icon-button" type="button" data-quick="'+product.id+'" aria-label="Quick view '+escapedName+'">⌕</button></div></div>'+
    '<div class="product-info"><div class="product-category">'+window.stacklyEscape(product.category)+'</div><h3 class="product-name"><a href="product-details.html?id='+encodeURIComponent(product.id)+'">'+escapedName+'</a></h3>'+
    '<div class="product-rating" aria-label="'+product.rating+' out of 5 stars">★★★★★ <span>('+product.reviews+')</span></div><div class="product-price"><strong>$'+product.price.toLocaleString("en-US",{minimumFractionDigits:2})+'</strong><del>$'+product.oldPrice.toLocaleString("en-US",{minimumFractionDigits:2})+'</del></div>'+
    '<button class="add-cart" type="button" data-add-cart="'+product.id+'" '+(sold?"disabled":"")+'>'+(sold?"Currently unavailable":"Add to cart")+'</button></div></article>';
};
