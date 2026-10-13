/* P45 inline copy of assets/js/mx-p43-reliability.js; original JavaScript function bodies retained. */
/* P43 additive reliability layer. No Firebase, payments, stock or order mutations. */
(() => {"use strict";
 const PHOTO_FALLBACK = 'assets/images/p46/51b7fc68a677eb.svg';
 const wire = () => {
   const rail=document.querySelector('.mx42-category-scroll');
   const buttons=[...document.querySelectorAll('[data-mx43-scroll]')];
   if(rail && buttons.length){
     const state=()=>{
       const max=rail.scrollWidth-rail.clientWidth;
       buttons.forEach(b=>{b.disabled=b.dataset.mx43Scroll==='prev'?rail.scrollLeft<=2:rail.scrollLeft>=max-2;});
     };
     buttons.forEach(button=>button.addEventListener('click',()=>{
       const step=Math.max(210,Math.round(rail.clientWidth*.75));
       rail.scrollBy({left:step*(button.dataset.mx43Scroll==='next'?1:-1),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
     }));
     rail.addEventListener('scroll',state,{passive:true});
     window.addEventListener('resize',state,{passive:true});
     state();
   }
 };
 // Product photos from Firebase can be missing, expired or invalid. Display a local image
 // rather than the browser's broken-image icon, without changing product data.
 document.addEventListener('error',event=>{
   const img=event.target;
   if(!(img instanceof HTMLImageElement) || img.dataset.mx43Recovered==='1')return;
   if(!img.closest('.mx-product-card, .product-card, .mx42-category-rail, .mx-hero, .mx-category-section, #cart, #detail, #products, #wishlist-section'))return;
   img.dataset.mx43Recovered='1';
   // Old product templates use inline onerror handlers; disable them before replacing,
   // or a missing fallback image can trigger an error loop.
   img.onerror=null;
   img.src=PHOTO_FALLBACK;
 },true);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire,{once:true});else wire();
})();
