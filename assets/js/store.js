/* =========================================================
   MEHEDI XPRESS — STORE.JS
   Customer Website
   ========================================================= */

import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


/* =========================================================
   HELPERS
   ========================================================= */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const money = (value) =>
  "৳" + Number(value || 0).toLocaleString("en-BD");


function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}


function safeImage(product) {
  if (
    Array.isArray(product?.images) &&
    product.images.length
  ) {
    const first = product.images[0];

    if (typeof first === "string") return first;
    if (first?.url) return first.url;
  }

  return (
    product?.image ||
    product?.imageUrl ||
    "assets/images/placeholder.svg"
  );
}


/* =========================================================
   STATE
   ========================================================= */

let products = [];
let categories = [];
let settings = {};
let user = null;
let activeCategory = "";

let currentLanguage =
  localStorage.getItem("mx-lang") || "bn";

let cart = [];
let wishlist = [];


try {
  cart = JSON.parse(
    localStorage.getItem("mx-cart") || "[]"
  );

  if (!Array.isArray(cart)) cart = [];
} catch {
  cart = [];
}


try {
  wishlist = JSON.parse(
    localStorage.getItem("mx-wishlist") || "[]"
  );

  if (!Array.isArray(wishlist)) wishlist = [];
} catch {
  wishlist = [];
}


/* =========================================================
   FALLBACK CATEGORIES
   ========================================================= */

const demoCategories = [
  "Football Jersey",
  "Cricket Jersey",
  "Kids Jersey",
  "T-Shirt / Polo",
  "Shorts / Trouser",
  "Football",
  "Cricket Equipment",
  "Badminton",
  "Custom Jersey",
  "Custom Print"
];


/* =========================================================
   PRODUCT HELPERS
   ========================================================= */

function productStock(product) {
  if (
    Array.isArray(product?.variants) &&
    product.variants.length
  ) {
    return product.variants.reduce(
      (total, variant) =>
        total + Number(variant.stock || 0),
      0
    );
  }

  return Number(product?.stock || 0);
}


function productPrice(product) {
  const offer = product?.offerPrice;
  if (offer !== null && offer !== undefined && offer !== "") {
    return Number(offer);
  }
  return Number(
    product?.salePrice ||
    product?.price ||
    product?.regularPrice ||
    product?.variants?.[0]?.sell ||
    0
  );
}


function regularPrice(product) {
  return Number(
    product?.regularPrice ||
    product?.price ||
    productPrice(product)
  );
}


function discountPercent(product) {
  const regular = regularPrice(product);
  const sale = Number(
    product?.offerPrice ??
    product?.salePrice ??
    productPrice(product)
  );

  if (
    regular > 0 &&
    sale > 0 &&
    sale < regular
  ) {
    return Math.round(
      ((regular - sale) / regular) * 100
    );
  }

  return 0;
}


function productName(product) {
  if (
    currentLanguage === "en" &&
    product?.nameEn
  ) {
    return product.nameEn;
  }

  return (
    product?.name ||
    product?.nameBn ||
    "Product"
  );
}



const categoryBnMap = {
  "Football Jersey": "ফুটবল জার্সি",
  "Cricket Jersey": "ক্রিকেট জার্সি",
  "Kids Jersey": "কিডস জার্সি",
  "T-Shirt / Polo": "টি-শার্ট ও পোলো",
  "Shorts / Trouser": "শর্টস ও ট্রাউজার",
  "Football": "ফুটবল",
  "Cricket Equipment": "ক্রিকেট সামগ্রী",
  "Badminton": "ব্যাডমিন্টন",
  "Custom Jersey": "কাস্টম জার্সি",
  "Custom Print": "কাস্টম প্রিন্ট"
};

function categoryLabel(name) {
  const value = String(name || "");
  return currentLanguage === "bn"
    ? (categoryBnMap[value] || value || "ক্যাটাগরি")
    : (value || "Category");
}

function uiText(bn, en) {
  return currentLanguage === "en" ? en : bn;
}


/* =========================================================
   CART / WISHLIST STORAGE
   ========================================================= */

function saveCart() {
  localStorage.setItem(
    "mx-cart",
    JSON.stringify(cart)
  );

  renderCart();
}


function saveWishlist() {
  localStorage.setItem(
    "mx-wishlist",
    JSON.stringify(wishlist)
  );

  updateWishlistCount();
  renderProducts(activeCategory);
  renderPopularProducts();
  renderWishlistSection();
}


function isWished(id) {
  return wishlist.includes(id);
}


function toggleWishlist(id) {
  if (isWished(id)) {
    wishlist = wishlist.filter(
      (itemId) => itemId !== id
    );
  } else {
    wishlist.push(id);
  }

  saveWishlist();
}


function updateWishlistCount() {
  const element = $("#wishlistCount");

  if (element) {
    element.textContent = wishlist.length;
  }
}


/* =========================================================
   HERO SLIDER — FIXED VERSION
   ========================================================= */

function initBannerSlider() {
  const hero = document.querySelector(".mx-hero");
  const track = document.getElementById("bannerTrack");
  const slides = Array.from(
    document.querySelectorAll("#bannerTrack .mx-banner-slide")
  );

  const prevButton =
    document.getElementById("bannerPrev");

  const nextButton =
    document.getElementById("bannerNext");

  const dotsHost =
    document.getElementById("bannerDots");


  if (!track || slides.length === 0) {
    console.warn("Mehedi Xpress: Hero slides পাওয়া যায়নি.");
    return;
  }


  let currentSlide = 0;
  let autoTimer = null;
  let touchStartX = 0;


  /* -----------------------------------------
     IMPORTANT:
     পুরনো CSS transform/flex slider override
     ----------------------------------------- */

  track.style.position = "relative";
  track.style.display = "block";
  track.style.transform = "none";
  track.style.transition = "none";
  track.style.width = "100%";
  track.style.overflow = "hidden";


  slides.forEach((slide, index) => {
    slide.style.width = "100%";
    slide.style.minWidth = "100%";
    slide.style.margin = "0";
    slide.style.transform = "none";

    if (index === 0) {
      slide.style.position = "relative";
      slide.style.display = "block";
      slide.style.opacity = "1";
      slide.style.visibility = "visible";
      slide.style.pointerEvents = "auto";
      slide.style.zIndex = "2";
    } else {
      slide.style.position = "absolute";
      slide.style.left = "0";
      slide.style.top = "0";
      slide.style.display = "none";
      slide.style.opacity = "0";
      slide.style.visibility = "hidden";
      slide.style.pointerEvents = "none";
      slide.style.zIndex = "1";
    }
  });


  /* -----------------------------------------
     Images
     ----------------------------------------- */

  slides.forEach((slide) => {
    const image =
      slide.querySelector(".mx-hero-banner-image");

    if (image) {
      image.style.display = "block";
      image.style.width = "100%";
      image.style.maxWidth = "100%";
      image.style.height = "auto";
    }
  });


  /* -----------------------------------------
     Create dots
     ----------------------------------------- */

  let dots = [];

  if (dotsHost) {
    dotsHost.innerHTML = "";

    slides.forEach((_, index) => {
      const dot = document.createElement("button");

      dot.type = "button";
      dot.className = "mx-banner-dot";

      dot.setAttribute(
        "aria-label",
        `Banner ${index + 1}`
      );

      dot.dataset.slideTo = String(index);

      dot.style.width = "10px";
      dot.style.height = "10px";
      dot.style.padding = "0";
      dot.style.border = "0";
      dot.style.borderRadius = "50%";
      dot.style.cursor = "pointer";
      dot.style.transition = "all .25s ease";

      dotsHost.appendChild(dot);
    });

    dots = Array.from(
      dotsHost.querySelectorAll(".mx-banner-dot")
    );
  }


  /* -----------------------------------------
     Show one slide
     ----------------------------------------- */

  function showSlide(index) {
    if (!slides.length) return;

    currentSlide =
      (index + slides.length) %
      slides.length;


    slides.forEach((slide, slideIndex) => {
      const active =
        slideIndex === currentSlide;

      slide.classList.toggle(
        "active",
        active
      );

      if (active) {
        slide.style.display = "block";
        slide.style.position = "relative";
        slide.style.left = "0";
        slide.style.top = "0";
        slide.style.opacity = "1";
        slide.style.visibility = "visible";
        slide.style.pointerEvents = "auto";
        slide.style.zIndex = "2";
      } else {
        slide.style.display = "none";
        slide.style.position = "absolute";
        slide.style.left = "0";
        slide.style.top = "0";
        slide.style.opacity = "0";
        slide.style.visibility = "hidden";
        slide.style.pointerEvents = "none";
        slide.style.zIndex = "1";
      }
    });


    dots.forEach((dot, dotIndex) => {
      const active =
        dotIndex === currentSlide;

      dot.classList.toggle(
        "active",
        active
      );

      dot.style.background =
        active ? "#76e30c" : "rgba(255,255,255,.75)";

      dot.style.transform =
        active ? "scale(1.35)" : "scale(1)";
    });
  }


  /* -----------------------------------------
     Auto slider
     ----------------------------------------- */

  function stopAutoSlide() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }


  function startAutoSlide() {
    stopAutoSlide();

    if (slides.length <= 1) return;

    autoTimer = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 5500);
  }


  function restartAutoSlide() {
    stopAutoSlide();
    startAutoSlide();
  }


  /* -----------------------------------------
     Arrow buttons
     ----------------------------------------- */

  if (prevButton) {
    prevButton.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();

      showSlide(currentSlide - 1);
      restartAutoSlide();
    };
  }


  if (nextButton) {
    nextButton.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();

      showSlide(currentSlide + 1);
      restartAutoSlide();
    };
  }


  /* -----------------------------------------
     Dot buttons
     ----------------------------------------- */

  dots.forEach((dot, index) => {
    dot.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();

      showSlide(index);
      restartAutoSlide();
    };
  });


  /* -----------------------------------------
     Pause on mouse hover
     ----------------------------------------- */

  if (hero) {
    hero.addEventListener(
      "mouseenter",
      stopAutoSlide
    );

    hero.addEventListener(
      "mouseleave",
      startAutoSlide
    );


    /* ---------------------------------------
       Mobile swipe
       --------------------------------------- */

    hero.addEventListener(
      "touchstart",
      (event) => {
        touchStartX =
          event.touches[0]?.clientX || 0;
      },
      {
        passive: true
      }
    );


    hero.addEventListener(
      "touchend",
      (event) => {
        const touchEndX =
          event.changedTouches[0]?.clientX || 0;

        const difference =
          touchStartX - touchEndX;


        if (Math.abs(difference) < 45) {
          return;
        }


        if (difference > 0) {
          showSlide(currentSlide + 1);
        } else {
          showSlide(currentSlide - 1);
        }

        restartAutoSlide();
      },
      {
        passive: true
      }
    );
  }


  /* -----------------------------------------
     Browser tab inactive হলে timer বন্ধ
     ----------------------------------------- */

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        stopAutoSlide();
      } else {
        startAutoSlide();
      }
    }
  );


  /* First slide */

  showSlide(0);

  /* Start */

  startAutoSlide();

  console.log(
    `Mehedi Xpress Hero Slider Ready: ${slides.length} slides`
  );
}


