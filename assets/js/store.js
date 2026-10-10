/*
 * Mehedi Xpress — optional storefront bridge (standalone module)
 * Reads public category photos + homepage banner/header images from Firestore.
 * Install via <script type="module" src="assets/js/mx-images-live.js"></script>
 * BEFORE </body>, after existing store.js. Does not replace existing store.js.
 */
import { db } from './firebase.js';
import { doc, getDoc, collection, getDocs } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js';
const categoryImage = x => typeof x === 'string' ? x : (typeof x?.url === 'string' ? x.url : '');
function safeImageUrl(x) {
  const v = categoryImage(x);
  if (v.startsWith('data:image/jpeg;base64,') || v.startsWith('data:image/png;base64,') || v.startsWith('data:image/webp;base64,')) return v;
  try { const u = new URL(v,location.href); return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : ''; } catch { return ''; }
}
async function mxApplyPublicImageSettings() {
  const result = await Promise.allSettled([
    getDoc(doc(db, 'siteSettings', 'homepage')),
    getDocs(collection(db, 'categories'))
  ]);
  if (result[0].status === 'fulfilled') {
    const snap = result[0].value;
    const data = snap.exists() ? snap.data() : {};
    const logo = document.querySelector('.mx-logo-image img');
    const logoUrl = safeImageUrl(data.headerImage);
    if (logo && logoUrl) logo.src = logoUrl;
    const imgs = document.querySelectorAll('#bannerTrack .mx-hero-banner-image');
    imgs.forEach((img, index) => {
      const u = safeImageUrl(data.banners?.[index]);
      if (u) img.src = u;
    });
  }
  if (result[1].status === 'fulfilled') {
    const cats = result[1].value.docs.map(d=>({id:d.id,...d.data()})).filter(c=>c.name && c.active !== false);
    const host = document.querySelector('.mx-category-grid');
    if (host && cats.length) {
      const fragment = document.createDocumentFragment();
      for (const c of cats) {
        const a = document.createElement('a');
        a.href = '#products';
        a.className = 'mx-category-card';
        a.setAttribute('aria-label', `${c.name} ক্যাটাগরির পণ্য দেখুন`);
        const image = safeImageUrl(c.image);
        if (image) a.style.backgroundImage = `linear-gradient(0deg, rgba(5,22,46,.5), rgba(5,22,46,.08)), url(${JSON.stringify(image)})`;
        else a.style.backgroundImage = 'linear-gradient(135deg,#174575,#0b63ce)';
        a.style.backgroundSize = 'cover';
        a.style.backgroundPosition = 'center';
        const overlay = document.createElement('span'); overlay.className = 'mx-category-overlay';
        const content = document.createElement('span'); content.className = 'mx-category-content';
        const title = document.createElement('b'); title.textContent = c.name;
        const sub = document.createElement('small'); sub.textContent = 'ক্যাটাগরির পণ্য দেখুন';
        const arrow = document.createElement('i'); arrow.textContent = '→';
        content.append(title,sub,arrow); a.append(overlay,content);
        a.addEventListener('click',()=>{
          // Existing store.js owns the actual product filter; trigger its real category button.
          const button = [...document.querySelectorAll('#cats [data-category]')].find(x=>x.dataset.category===c.name);
          button?.click();
        });
        fragment.append(a);
      }
      host.replaceChildren(fragment);
    }
  }
  for (const r of result) if (r.status === 'rejected') console.warn('MX storefront image bridge:',r.reason);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',mxApplyPublicImageSettings,{once:true});
else mxApplyPublicImageSettings();
