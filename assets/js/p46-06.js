

/* P40 storefront adapter: reads ONLY publicDesigns/homepage.designStudio.
   Admin's P40 publishes this public-only snapshot; no private siteSettings exposure.
   On missing data/network/permission failure, the original public layout stays intact. */
import { db } from './firebase.js';
import { doc, getDoc, getDocs, collection, query, limit } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js';

(async () => {
  'use strict';
  const ALLOWED = ['hero','categories','featured','new','custom','delivery','reviews'];
  const sectionIds = {hero:'home',categories:'categories',featured:'popular-products',new:'new-products',custom:'custom-print',delivery:'delivery'};
  function normalize(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const selected=[],seen=new Set();
    if(Array.isArray(raw.sections)) for(const item of raw.sections.slice(0,30)) {
      if(item && typeof item==='object' && ALLOWED.includes(item.id) && !seen.has(item.id)) {
        selected.push({id:item.id,visible:item.visible!==false});seen.add(item.id);
      }
    }
    for(const id of ALLOWED) if(!seen.has(id)) selected.push({id,visible:true});
    return {
      sections:selected,
      desktopCols:[3,4,5,6].includes(Number(raw.desktopCols))?Number(raw.desktopCols):4,
      mobileCols:[1,2].includes(Number(raw.mobileCols))?Number(raw.mobileCols):2,
      cardStyle:['soft','flat','outline'].includes(raw.cardStyle)?raw.cardStyle:'soft',
      heroTitle:typeof raw.heroTitle==='string'?raw.heroTitle.trim().slice(0,75):'',
      heroSubtitle:typeof raw.heroSubtitle==='string'?raw.heroSubtitle.trim().slice(0,125):'',
      cta:typeof raw.cta==='string'?raw.cta.trim().slice(0,32):'',
      announcement:raw.announcement!==false
    };
  }
  function node(tag,className,text) {
    const el=document.createElement(tag); if(className) el.className=className;
    if(text!==undefined) el.textContent=text;return el;
  }
  async function prepareReviews() {
    const sec=node('section','mx-p39-reviews');sec.id='mx-p39-public-reviews';
    const inner=node('div','mx-p39-reviews-inner');sec.append(inner);
    inner.append(node('h2','', 'গ্রাহকদের মতামত'));
    const grid=node('div','mx-p39-review-list');inner.append(grid);
    try {
      const snap=await getDocs(query(collection(db,'reviews'),limit(12)));
      const records=snap.docs.map(x=>x.data()).filter(v=>v && typeof v.comment==='string' && v.comment.trim() && Number(v.rating)>=1 && Number(v.rating)<=5).slice(0,6);
      if(!records.length) {
        const p=node('p','', 'এখনো কোনো প্রকাশিত গ্রাহক রিভিউ নেই।');inner.append(p);
      } else {
        for(const r of records) {
          const card=node('article','mx-p39-review');
          card.append(node('span','stars','★'.repeat(Math.floor(Number(r.rating)))+'☆'.repeat(5-Math.floor(Number(r.rating)))));
          card.append(node('strong','',String(r.name||'ক্রেতা').slice(0,100)));
          card.append(node('p','',r.comment.slice(0,500)));
          grid.append(card);
        }
      }
    } catch(error) {
      // Never show mock reviews or disturb the storefront when access fails.
      console.warn('[P39] Reviews were not loaded:',error?.code||error?.message);
      return null;
    }
    return sec;
  }
  function applyModel(model,reviewSection) {
    const main=document.querySelector('main');
    if(!main) return;
    const sections={};
    for(const [key,id] of Object.entries(sectionIds)) sections[key]=document.getElementById(id);
    const bannerTrust=main.querySelector(':scope > .mx-p22-trust-strip');
    if(reviewSection) sections.reviews=reviewSection;
    const usable=model.sections.filter(item=>sections[item.id] && (item.id==='reviews' || sections[item.id].parentElement));
    if(!usable.length) return;
    // The safe subset of sections moves into a dedicated home layout host.
    // The all-products grid, wishlist, contact/footer, modals and Firebase IDs remain untouched.
    const host=node('div','mx-p39-home-sections');host.id='mx-p39-home-sections';
    const first=sections.hero || sections[usable[0].id];
    main.insertBefore(host,first);
    for(const item of usable) {
      const sec=sections[item.id];host.append(sec);
      sec.hidden=!item.visible;
      if(item.id==='hero' && bannerTrust) {
        host.append(bannerTrust);bannerTrust.hidden=!item.visible;
      }
    }
    // Preserve the trust strip in the home layout even when the hero entry is absent.
    if(bannerTrust && !host.contains(bannerTrust))host.append(bannerTrust);
    const body=document.body;
    body.classList.add('mx-p39-enabled');
    body.classList.remove('mx39-card-flat','mx39-card-outline');
    if(model.cardStyle!=='soft')body.classList.add('mx39-card-'+model.cardStyle);
    body.style.setProperty('--mx39-desktop-cols',String(model.desktopCols));
    body.style.setProperty('--mx39-tablet-cols',String(Math.min(model.desktopCols,3)));
    body.style.setProperty('--mx39-mobile-cols',String(model.mobileCols));
    const topbar=document.querySelector('.mx-topbar');if(topbar) topbar.hidden=!model.announcement;
    const hero=sections.hero;
    if(hero) {
      hero.querySelector('.mx-p39-hero-message')?.remove();
      if(model.heroTitle || model.heroSubtitle || model.cta) {
        const panel=node('div','mx-p39-hero-message');
        if(model.heroTitle)panel.append(node('strong','',model.heroTitle));
        if(model.heroSubtitle)panel.append(node('p','',model.heroSubtitle));
        if(model.cta){const link=node('a','',model.cta);link.href='#products';panel.append(link)}
        hero.append(panel);
      }
    }
    document.dispatchEvent(new CustomEvent('mx:p39:layout-applied',{detail:{source:'publicDesigns/homepage.designStudio'}}));
  }
  try {
    const snap=await getDoc(doc(db,'publicDesigns','homepage'));
    const config=snap.exists()?snap.data().designStudio:null;
    const model=normalize(config);
    if(!model) return; // No published layout; preserve P27 as-is.
    // Build the real reviews section only when enabled; never use demo reviews.
    const showReviews=model.sections.some(x=>x.id==='reviews'&&x.visible);
    const reviews=showReviews?await prepareReviews():null;
    applyModel(model,reviews);
  } catch(error) {
    console.warn('[P40] Public design not loaded; original storefront is unchanged:',error?.code||error?.message);
  }
})();