/* =========================================================
   LOAD FIREBASE STORE
   ========================================================= */

async function loadStore() {
  // Products are the most important data. Load them independently so a
  // missing/blocked categories or settings document cannot hide products.
  try {
    const productSnapshot = await getDocs(collection(db, "products"));

    products = productSnapshot.docs
      .map((document) => ({
        id: document.id,
        ...document.data()
      }))
      .filter((product) => {
        const active = product.active !== false;
        const status = String(product.status || "active").trim().toLowerCase();
        return active && status !== "disabled" && status !== "inactive";
      });

    // Render products immediately.
    renderProducts();
    renderNewProducts();
    renderPopularProducts();
    renderWishlistSection();
    renderCart();
  } catch (error) {
    console.error("Product loading error:", error);

    const message = uiText(
      "পণ্য লোড করা যায়নি। Firestore products read permission পরীক্ষা করুন।",
      "Products could not be loaded. Check Firestore products read permission."
    );

    ["#grid", "#newGrid", "#popularGrid"].forEach((selector) => {
      const el = $(selector);
      if (el) el.innerHTML = `<div class="mx-loading">${message}</div>`;
    });
  }

  // Categories are optional. If collection is missing/blocked, build them
  // from the live products already loaded from Admin.
  try {
    const categorySnapshot = await getDocs(collection(db, "categories"));
    categories = categorySnapshot.docs
      .map((document) => ({
        id: document.id,
        ...document.data()
      }))
      .filter((category) => category.active !== false);
  } catch (error) {
    console.warn("Category loading warning:", error);
    categories = [];
  }

  if (!categories.length) {
    const names = [...new Set(
      products
        .map((product) => product.category || product.categoryBn || product.categoryEn)
        .filter(Boolean)
    )];

    categories = names.length
      ? names.map((name, index) => ({
          id: "product-category-" + index,
          name,
          active: true
        }))
      : demoCategories.map((name, index) => ({
          id: "demo-" + index,
          name,
          active: true
        }));
  }

  // Always show every useful category: Firebase categories + product categories + storefront defaults.
  const mergedCategoryNames = [];
  const addCategoryName = (value) => {
    const name = String(value || "").trim();
    if (!name) return;
    if (!mergedCategoryNames.some(item => item.toLowerCase() === name.toLowerCase())) {
      mergedCategoryNames.push(name);
    }
  };
  categories.forEach(category => addCategoryName(category.name || category.nameEn || category.nameBn));
  products.forEach(product => addCategoryName(product.categoryEn || product.category || product.categoryBn));
  demoCategories.forEach(addCategoryName);
  categories = mergedCategoryNames.map((name, index) => ({ id: `mx-category-${index}`, name, active: true }));

  renderCategories();

  // Store settings are also optional.
  try {
    const settingsSnapshot = await getDoc(doc(db, "settings", "store"));
    settings = settingsSnapshot.exists() ? settingsSnapshot.data() : {};
  } catch (error) {
    console.warn("Settings loading warning:", error);
    settings = {};
  }

  showSettings();
}

/* =========================================================
   SETTINGS
   ========================================================= */

function showSettings() {
  const phone =
    settings.phone ||
    "+8801612961523";

  const phoneElement = $("#phone");

  if (phoneElement) {
    phoneElement.href =
      "tel:" +
      String(phone).replace(/\s/g, "");

    phoneElement.innerHTML = `
      <span>☎</span>
      <span>${escapeHtml(phone)}</span>
    `;
  }
}


/* =========================================================
   FIREBASE CATEGORY BUTTONS
   ========================================================= */

function renderCategories() {
  const host = $("#cats");
  if (!host) return;

  host.innerHTML = `
    <button type="button" class="${!activeCategory ? "active" : ""}" data-category="">
      ${uiText("সব পণ্য", "All Products")}
    </button>

    ${categories
      .filter(category => category.active !== false)
      .map(category => {
        const name = category.name || "";
        return `
          <button
            type="button"
            class="${activeCategory === name ? "active" : ""}"
            data-category="${escapeHtml(name)}"
          >
            ${escapeHtml(categoryLabel(name))}
          </button>
        `;
      })
      .join("")}
  `;

  host.querySelectorAll("[data-category]").forEach(button => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category || "";

      host.querySelectorAll("[data-category]").forEach(item =>
        item.classList.remove("active")
      );
      button.classList.add("active");

      renderProducts(activeCategory);

      $("#products")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });
}


/* =========================================================
   PRODUCT CARD
   ========================================================= */

