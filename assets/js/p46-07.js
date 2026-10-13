/* P45 inline copy of assets/js/mx-p42-header.js; original JavaScript function bodies retained. */
/* P42 header visual categories. Calls existing product-category handler, no Firebase writes. */
(()=>{'use strict';
function start(){
 const rail=document.querySelector('.mx42-category-rail');
 if(!rail)return;
 rail.querySelectorAll('[data-mx-card]').forEach(link=>link.addEventListener('click',ev=>{
  const target=document.querySelector('.mx-category-grid .'+link.dataset.mxCard);
  if(!target)return; // native anchor fallback
  ev.preventDefault();
  target.click(); // existing store.js category filter + product scroll
  // if the original handler was not installed, user may still navigate to products
  if(!document.getElementById('products'))location.hash='categories';
 }));
 document.querySelectorAll('.mx42-category-rail img').forEach(img=>{
  img.addEventListener('error',()=>{
   if(img.dataset.mxFallback)return;
   img.dataset.mxFallback='1';img.src='assets/images/p46/51b7fc68a677eb.svg';
  },{once:true});
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
