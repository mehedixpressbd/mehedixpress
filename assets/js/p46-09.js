(()=>{ "use strict";
 const fallback = "assets/images/p46/51b7fc68a677eb.svg";
 document.addEventListener('error',(event)=>{
  const img=event.target;
  if(!(img instanceof HTMLImageElement)||img.dataset.mx45Fallback==='1')return;
  if(!img.closest('#products,#wishlist-section,#newGrid,#popularGrid,#grid,#wishlistGrid,#cart,#detail,.mx-product-card,.product-card'))return;
  img.dataset.mx45Fallback='1'; img.onerror=null;img.src=fallback;
 },true);
})();