function productCard(product) {
  const image = safeImage(product);
  const stock = productStock(product);
  const price = productPrice(product);
  const oldPrice = regularPrice(product);
  const discount = discountPercent(product);
  const wished = isWished(product.id);


  return `
    <article class="mx-product-card product-card">

      <div style="position:relative;">

        ${
          discount
            ? `
              <span
                style="
                  position:absolute;
                  left:12px;
                  top:12px;
                  z-index:3;
                  background:#f51231;
                  color:white;
                  padding:5px 9px;
                  border-radius:7px;
                  font-weight:800;
                  font-size:12px;
                "
              >
                -${discount}%
              </span>
            `
            : ""
        }


        <button
          type="button"
          data-wish="${product.id}"
          aria-label="Wishlist"
          style="
            position:absolute;
            right:12px;
            top:12px;
            z-index:4;
            width:38px;
            height:38px;
            border:0;
            border-radius:50%;
            background:white;
            color:#f51231;
            font-size:24px;
            box-shadow:0 5px 15px rgba(0,0,0,.12);
          "
        >
          ${wished ? "♥" : "♡"}
        </button>


        <img
          src="${escapeHtml(image)}"
          alt="${escapeHtml(productName(product))}"
          loading="lazy"
          onerror="this.src='assets/images/placeholder.svg'"
        >

      </div>


      <div class="content">

        <div
          style="
            color:#6f8199;
            font-size:12px;
            margin-bottom:5px;
          "
        >
          ${escapeHtml(categoryLabel(product.category || ""))}
        </div>


        <h3>
          ${escapeHtml(productName(product))}
        </h3>


        ${
          product.code
            ? `
              <div
                style="
                  color:#8391a3;
                  font-size:12px;
                  margin-bottom:7px;
                "
              >
                Code:
                ${escapeHtml(product.code)}
              </div>
            `
            : ""
        }


        <div
          style="
            display:flex;
            align-items:center;
            gap:8px;
            flex-wrap:wrap;
            margin:8px 0;
          "
        >
          <span class="price">
            ${money(price)}
          </span>

          ${
            oldPrice > price
              ? `
                <span class="old-price">
                  ${money(oldPrice)}
                </span>
              `
              : ""
          }
        </div>


        <div
          style="
            margin-bottom:12px;
            font-size:13px;
            font-weight:700;
            color:${stock > 0 ? "#159447" : "#e10b2c"};
          "
        >
          ${
            stock > 0
              ? `✓ ${uiText("স্টকে আছে", "In Stock")} (${stock})`
              : uiText("স্টক শেষ", "Out of Stock")
          }
        </div>


        <button
          type="button"
          data-detail="${product.id}"
          style="
            width:100%;
            background:#0569c9;
            color:#fff;
          "
        >
          ${uiText("অর্ডার করুন", "ORDER NOW")}
        </button>

      </div>

    </article>
  `;
}


/* =========================================================
   PRODUCT BUTTONS
   ========================================================= */

function bindProductButtons(root = document) {
  root
    .querySelectorAll("[data-detail]")
    .forEach((button) => {
      button.onclick = () => {
        showProduct(
          button.dataset.detail
        );
      };
    });


  root
    .querySelectorAll("[data-wish]")
    .forEach((button) => {
      button.onclick = (event) => {
        event.stopPropagation();

        toggleWishlist(
          button.dataset.wish
        );
      };
    });
}


/* =========================================================
   PRODUCTS
   ========================================================= */

function renderProducts(category = activeCategory) {
  const host = $("#grid");
  if (!host) return;

  activeCategory = category || "";

  const search = ($("#search")?.value || "").trim().toLowerCase();
  const stockFilter = $("#stock")?.value || "all";

  let list = products.filter(product => {
    const text = `
      ${product.name || ""}
      ${product.nameEn || ""}
      ${product.code || ""}
      ${product.category || ""}
      ${product.description || ""}
    `.toLowerCase();

    const categoryMatch =
      !activeCategory ||
      String(product.category || "").toLowerCase() ===
      String(activeCategory).toLowerCase();

    const searchMatch = !search || text.includes(search);
    const stock = productStock(product);

    const stockMatch =
      stockFilter === "all" ||
      (stockFilter === "in" && stock > 0) ||
      (stockFilter === "out" && stock <= 0);

    return categoryMatch && searchMatch && stockMatch;
  });

  const sort = $("#sort")?.value || "default";

  if (sort === "price-asc") {
    list.sort((a, b) => productPrice(a) - productPrice(b));
  } else if (sort === "price-desc") {
    list.sort((a, b) => productPrice(b) - productPrice(a));
  } else if (sort === "newest") {
    list.sort((a, b) =>
      (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
    );
  }

  host.innerHTML = list.length
    ? list.map(productCard).join("")
    : `<div class="mx-loading">${uiText("কোনো পণ্য পাওয়া যায়নি।", "No products found.")}</div>`;

  bindProductButtons(host);
}


/* =========================================================
   NEW PRODUCTS
   ========================================================= */

function renderNewProducts() {
  const host = $("#newGrid");
  if (!host) return;

  if (!products.length) {
    host.innerHTML = `
      <div class="mx-loading">
        ${uiText("এখনো কোনো পণ্য যোগ করা হয়নি।", "No products have been added yet.")}
      </div>
    `;
    return;
  }

  const list = [...products]
    .sort((a, b) =>
      (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
    )
    .slice(0, 5);

  host.innerHTML = list.map(productCard).join("");
  bindProductButtons(host);
}


/* =========================================================
   POPULAR PRODUCTS
   Real popularity signals only:
   delivered orders + reviews + star rating
   ========================================================= */

function renderPopularProducts() {
  const host = $("#popularGrid");
  if (!host) return;

  const score = product => {
    const rating = Number(product.ratingAverage || product.rating || 0);
    const reviews = Number(product.reviewCount || 0);
    const delivered = Number(product.deliveredSales || product.soldCount || 0);

    if (rating <= 0 && reviews <= 0 && delivered <= 0) return 0;

    return (delivered * 5) + (reviews * 2) + (rating * 10);
  };

  const list = [...products]
    .filter(product => score(product) > 0)
    .sort((a, b) => score(b) - score(a))
    .slice(0, 5);

  if (!list.length) {
    host.innerHTML = `
      <div class="mx-loading">
        ${uiText(
          "বাস্তব অর্ডার ও রিভিউ পাওয়া গেলে জনপ্রিয় পণ্য এখানে দেখানো হবে।",
          "Popular products will appear here after real orders and reviews are available."
        )}
      </div>
    `;
    return;
  }

  host.innerHTML = list.map(productCard).join("");
  bindProductButtons(host);
}


/* =========================================================
   WISHLIST
   ========================================================= */

function renderWishlistSection() {
  const host = $("#wishlistGrid");

  if (!host) return;


  const list =
    products.filter(
      (product) =>
        wishlist.includes(product.id)
    );


  if (!list.length) {
    host.innerHTML = `
      <div class="mx-loading">
        ♡ এখনো কোনো পণ্য Wishlist-এ যোগ করা হয়নি।
      </div>
    `;

    return;
  }


  host.innerHTML =
    list
      .map(productCard)
      .join("");


  bindProductButtons(host);
}


/* =========================================================
   PRODUCT DETAILS
   ========================================================= */

function showProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  const image = safeImage(product);
  const rawVariants = Array.isArray(product.variants)
    ? product.variants.filter((variant) => Number(variant.stock || 0) > 0)
    : [];

  if (!rawVariants.length && Number(product.stock || 0) > 0) {
    rawVariants.push({
      sku: product.sku || product.code || product.id,
      size: "Standard",
      color: "",
      sell: productPrice(product),
      stock: Number(product.stock || 0)
    });
  }

  // Admin may save "M\\L\\XL\\XXL" in one variant. Expand it into separate size rows.
  const choices = [];
  rawVariants.forEach((variant, variantIndex) => {
    const rawSize = String(variant.size || "Standard").trim();
    const sizes = rawSize === "Standard"
      ? ["Standard"]
      : rawSize.split(/[\\/|,;]+/).map(v => v.trim()).filter(Boolean);
    (sizes.length ? sizes : [rawSize]).forEach((size, sizeIndex) => {
      choices.push({
        ...variant,
        variantIndex,
        choiceIndex: `${variantIndex}-${sizeIndex}`,
        size,
        stock: Number(variant.stock || 0),
        sell: Number(variant.sell || productPrice(product))
      });
    });
  });

  const detail = $("#detail");
  const body = $("#detailBody");
  if (!detail || !body) return;

  const oldPrice = regularPrice(product);
  const salePrice = productPrice(product);
  const description = product.details || product.description || "";

  body.innerHTML = `
    <div class="mx-order-detail">
      <div class="mx-order-media">
        <div class="mx-order-image-wrap">
          <img class="mx-order-image" src="${escapeHtml(image)}" alt="${escapeHtml(productName(product))}"
            onerror="this.src='assets/images/placeholder.svg'">
        </div>
      </div>

      <div class="mx-order-info">
        <div class="mx-order-badge">${escapeHtml(categoryLabel(product.categoryEn || product.category || product.categoryBn || ""))}</div>
        <h2>${escapeHtml(productName(product))}</h2>
        ${product.code ? `<div class="mx-order-code">${uiText("পণ্য কোড", "Product Code")}: <b>${escapeHtml(product.code)}</b></div>` : ""}
        ${description ? `<p class="mx-order-description">${escapeHtml(description)}</p>` : ""}

        <div class="mx-order-price">
          <strong>${money(salePrice)}</strong>
          ${oldPrice > salePrice ? `<del>${money(oldPrice)}</del>` : ""}
        </div>

        ${choices.length ? `
          <div class="mx-size-heading">
            <div><b>${uiText("সাইজ ও পরিমাণ নির্বাচন করুন", "Choose Size & Quantity")}</b><small>${uiText("প্রয়োজনীয় প্রতিটি সাইজের পাশে + চাপুন", "Use + beside each size you need")}</small></div>
          </div>
          <div class="mx-size-qty-list">
            ${choices.map(choice => `
              <div class="mx-size-qty-row" data-choice="${choice.choiceIndex}" data-stock="${choice.stock}" data-price="${choice.sell}">
                <div class="mx-size-name">
                  <b>${escapeHtml(choice.size || uiText("স্ট্যান্ডার্ড", "Standard"))}</b>
                  ${choice.color ? `<span>${escapeHtml(choice.color)}</span>` : ""}
                  <small>${uiText("স্টক", "Stock")}: ${choice.stock}</small>
                </div>
                <div class="mx-stepper">
                  <button type="button" data-minus="${choice.choiceIndex}" aria-label="Minus">−</button>
                  <input type="number" value="0" min="0" max="${choice.stock}" data-size-qty="${choice.choiceIndex}" readonly>
                  <button type="button" data-plus="${choice.choiceIndex}" aria-label="Plus">+</button>
                </div>
              </div>
            `).join("")}
          </div>
          <div class="mx-order-total"><span>${uiText("মোট", "Total")}</span><strong id="detailTotal">${money(0)}</strong></div>
          <button type="button" class="btn primary mx-order-add" id="addCart">${uiText("কার্টে যোগ করুন", "ADD TO CART")}</button>
        ` : `<div class="mx-out-stock">${uiText("এই পণ্যটি বর্তমানে স্টক শেষ", "This product is currently out of stock")}</div>`}
      </div>
    </div>`;

  openModal(detail);
  if (!choices.length) return;

  const getQty = (choice) => Number(body.querySelector(`[data-size-qty="${choice.choiceIndex}"]`)?.value || 0);
  const updateTotal = () => {
    const total = choices.reduce((sum, choice) => sum + getQty(choice) * Number(choice.sell || salePrice), 0);
    const el = $("#detailTotal");
    if (el) el.textContent = money(total);
  };

  body.querySelectorAll("[data-plus]").forEach(button => {
    button.onclick = () => {
      const key = button.dataset.plus;
      const input = body.querySelector(`[data-size-qty="${key}"]`);
      const choice = choices.find(item => item.choiceIndex === key);
      if (!input || !choice) return;
      // If multiple size rows came from one combined variant, their sum cannot exceed shared stock.
      const sharedUsed = choices.filter(item => item.variantIndex === choice.variantIndex)
        .reduce((sum, item) => sum + getQty(item), 0);
      if (sharedUsed >= choice.stock) {
        alert(uiText("এই ভ্যারিয়েন্টের পর্যাপ্ত স্টক নেই।", "Not enough stock for this variant."));
        return;
      }
      input.value = Number(input.value || 0) + 1;
      updateTotal();
    };
  });

  body.querySelectorAll("[data-minus]").forEach(button => {
    button.onclick = () => {
      const input = body.querySelector(`[data-size-qty="${button.dataset.minus}"]`);
      if (!input) return;
      input.value = Math.max(0, Number(input.value || 0) - 1);
      updateTotal();
    };
  });

  $("#addCart").onclick = () => {
    const selected = choices.filter(choice => getQty(choice) > 0);
    if (!selected.length) {
      alert(uiText("কমপক্ষে একটি সাইজের পরিমাণ নির্বাচন করুন।", "Select a quantity for at least one size."));
      return;
    }

    for (const choice of selected) {
      const quantity = getQty(choice);
      const sku = choice.sku || product.sku || product.code || "default";
      const key = product.id + "|" + sku + "|" + (choice.size || "") + "|" + (choice.color || "");
      const existing = cart.find(item => item.key === key);
      if (existing) existing.qty += quantity;
      else cart.push({
        key,
        productId: product.id,
        name: productName(product),
        image,
        sku,
        size: choice.size === "Standard" ? "" : choice.size,
        color: choice.color || "",
        price: Number(choice.sell || salePrice),
        qty: quantity,
        maxStock: Number(choice.stock || 0),
        selected: true
      });
    }

    saveCart();
    closeModal(detail);
    openModal($("#cart"));
  };
}


/* =========================================================
   CART
   ========================================================= */

function renderCart() {
  const totalCount =
    cart.reduce(
      (total, item) =>
        total + Number(item.qty || 0),
      0
    );


  if ($("#count")) {
    $("#count").textContent =
      totalCount;
  }


  if ($("#cartBadge")) {
    $("#cartBadge").textContent =
      totalCount;
  }


  const cartItems =
    $("#cartItems");

  if (!cartItems) return;


  if (!cart.length) {
    cartItems.innerHTML = `
      <div
        style="
          padding:35px 10px;
          text-align:center;
          color:#718197;
        "
      >
        🛒 আপনার Cart এখন খালি।
      </div>
    `;
  } else {
    cartItems.innerHTML =
      cart
        .map(
          (item, index) => `
            <div
              style="
                border:1px solid #dfe7ef;
                border-radius:14px;
                padding:13px;
                margin-bottom:12px;
                display:grid;
                grid-template-columns:72px 1fr;
                gap:12px;
              "
            >

              <img
                src="${escapeHtml(
                  item.image ||
                  "assets/images/placeholder.svg"
                )}"
                alt="${escapeHtml(item.name)}"
                style="
                  width:72px;
                  height:72px;
                  object-fit:cover;
                  border-radius:10px;
                  background:#f5f7fa;
                "
              >


              <div>

                <label
                  style="
                    display:flex;
                    gap:7px;
                    align-items:flex-start;
                  "
                >
                  <input
                    type="checkbox"
                    data-select="${index}"
                    ${
                      item.selected !== false
                        ? "checked"
                        : ""
                    }
                  >

                  <b>${escapeHtml(item.name)}</b>
                </label>


                <div
                  style="
                    color:#7a8a9d;
                    font-size:12px;
                    margin:5px 0;
                  "
                >
                  ${
                    item.size
                      ? "Size: " +
                        escapeHtml(item.size)
                      : ""
                  }

                  ${
                    item.color
                      ? " • Color: " +
                        escapeHtml(item.color)
                      : ""
                  }
                </div>


                <strong style="color:#f51231;">
                  ${money(item.price)}
                </strong>


                <div
                  style="
                    display:flex;
                    gap:7px;
                    align-items:center;
                    margin-top:8px;
                  "
                >
                  <input
                    type="number"
                    min="1"
                    max="${item.maxStock || 999}"
                    value="${item.qty}"
                    data-qty="${index}"
                    style="
                      width:65px;
                      padding:6px;
                      border:1px solid #d5e0ea;
                      border-radius:7px;
                    "
                  >

                  <button
                    type="button"
                    data-remove="${index}"
                    style="
                      border:0;
                      background:#fff0f2;
                      color:#d90b29;
                      padding:7px 10px;
                      border-radius:7px;
                      font-weight:700;
                    "
                  >
                    Remove
                  </button>
                </div>

              </div>

            </div>
          `
        )
        .join("");
  }


  const subtotal =
    cart
      .filter(
        (item) =>
          item.selected !== false
      )
      .reduce(
        (total, item) =>
          total +
          Number(item.price) *
          Number(item.qty),
        0
      );


  if ($("#subtotal")) {
    $("#subtotal").textContent =
      money(subtotal);
  }


  $$("[data-remove]")
    .forEach((button) => {
      button.onclick = () => {
        const index =
          Number(button.dataset.remove);

        cart.splice(index, 1);

        saveCart();
      };
    });


  $$("[data-qty]")
    .forEach((input) => {
      input.onchange = () => {
        const index =
          Number(input.dataset.qty);

        const item =
          cart[index];

        if (!item) return;


        let quantity =
          Math.max(
            1,
            Number(input.value)
          );


        if (
          item.maxStock &&
          quantity >
          Number(item.maxStock)
        ) {
          quantity =
            Number(item.maxStock);

          alert(
            "এই পণ্যের available stock-এর বেশি নেওয়া যাবে না।"
          );
        }


        item.qty = quantity;
        saveCart();
      };
    });


  $$("[data-select]")
    .forEach((input) => {
      input.onchange = () => {
        const index =
          Number(input.dataset.select);

        if (!cart[index]) return;

        cart[index].selected =
          input.checked;

        saveCart();
      };
    });
}


/* =========================================================
   MODALS
   ========================================================= */

function openModal(element) {
  if (!element) return;

  element.classList.add("active");
}


function closeModal(element) {
  if (!element) return;

  element.classList.remove(
    "active",
    "open",
    "show",
    "on"
  );
}


$("[data-close-cart]")
  ?.addEventListener(
    "click",
    () => closeModal($("#cart"))
  );


$("[data-close-detail]")
  ?.addEventListener(
    "click",
    () => closeModal($("#detail"))
  );


$("[data-close-account]")
  ?.addEventListener(
    "click",
    () => closeModal($("#accountModal"))
  );


$("[data-close-checkout]")
  ?.addEventListener(
    "click",
    () => closeModal($("#checkoutModal"))
  );


[
  "#cart",
  "#detail",
  "#accountModal",
  "#checkoutModal"
].forEach((selector) => {
  const element = $(selector);

  element?.addEventListener(
    "click",
    (event) => {
      if (event.target === element) {
        closeModal(element);
      }
    }
  );
});


document.addEventListener(
  "keydown",
  (event) => {
    if (event.key !== "Escape") return;

    [
      "#cart",
      "#detail",
      "#accountModal",
      "#checkoutModal"
    ].forEach((selector) =>
      closeModal($(selector))
    );
  }
);


/* =========================================================
   SEARCH / FILTER
   ========================================================= */

$("#search")
  ?.addEventListener(
    "input",
    () => renderProducts(activeCategory)
  );


$("#sort")
  ?.addEventListener(
    "change",
    () => renderProducts(activeCategory)
  );


$("#stock")
  ?.addEventListener(
    "change",
    () => renderProducts(activeCategory)
  );


/* =========================================================
   CART OPEN
   ========================================================= */

$("#cartBtn")
  ?.addEventListener(
    "click",
    () => {
      renderCart();
      openModal($("#cart"));
    }
  );


/* =========================================================
   CHECKOUT OPEN
   ========================================================= */

$("#checkout")
  ?.addEventListener(
    "click",
    () => {
      const selected =
        cart.filter(
          (item) =>
            item.selected !== false
        );


      if (!selected.length) {
        alert(
          "Cart থেকে অন্তত একটি পণ্য Select করুন।"
        );
        return;
      }


      if (!user) {
        alert(
          "Checkout করার আগে Login অথবা Register করুন।"
        );

        closeModal($("#cart"));

        showAccount();

        openModal($("#accountModal"));

        return;
      }


      closeModal($("#cart"));

      fillCheckoutProfile();

      openModal($("#checkoutModal"));
    }
  );


/* =========================================================
   CHECKOUT SUBMIT
   ========================================================= */

$("#checkoutForm")
  ?.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();


      if (!user) {
        alert(
          "Checkout করার জন্য Login প্রয়োজন।"
        );
        return;
      }


      const form =
        Object.fromEntries(
          new FormData(event.target)
        );


      const items =
        cart.filter(
          (item) =>
            item.selected !== false
        );


      if (!items.length) {
        alert(
          "Cart-এ কোনো selected product নেই।"
        );
        return;
      }


      const subtotal =
        items.reduce(
          (total, item) =>
            total +
            Number(item.price) *
            Number(item.qty),
          0
        );


      const district =
        String(form.district || "")
          .trim()
          .toLowerCase();


      const isCumilla =
        district === "কুমিল্লা" ||
        district === "cumilla" ||
        district === "comilla";


      const delivery =
        isCumilla
          ? Number(
              settings.insideDelivery ||
              80
            )
          : Number(
              settings.outsideDelivery ||
              150
            );


      const paymentMethod =
        form.paymentMethod ||
        "cod";


      const transactionId =
        String(
          form.transactionId || ""
        ).trim();


      if (
        (
          paymentMethod === "bkash" ||
          paymentMethod === "nagad"
        ) &&
        !transactionId
      ) {
        alert(
          "bKash/Nagad payment করলে Transaction ID দিতে হবে।"
        );
        return;
      }


      const orderItems =
        items.map(
          (item) => ({
            productId: item.productId,
            name: item.name,
            sku: item.sku || "",
            variantSku: item.sku || "",
            size: item.size || "",
            color: item.color || "",
            price: Number(item.price),
            qty: Number(item.qty),
            lineTotal: Number(item.price) * Number(item.qty),
            image: item.image || ""
          })
        );


      const orderData = {
        userId: user.uid,
        customerEmail: user.email || "",
        customerName: form.name || "",
        phone: form.phone || "",
        division: form.division || "",
        district: form.district || "",
        upazila: form.upazila || "",
        area: form.area || "",
        address: form.address || "",
        payment: paymentMethod,
        paymentMethod,
        trx: transactionId,
        transactionId,

        paymentStatus:
          paymentMethod === "cod"
            ? "COD"
            : "Pending Verification",

        items: orderItems,
        subtotal,
        delivery,
        deliveryCharge: delivery,
        total: subtotal + delivery,
        status: "Pending",
        stockState: "none",
        source: "Website",
        createdAt: serverTimestamp()
      };


      try {
        await addDoc(
          collection(db, "orders"),
          orderData
        );


        cart =
          cart.filter(
            (item) =>
              item.selected === false
          );


        saveCart();

        event.target.reset();

        initAddressSelectors(true);

        closeModal($("#checkoutModal"));


        alert(
          "আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে।"
        );

      } catch (error) {
        console.error(
          "Order error:",
          error
        );

        alert(
          "Order করা যায়নি। " +
          error.message
        );
      }
    }
  );


/* =========================================================
   ACCOUNT
   ========================================================= */

$("#account")
  ?.addEventListener(
    "click",
    () => {
      showAccount();
      openModal($("#accountModal"));
    }
  );


function showAccount() {
  const host = $("#accountBody");

  if (!host) return;


  if (user) {
    host.innerHTML = `
      <div
        style="
          display:flex;
          gap:12px;
          align-items:center;
          padding:15px;
          background:#f3f8fd;
          border-radius:14px;
          margin-bottom:18px;
        "
      >

        <div
          style="
            width:55px;
            height:55px;
            border-radius:50%;
            background:#0569c9;
            color:#fff;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:25px;
          "
        >
          👤
        </div>


        <div>
          <b>আমার Account</b>

          <div
            style="
              color:#728399;
              font-size:13px;
            "
          >
            ${escapeHtml(user.email || "")}
          </div>
        </div>

      </div>


      <div style="display:grid;gap:9px;">

        <button
          type="button"
          class="btn primary"
          id="showOrders"
        >
          আমার Orders
        </button>


        <button
          type="button"
          class="btn light"
          id="editProfile"
        >
          Profile / Address
        </button>


        <button
          type="button"
          class="btn light"
          id="logoutCustomer"
          style="color:#d90b29;"
        >
          Logout
        </button>

      </div>


      <div
        id="profileEditor"
        style="margin-top:18px;"
      ></div>

      <div
        id="myOrders"
        style="margin-top:18px;"
      ></div>
    `;


    $("#logoutCustomer")
      ?.addEventListener(
        "click",
        async () => {
          await signOut(auth);

          closeModal(
            $("#accountModal")
          );
        }
      );


    $("#showOrders")
      ?.addEventListener(
        "click",
        loadMyOrders
      );


    $("#editProfile")
      ?.addEventListener(
        "click",
        loadProfileEditor
      );


    return;
  }


  host.innerHTML = `
    <div style="margin-bottom:18px;">
      <h3>Login / Register</h3>

      <p
        style="
          color:#718197;
          font-size:14px;
        "
      >
        অর্ডার ও Order History দেখার জন্য Account ব্যবহার করুন।
      </p>
    </div>


    <form id="customerLogin">

      <label>Email</label>

      <input
        class="field"
        name="email"
        type="email"
        placeholder="আপনার Email"
        required
      >


      <br><br>


      <label>Password</label>

      <input
        class="field"
        name="password"
        type="password"
        minlength="6"
        placeholder="কমপক্ষে 6 অক্ষর"
        required
      >


      <br><br>


      <button
        type="submit"
        class="btn primary"
        style="width:100%;"
      >
        LOGIN
      </button>


      <br><br>


      <button
        type="button"
        class="btn light"
        id="registerCustomer"
        style="width:100%;"
      >
        CREATE ACCOUNT
      </button>


      <br><br>


      <button
        type="button"
        class="btn light"
        id="resetPassword"
        style="width:100%;"
      >
        RESET PASSWORD
      </button>

    </form>
  `;


  $("#customerLogin")
    ?.addEventListener(
      "submit",
      async (event) => {
        event.preventDefault();

        const form =
          new FormData(event.target);


        try {
          await signInWithEmailAndPassword(
            auth,
            form.get("email"),
            form.get("password")
          );

          alert("Login সফল হয়েছে।");

        } catch (error) {
          alert(
            "Login করা যায়নি: " +
            error.message
          );
        }
      }
    );


  $("#registerCustomer")
    ?.addEventListener(
      "click",
      async () => {
        const formElement =
          $("#customerLogin");

        if (!formElement) return;


        const form =
          new FormData(formElement);

        const email =
          String(
            form.get("email") || ""
          ).trim();

        const password =
          String(
            form.get("password") || ""
          );


        if (!email || !password) {
          alert(
            "Email এবং Password লিখুন।"
          );
          return;
        }


        if (password.length < 6) {
          alert(
            "Password কমপক্ষে 6 অক্ষরের হতে হবে।"
          );
          return;
        }


        try {
          const result =
            await createUserWithEmailAndPassword(
              auth,
              email,
              password
            );


          await setDoc(
            doc(
              db,
              "users",
              result.user.uid
            ),
            {
              email: result.user.email,
              name: "",
              phone: "",
              division: "",
              district: "",
              upazila: "",
              area: "",
              address: "",
              role: "customer",
              createdAt: serverTimestamp()
            },
            {
              merge: true
            }
          );


          alert(
            "Account সফলভাবে তৈরি হয়েছে।"
          );

        } catch (error) {
          alert(
            "Account তৈরি করা যায়নি: " +
            error.message
          );
        }
      }
    );


  $("#resetPassword")
    ?.addEventListener(
      "click",
      async () => {
        const formElement =
          $("#customerLogin");

        if (!formElement) return;


        const form =
          new FormData(formElement);

        const email =
          String(
            form.get("email") || ""
          ).trim();


        if (!email) {
          alert("আগে Email লিখুন।");
          return;
        }


        try {
          await sendPasswordResetEmail(
            auth,
            email
          );

          alert(
            "Password reset email পাঠানো হয়েছে।"
          );

        } catch (error) {
          alert(error.message);
        }
      }
    );
}


/* =========================================================
   PROFILE
   ========================================================= */

async function loadProfileEditor() {
  if (!user) return;

  const host =
    $("#profileEditor");

  if (!host) return;


  try {
    const reference =
      doc(
        db,
        "users",
        user.uid
      );


    const snapshot =
      await getDoc(reference);


    const profile =
      snapshot.exists()
        ? snapshot.data()
        : {};


    host.innerHTML = `
      <div
        style="
          border-top:1px solid #e1e8ef;
          padding-top:18px;
        "
      >

        <h3 style="margin-bottom:13px;">
          Profile / Address
        </h3>


        <form id="profileForm">

          <input
            class="field"
            name="name"
            placeholder="আপনার নাম"
            value="${escapeHtml(profile.name || "")}"
            required
          >

          <br><br>


          <input
            class="field"
            name="phone"
            placeholder="মোবাইল নম্বর"
            value="${escapeHtml(profile.phone || "")}"
            required
          >

          <br><br>


          <input
            class="field"
            name="division"
            placeholder="বিভাগ"
            value="${escapeHtml(profile.division || "")}"
          >

          <br><br>


          <input
            class="field"
            name="district"
            placeholder="জেলা"
            value="${escapeHtml(profile.district || "")}"
          >

          <br><br>


          <input
            class="field"
            name="upazila"
            placeholder="উপজেলা / থানা"
            value="${escapeHtml(profile.upazila || "")}"
          >

          <br><br>


          <input
            class="field"
            name="area"
            placeholder="এলাকা / গ্রাম"
            value="${escapeHtml(profile.area || "")}"
          >

          <br><br>


          <textarea
            class="field"
            name="address"
            rows="3"
            placeholder="সম্পূর্ণ ঠিকানা"
          >${escapeHtml(profile.address || "")}</textarea>

          <br><br>


          <button
            type="submit"
            class="btn primary"
            style="width:100%;"
          >
            SAVE PROFILE
          </button>

        </form>

      </div>
    `;


    $("#profileForm")
      ?.addEventListener(
        "submit",
        async (event) => {
          event.preventDefault();


          const data =
            Object.fromEntries(
              new FormData(event.target)
            );


          try {
            await setDoc(
              reference,
              {
                ...data,
                email: user.email || "",
                role: "customer",
                updatedAt: serverTimestamp()
              },
              {
                merge: true
              }
            );


            alert("Profile Save হয়েছে.");

          } catch (error) {
            alert(
              "Profile Save করা যায়নি: " +
              error.message
            );
          }
        }
      );

  } catch (error) {
    console.error(error);

    host.innerHTML = `
      <p>Profile load করা যায়নি।</p>
    `;
  }
}


/* =========================================================
   CHECKOUT PROFILE AUTOFILL
   ========================================================= */

async function fillCheckoutProfile() {
  if (!user) return;


  try {
    const snapshot =
      await getDoc(
        doc(
          db,
          "users",
          user.uid
        )
      );


    if (!snapshot.exists()) return;


    const profile =
      snapshot.data();


    if ($("#checkoutName")) {
      $("#checkoutName").value =
        profile.name || "";
    }


    if ($("#checkoutPhone")) {
      $("#checkoutPhone").value =
        profile.phone || "";
    }


    if ($("#checkoutArea")) {
      $("#checkoutArea").value =
        profile.area || "";
    }


    if ($("#checkoutAddress")) {
      $("#checkoutAddress").value =
        profile.address || "";
    }


    const division =
      $("#checkoutDivision");

    const district =
      $("#checkoutDistrict");

    const upazila =
      $("#checkoutUpazila");


    if (
      division &&
      profile.division &&
      bdAddress[profile.division]
    ) {
      division.value =
        profile.division;

      fillDistricts(
        profile.division
      );


      if (
        district &&
        profile.district
      ) {
        district.value =
          profile.district;

        fillUpazilas(
          profile.district
        );


        if (
          upazila &&
          profile.upazila
        ) {
          const exists =
            [...upazila.options]
              .some(
                (option) =>
                  option.value ===
                  profile.upazila
              );

          if (exists) {
            upazila.value =
              profile.upazila;
          }
        }
      }
    }

  } catch (error) {
    console.error(
      "Profile autofill error:",
      error
    );
  }
}


/* =========================================================
   MY ORDERS
   ========================================================= */

async function loadMyOrders() {
  if (!user) return;

  const host = $("#myOrders");

  if (!host) return;


  host.innerHTML = `
    <div class="mx-loading">
      Order history load হচ্ছে...
    </div>
  `;


  try {
    const snapshot =
      await getDocs(
        query(
          collection(db, "orders"),
          where(
            "userId",
            "==",
            user.uid
          )
        )
      );


    const list =
      snapshot.docs.map(
        (document) => ({
          id: document.id,
          ...document.data()
        })
      );


    list.sort(
      (a, b) =>
        (b.createdAt?.seconds || 0) -
        (a.createdAt?.seconds || 0)
    );


    if (!list.length) {
      host.innerHTML = `
        <p
          style="
            margin-top:15px;
            color:#718197;
          "
        >
          এখনো কোনো Order নেই।
        </p>
      `;

      return;
    }


    host.innerHTML = `
      <div
        style="
          border-top:1px solid #e1e8ef;
          padding-top:18px;
        "
      >

        <h3 style="margin-bottom:12px;">
          আমার Orders
        </h3>


        ${list
          .map(
            (order) => `
              <div
                style="
                  border:1px solid #dce6ef;
                  border-radius:12px;
                  padding:13px;
                  margin-bottom:10px;
                "
              >

                <b>
                  Order #
                  ${escapeHtml(
                    order.id.slice(0, 8)
                  )}
                </b>


                <p>
                  Status:
                  <strong>
                    ${escapeHtml(
                      order.status ||
                      "Pending"
                    )}
                  </strong>
                </p>


                <p>
                  Total:
                  <strong style="color:#f51231;">
                    ${money(order.total)}
                  </strong>
                </p>


                <p
                  style="
                    color:#718197;
                    font-size:13px;
                  "
                >
                  Payment:
                  ${escapeHtml(
                    order.paymentStatus ||
                    order.paymentMethod ||
                    ""
                  )}
                </p>

              </div>
            `
          )
          .join("")}

      </div>
    `;

  } catch (error) {
    console.error(
      "Orders error:",
      error
    );

    host.innerHTML = `
      <p>Order History load করা যায়নি।</p>
    `;
  }
}


/* =========================================================
   BANGLADESH ADDRESS
   ========================================================= */

const bdAddress = {
  "চট্টগ্রাম": [
    "কুমিল্লা",
    "চট্টগ্রাম",
    "কক্সবাজার",
    "ফেনী",
    "নোয়াখালী",
    "লক্ষ্মীপুর",
    "চাঁদপুর",
    "ব্রাহ্মণবাড়িয়া",
    "খাগড়াছড়ি",
    "রাঙ্গামাটি",
    "বান্দরবান"
  ],

  "ঢাকা": [
    "ঢাকা",
    "গাজীপুর",
    "নারায়ণগঞ্জ",
    "নরসিংদী",
    "মানিকগঞ্জ",
    "মুন্সিগঞ্জ",
    "টাঙ্গাইল",
    "কিশোরগঞ্জ",
    "ফরিদপুর",
    "গোপালগঞ্জ",
    "মাদারীপুর",
    "রাজবাড়ী",
    "শরীয়তপুর"
  ],

  "রাজশাহী": [
    "রাজশাহী",
    "বগুড়া",
    "জয়পুরহাট",
    "নওগাঁ",
    "নাটোর",
    "চাঁপাইনবাবগঞ্জ",
    "পাবনা",
    "সিরাজগঞ্জ"
  ],

  "খুলনা": [
    "খুলনা",
    "বাগেরহাট",
    "সাতক্ষীরা",
    "যশোর",
    "ঝিনাইদহ",
    "মাগুরা",
    "নড়াইল",
    "কুষ্টিয়া",
    "চুয়াডাঙ্গা",
    "মেহেরপুর"
  ],

  "বরিশাল": [
    "বরিশাল",
    "ভোলা",
    "ঝালকাঠি",
    "পটুয়াখালী",
    "পিরোজপুর",
    "বরগুনা"
  ],

  "সিলেট": [
    "সিলেট",
    "মৌলভীবাজার",
    "হবিগঞ্জ",
    "সুনামগঞ্জ"
  ],

  "রংপুর": [
    "রংপুর",
    "দিনাজপুর",
    "গাইবান্ধা",
    "কুড়িগ্রাম",
    "লালমনিরহাট",
    "নীলফামারী",
    "পঞ্চগড়",
    "ঠাকুরগাঁও"
  ],

  "ময়মনসিংহ": [
    "ময়মনসিংহ",
    "জামালপুর",
    "নেত্রকোনা",
    "শেরপুর"
  ]
};


const cumillaUpazilas = [
  "মুরাদনগর",
  "বরুড়া",
  "কুমিল্লা আদর্শ সদর",
  "কুমিল্লা সদর দক্ষিণ",
  "চান্দিনা",
  "দাউদকান্দি",
  "দেবিদ্বার",
  "হোমনা",
  "লাকসাম",
  "মনোহরগঞ্জ",
  "মেঘনা",
  "নাঙ্গলকোট",
  "তিতাস",
  "বুড়িচং",
  "ব্রাহ্মণপাড়া",
  "চৌদ্দগ্রাম",
  "লালমাই"
];


/* =========================================================
   ADDRESS SELECTORS
   ========================================================= */

function fillDistricts(divisionName) {
  const district =
    $("#checkoutDistrict");

  const upazila =
    $("#checkoutUpazila");

  if (!district) return;


  const list =
    bdAddress[divisionName] || [];


  district.innerHTML = `
    <option value="">
      জেলা নির্বাচন করুন
    </option>

    ${list
      .map(
        (name) => `
          <option value="${name}">
            ${name}
          </option>
        `
      )
      .join("")}
  `;


  if (upazila) {
    upazila.innerHTML = `
      <option value="">
        উপজেলা / থানা নির্বাচন করুন
      </option>
    `;
  }
}


function fillUpazilas(districtName) {
  const upazila =
    $("#checkoutUpazila");

  if (!upazila) return;


  const list =
    districtName === "কুমিল্লা"
      ? cumillaUpazilas
      : ["অন্যান্য / আমার এলাকা"];


  upazila.innerHTML = `
    <option value="">
      উপজেলা / থানা নির্বাচন করুন
    </option>

    ${list
      .map(
        (name) => `
          <option value="${name}">
            ${name}
          </option>
        `
      )
      .join("")}
  `;
}


function initAddressSelectors(force = false) {
  const division =
    $("#checkoutDivision");

  const district =
    $("#checkoutDistrict");

  const upazila =
    $("#checkoutUpazila");


  if (
    !division ||
    !district ||
    !upazila
  ) {
    return;
  }


  if (
    division.dataset.ready &&
    !force
  ) {
    return;
  }


  division.dataset.ready = "1";


  division.innerHTML = `
    <option value="">
      বিভাগ নির্বাচন করুন
    </option>

    ${Object
      .keys(bdAddress)
      .map(
        (name) => `
          <option value="${name}">
            ${name}
          </option>
        `
      )
      .join("")}
  `;


  district.innerHTML = `
    <option value="">
      জেলা নির্বাচন করুন
    </option>
  `;


  upazila.innerHTML = `
    <option value="">
      উপজেলা / থানা নির্বাচন করুন
    </option>
  `;


  division.onchange = () => {
    fillDistricts(
      division.value
    );
  };


  district.onchange = () => {
    fillUpazilas(
      district.value
    );
  };
}


/* =========================================================
   LANGUAGE
   ========================================================= */

function applyStorefrontLanguage() {
  document.documentElement.lang = currentLanguage;

  const setText = (selector, bn, en) => {
    const el = $(selector);
    if (el) el.textContent = uiText(bn, en);
  };

  setText("#categoryEyebrow", "ক্যাটাগরি থেকে কিনুন", "SHOP BY CATEGORY");
  setText("#categoryTitle", "আপনার পছন্দের ক্যাটাগরি", "Choose Your Favourite Category");
  setText("#categoryViewAll", "সব পণ্য দেখুন →", "View All Products →");

  setText("#newProductsKicker", "সদ্য যোগ হয়েছে", "JUST ARRIVED");
  setText("#newProductsTitle", "নতুন পণ্য", "New Products");
  setText("#newProductsNote", "সর্বশেষ যোগ করা পণ্যগুলো এখানে দেখানো হবে।", "See the latest products added to Mehedi Xpress.");
  setText("#newProductsViewAll", "সব পণ্য দেখুন →", "View All Products →");

  setText("#popularProductsKicker", "ক্রেতাদের পছন্দ", "CUSTOMER FAVOURITES");
  setText("#popularProductsTitle", "জনপ্রিয় পণ্য", "Popular Products");
  setText(
    "#popularProductsNote",
    "বাস্তব অর্ডার, রিভিউ ও স্টার রেটিংয়ের ভিত্তিতে জনপ্রিয় পণ্য এখানে দেখানো হবে।",
    "Popular products are ranked using real orders, reviews and star ratings."
  );
  setText("#popularProductsViewAll", "সব পণ্য দেখুন →", "View All Products →");

  setText("#allProductsKicker", "মেহেদী এক্সপ্রেস কালেকশন", "MEHEDI XPRESS COLLECTION");
  setText("#allProductsTitle", "আমাদের পণ্যসমূহ", "All Products");
  setText(
    "#allProductsNote",
    "ক্যাটাগরি বেছে নিন, স্টক দেখুন এবং আপনার প্রয়োজনীয় পণ্য সহজে খুঁজে নিন।",
    "Choose a category, check availability and find the product you need."
  );
  setText("#stockFilterLabel", "স্টক", "Stock");
  setText("#sortFilterLabel", "সাজান", "Sort By");
  setText("#shopCategoryLabel", "ক্যাটাগরি", "Category");

  const stock = $("#stock");
  if (stock) {
    const selected = stock.value;
    stock.innerHTML = currentLanguage === "en"
      ? `<option value="all">All Products</option>
         <option value="in">In Stock</option>
         <option value="out">Out of Stock</option>`
      : `<option value="all">সব পণ্য</option>
         <option value="in">স্টকে আছে</option>
         <option value="out">স্টক শেষ</option>`;
    stock.value = selected;
    stock.setAttribute("aria-label", uiText("স্টক অনুযায়ী পণ্য", "Filter products by stock"));
  }

  const sort = $("#sort");
  if (sort) {
    const selected = sort.value;
    sort.innerHTML = currentLanguage === "en"
      ? `<option value="default">Default</option>
         <option value="newest">Newest First</option>
         <option value="price-asc">Price: Low to High</option>
         <option value="price-desc">Price: High to Low</option>`
      : `<option value="default">ডিফল্ট</option>
         <option value="newest">নতুন আগে</option>
         <option value="price-asc">দাম: কম থেকে বেশি</option>
         <option value="price-desc">দাম: বেশি থেকে কম</option>`;
    sort.value = selected;
    sort.setAttribute("aria-label", uiText("পণ্য সাজান", "Sort products"));
  }

  if ($("#search")) {
    $("#search").placeholder = uiText(
      "পণ্য, জার্সি বা Product Code খুঁজুন...",
      "Search products, jerseys or product code..."
    );
  }

  if ($(".mx-search-button")) {
    $(".mx-search-button").textContent = uiText("খুঁজুন", "Search");
  }

  const visualLabels = {
    ".mx-cat-football-jersey": ["ফুটবল জার্সি", "Football Jersey", "ক্লাব ও জাতীয় দল", "Club & National"],
    ".mx-cat-cricket-jersey": ["ক্রিকেট জার্সি", "Cricket Jersey", "প্রিমিয়াম কালেকশন", "Premium Collection"],
    ".mx-cat-kids": ["কিডস জার্সি", "Kids Jersey", "শিশুদের কালেকশন", "Kids Collection"],
    ".mx-cat-tshirt": ["টি-শার্ট ও পোলো", "T-Shirt & Polo", "ফ্যাশন কালেকশন", "Fashion Collection"],
    ".mx-cat-shorts": ["শর্টস ও ট্রাউজার", "Shorts & Trouser", "স্পোর্টস ও ক্যাজুয়াল", "Sports & Casual"],
    ".mx-cat-football": ["ফুটবল", "Football", "বল ও অ্যাকসেসরিজ", "Ball & Accessories"],
    ".mx-cat-cricket": ["ক্রিকেট সামগ্রী", "Cricket Equipment", "ব্যাট • বল • গ্লাভস", "Bat • Ball • Gloves"],
    ".mx-cat-badminton": ["ব্যাডমিন্টন", "Badminton", "র‍্যাকেট ও অ্যাকসেসরিজ", "Racket & Accessories"],
    ".mx-cat-custom-jersey": ["কাস্টম জার্সি", "Custom Jersey", "নিজের ডিজাইন", "Your Own Design"],
    ".mx-cat-custom-print": ["কাস্টম প্রিন্ট", "Custom Print", "আপনার ডিজাইন প্রিন্ট করুন", "Print Your Design"]
  };

  Object.entries(visualLabels).forEach(([selector, values]) => {
    const card = $(selector);
    if (!card) return;
    const title = card.querySelector(".mx-category-content b");
    const small = card.querySelector(".mx-category-content small");
    if (title) title.textContent = uiText(values[0], values[1]);
    if (small) small.textContent = uiText(values[2], values[3]);
  });

  renderCategories();
  renderProducts(activeCategory);
  renderNewProducts();
  renderPopularProducts();
  renderWishlistSection();
}


function initLanguageSwitch() {
  const buttons = $$(".mx-lang");
  if (!buttons.length) return;

  const updateButtons = () => {
    buttons.forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.lang === currentLanguage
      );
    });
  };

  updateButtons();
  applyStorefrontLanguage();

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      currentLanguage = button.dataset.lang || "bn";
      localStorage.setItem("mx-lang", currentLanguage);
      updateButtons();
      applyStorefrontLanguage();
    });
  });
}


/* =========================================================
   VISUAL CATEGORY CARDS
   ========================================================= */

function initVisualCategories() {
  const map = {
    ".mx-cat-football-jersey":
      "Football Jersey",

    ".mx-cat-cricket-jersey":
      "Cricket Jersey",

    ".mx-cat-kids":
      "Kids Jersey",

    ".mx-cat-tshirt":
      "T-Shirt / Polo",

    ".mx-cat-shorts":
      "Shorts / Trouser",

    ".mx-cat-football":
      "Football",

    ".mx-cat-cricket":
      "Cricket Equipment",

    ".mx-cat-badminton":
      "Badminton",

    ".mx-cat-custom-jersey":
      "Custom Jersey"
  };


  Object.entries(map)
    .forEach(
      ([selector, category]) => {
        $(selector)
          ?.addEventListener(
            "click",
            (event) => {
              event.preventDefault();

              activeCategory =
                category;

              renderCategories();
              renderProducts(category);

              $("#products")
                ?.scrollIntoView({
                  behavior: "smooth"
                });
            }
          );
      }
    );
}


/* =========================================================
   AUTH STATE
   ========================================================= */

onAuthStateChanged(
  auth,
  (currentUser) => {
    user = currentUser;


    const accountButton =
      $("#account");


    if (accountButton) {
      const text =
        accountButton.querySelector(
          ".mx-action-text b"
        );

      if (text) {
        text.textContent =
          user
            ? "My Account"
            : "Login";
      }
    }


    const accountModal =
      $("#accountModal");


    if (
      accountModal &&
      accountModal.classList.contains("active")
    ) {
      showAccount();
    }
  }
);


/* =========================================================
   START WEBSITE
   ========================================================= */

function startStore() {
  /*
    Firestore product loading starts first.
    Hero slider is already handled separately on the website.
    Missing optional UI functions must not stop product loading.
  */
  loadStore();

  if (typeof updateWishlistCount === "function") updateWishlistCount();
  if (typeof renderCart === "function") renderCart();
  if (typeof initLanguageSwitch === "function") initLanguageSwitch();
  if (typeof initAddressSelectors === "function") initAddressSelectors();
  if (typeof initVisualCategories === "function") initVisualCategories();
}

/* DOM নিশ্চিত হওয়ার পর start */

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    startStore,
    { once: true }
  );
} else {
  startStore();
}
