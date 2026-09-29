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
  return Number(
    product?.salePrice ||
    product?.regularPrice ||
    product?.price ||
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
  const sale = Number(product?.salePrice || 0);

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
   HERO SLIDER
   ========================================================= */

function initBannerSlider() {

  const hero =
    document.querySelector(".mx-hero");

  const track =
    document.getElementById("bannerTrack");

  const slides = Array.from(
    document.querySelectorAll(
      "#bannerTrack .mx-banner-slide"
    )
  );

  const prevButton =
    document.getElementById("bannerPrev");

  const nextButton =
    document.getElementById("bannerNext");

  const dotsHost =
    document.getElementById("bannerDots");


  if (!track || slides.length === 0) {

    console.warn(
      "Mehedi Xpress: Hero slides পাওয়া যায়নি."
    );

    return;
  }


  let currentSlide = 0;
  let autoTimer = null;
  let touchStartX = 0;


  /* Track */

  track.style.position = "relative";
  track.style.display = "block";
  track.style.transform = "none";
  track.style.transition = "none";
  track.style.width = "100%";
  track.style.overflow = "hidden";


  /* Slides */

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


  /* Images */

  slides.forEach((slide) => {

    const image =
      slide.querySelector(
        ".mx-hero-banner-image"
      );

    if (image) {

      image.style.display = "block";
      image.style.width = "100%";
      image.style.maxWidth = "100%";
      image.style.height = "auto";

    }

  });


  /* Dots */

  let dots = [];

  if (dotsHost) {

    dotsHost.innerHTML = "";

    slides.forEach((_, index) => {

      const dot =
        document.createElement("button");

      dot.type = "button";

      dot.className =
        "mx-banner-dot";

      dot.setAttribute(
        "aria-label",
        `Banner ${index + 1}`
      );

      dot.dataset.slideTo =
        String(index);

      dot.style.width = "10px";
      dot.style.height = "10px";
      dot.style.padding = "0";
      dot.style.border = "0";
      dot.style.borderRadius = "50%";
      dot.style.cursor = "pointer";

      dot.style.transition =
        "all .25s ease";

      dotsHost.appendChild(dot);

    });


    dots = Array.from(
      dotsHost.querySelectorAll(
        ".mx-banner-dot"
      )
    );

  }


  /* Show Slide */

  function showSlide(index) {

    if (!slides.length) return;


    currentSlide =
      (index + slides.length) %
      slides.length;


    slides.forEach(
      (slide, slideIndex) => {

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

      }
    );


    dots.forEach(
      (dot, dotIndex) => {

        const active =
          dotIndex === currentSlide;


        dot.classList.toggle(
          "active",
          active
        );


        dot.style.background =
          active
            ? "#76e30c"
            : "rgba(255,255,255,.75)";


        dot.style.transform =
          active
            ? "scale(1.35)"
            : "scale(1)";

      }
    );

  }


  /* Auto Slide */

  function stopAutoSlide() {

    if (autoTimer) {

      clearInterval(autoTimer);

      autoTimer = null;

    }

  }


  function startAutoSlide() {

    stopAutoSlide();


    if (slides.length <= 1) {
      return;
    }


    autoTimer =
      setInterval(
        () => {

          showSlide(
            currentSlide + 1
          );

        },
        5500
      );

  }


  function restartAutoSlide() {

    stopAutoSlide();
    startAutoSlide();

  }


  /* Previous */

  if (prevButton) {

    prevButton.onclick =
      (event) => {

        event.preventDefault();
        event.stopPropagation();

        showSlide(
          currentSlide - 1
        );

        restartAutoSlide();

      };

  }


  /* Next */

  if (nextButton) {

    nextButton.onclick =
      (event) => {

        event.preventDefault();
        event.stopPropagation();

        showSlide(
          currentSlide + 1
        );

        restartAutoSlide();

      };

  }


  /* Dot Click */

  dots.forEach(
    (dot, index) => {

      dot.onclick =
        (event) => {

          event.preventDefault();
          event.stopPropagation();

          showSlide(index);

          restartAutoSlide();

        };

    }
  );


  /* Mouse */

  if (hero) {

    hero.addEventListener(
      "mouseenter",
      stopAutoSlide
    );


    hero.addEventListener(
      "mouseleave",
      startAutoSlide
    );


    /* Mobile Swipe */

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


        if (
          Math.abs(difference) < 45
        ) {
          return;
        }


        if (difference > 0) {

          showSlide(
            currentSlide + 1
          );

        } else {

          showSlide(
            currentSlide - 1
          );

        }


        restartAutoSlide();

      },
      {
        passive: true
      }
    );

  }


  /* Browser Tab */

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


  showSlide(0);

  startAutoSlide();


  console.log(
    `Mehedi Xpress Hero Slider Ready: ${slides.length} slides`
  );

}


/* =========================================================
   LOAD FIREBASE STORE
   ========================================================= */

async function loadStore() {

  try {

    const [
      productSnapshot,
      categorySnapshot,
      settingsSnapshot
    ] = await Promise.all([

      getDocs(
        query(
          collection(db, "products"),
          where("published", "==", true)
        )
      ),

      getDocs(
        collection(db, "categories")
      ),

      getDoc(
        doc(db, "settings", "store")
      )

    ]);


    products =
      productSnapshot.docs.map(
        (document) => ({
          id: document.id,
          ...document.data()
        })
      );


    categories =
      categorySnapshot.docs.map(
        (document) => ({
          id: document.id,
          ...document.data()
        })
      );


    if (!categories.length) {

      categories =
        demoCategories.map(
          (name, index) => ({
            id: "demo-" + index,
            name,
            active: true
          })
        );

    }


    settings =
      settingsSnapshot.exists()
        ? settingsSnapshot.data()
        : {};


    showSettings();

    renderCategories();

    renderProducts();

    renderPopularProducts();

    renderWishlistSection();

    renderCart();

  } catch (error) {

    console.error(
      "Store loading error:",
      error
    );


    const grid =
      $("#grid");


    if (grid) {

      grid.innerHTML = `
        <div class="mx-loading">
          পণ্য লোড করা যায়নি।
          Firebase configuration এবং
          Firestore Rules পরীক্ষা করুন।
        </div>
      `;

    }


    const popular =
      $("#popularGrid");


    if (popular) {

      popular.innerHTML = `
        <div class="mx-loading">
          Popular products load করা যায়নি।
        </div>
      `;

    }

  }

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
    <button
      type="button"
      class="active"
      data-category=""
    >
      সব পণ্য
    </button>

    ${categories
      .filter(
        (category) =>
          category.active !== false
      )
      .map(
        (category) => `
          <button
            type="button"
            data-category="${escapeHtml(
              category.name || ""
            )}"
          >
            ${escapeHtml(
              category.name || "Category"
            )}
          </button>
        `
      )
      .join("")}
  `;


  host
    .querySelectorAll("[data-category]")
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          activeCategory =
            button.dataset.category || "";

          host
            .querySelectorAll("[data-category]")
            .forEach((item) =>
              item.classList.remove("active")
            );

          button.classList.add("active");

          renderProducts(activeCategory);

          $("#products")
            ?.scrollIntoView({
              behavior: "smooth"
            });
        }
      );
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
          ${escapeHtml(product.category || "")}
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
              ? `✓ In Stock (${stock})`
              : "Out of Stock"
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
          DETAILS
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

function renderProducts(
  category = activeCategory
) {

  const host = $("#grid");

  if (!host) return;

  activeCategory = category || "";


  const search =
    ($("#search")?.value || "")
      .trim()
      .toLowerCase();


  const stockFilter =
    $("#stock")?.value || "all";


  let list = products.filter(
    (product) => {

      const text = `
        ${product.name || ""}
        ${product.nameEn || ""}
        ${product.code || ""}
        ${product.category || ""}
        ${product.description || ""}
      `.toLowerCase();


      const categoryMatch =
        !activeCategory ||
        String(
          product.category || ""
        ).toLowerCase() ===
        String(
          activeCategory
        ).toLowerCase();


      const searchMatch =
        !search ||
        text.includes(search);


      const stock =
        productStock(product);


      const stockMatch =
        stockFilter !== "in" ||
        stock > 0;


      return (
        categoryMatch &&
        searchMatch &&
        stockMatch
      );

    }
  );


  const sort =
    $("#sort")?.value ||
    "default";


  if (sort === "price-asc") {

    list.sort(
      (a, b) =>
        productPrice(a) -
        productPrice(b)
    );

  }


  if (sort === "price-desc") {

    list.sort(
      (a, b) =>
        productPrice(b) -
        productPrice(a)
    );

  }


  if (sort === "newest") {

    list.sort(
      (a, b) =>
        (b.createdAt?.seconds || 0) -
        (a.createdAt?.seconds || 0)
    );

  }


  host.innerHTML =
    list.length
      ? list
          .map(productCard)
          .join("")
      : `
        <div class="mx-loading">
          কোনো পণ্য পাওয়া যায়নি।
        </div>
      `;


  bindProductButtons(host);
}


/* =========================================================
   POPULAR PRODUCTS
   ========================================================= */

function renderPopularProducts() {

  const host = $("#popularGrid");

  if (!host) return;


  if (!products.length) {

    host.innerHTML = `
      <div class="mx-loading">
        এখনো কোনো পণ্য যোগ করা হয়নি।
      </div>
    `;

    return;

  }


  const score = (product) =>
    Number(
      product.ratingAverage ||
      product.rating ||
      0
    ) * 10 +

    Number(
      product.reviewCount || 0
    ) +

    Number(
      product.deliveredSales ||
      product.soldCount ||
      0
    ) * 2;


  const list =
    [...products]
      .sort(
        (a, b) =>
          score(b) - score(a)
      )
      .slice(0, 5);


  host.innerHTML =
    list
      .map(productCard)
      .join("");


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

  const product =
    products.find(
      (item) =>
        item.id === id
    );


  if (!product) return;


  const image =
    safeImage(product);


  let variants = [];


  if (
    Array.isArray(product.variants) &&
    product.variants.length
  ) {

    variants =
      product.variants.filter(
        (variant) =>
          Number(variant.stock || 0) > 0
      );

  }


  if (
    !variants.length &&
    Number(product.stock || 0) > 0
  ) {

    variants = [{

      sku:
        product.sku ||
        product.code ||
        product.id,

      size: "",

      color: "",

      sell:
        productPrice(product),

      stock:
        Number(product.stock || 0)

    }];

  }


  const detail = $("#detail");

  const body = $("#detailBody");


  if (!detail || !body) return;


  body.innerHTML = `

    <div
      class="mx-detail-grid"
      style="
        display:grid;
        grid-template-columns:minmax(250px,1fr) minmax(280px,1fr);
        gap:30px;
      "
    >

      <div>

        <img
          src="${escapeHtml(image)}"
          alt="${escapeHtml(productName(product))}"
          style="
            width:100%;
            border-radius:16px;
            background:#f5f7fa;
          "
          onerror="this.src='assets/images/placeholder.svg'"
        >

      </div>


      <div>

        <div
          style="
            color:#f51231;
            font-weight:800;
            font-size:12px;
          "
        >
          ${escapeHtml(product.category || "")}
        </div>


        <h2
          style="
            margin:7px 0 10px;
            color:#052f62;
          "
        >
          ${escapeHtml(productName(product))}
        </h2>


        ${
          product.code
            ? `
              <p>
                Product Code:
                <b>${escapeHtml(product.code)}</b>
              </p>
            `
            : ""
        }


        ${
          product.description
            ? `
              <p
                style="
                  margin:12px 0;
                  color:#64768d;
                "
              >
                ${escapeHtml(product.description)}
              </p>
            `
            : ""
        }


        <div
          class="price"
          style="
            margin:15px 0;
            font-size:28px;
          "
        >
          ${money(productPrice(product))}
        </div>


        ${
          variants.length
            ? `

              <label>
                <b>Size / Color</b>
              </label>


              <select
                class="field"
                id="variantSelect"
                style="margin-top:7px;"
              >

                ${variants
                  .map(
                    (variant, index) => `

                      <option value="${index}">

                        ${variant.size || "Standard"}

                        ${
                          variant.color
                            ? " / " + variant.color
                            : ""
                        }

                        —

                        ${money(
                          variant.sell ||
                          productPrice(product)
                        )}

                        (${Number(
                          variant.stock || 0
                        )} available)

                      </option>

                    `
                  )
                  .join("")}

              </select>


              <br><br>


              <label>
                <b>Quantity</b>
              </label>


              <input
                class="field"
                id="productQty"
                type="number"
                min="1"
                value="1"
                style="
                  margin-top:7px;
                  max-width:130px;
                "
              >


              <br><br>


              <button
                type="button"
                class="btn primary"
                id="addCart"
                style="width:100%;"
              >
                ADD TO CART
              </button>

            `
            : `

              <div
                style="
                  padding:14px;
                  border-radius:10px;
                  background:#fff0f2;
                  color:#d30b29;
                  font-weight:800;
                "
              >
                এই পণ্যটি বর্তমানে Out of Stock
              </div>

            `
        }

      </div>

    </div>
  `;


  openModal(detail);


  if (!variants.length) return;


  $("#addCart").onclick = () => {

    const index =
      Number(
        $("#variantSelect").value
      );


    const variant =
      variants[index];


    const quantity =
      Math.max(
        1,
        Number(
          $("#productQty").value
        )
      );


    const availableStock =
      Number(variant.stock || 0);


    if (quantity > availableStock) {

      alert("পর্যাপ্ত স্টক নেই।");

      return;

    }


    const sku =
      variant.sku ||
      product.sku ||
      product.code ||
      "default";


    const key =
      product.id +
      "|" +
      sku +
      "|" +
      (variant.size || "") +
      "|" +
      (variant.color || "");


    const existing =
      cart.find(
        (item) =>
          item.key === key
      );


    if (existing) {

      if (
        existing.qty + quantity >
        availableStock
      ) {

        alert("পর্যাপ্ত স্টক নেই।");

        return;

      }


      existing.qty += quantity;

    } else {

      cart.push({

        key,

        productId:
          product.id,

        name:
          productName(product),

        image,

        sku,

        size:
          variant.size || "",

        color:
          variant.color || "",

        price:
          Number(
            variant.sell ||
            productPrice(product)
          ),

        qty:
          quantity,

        maxStock:
          availableStock,

        selected:
          true

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
        total +
        Number(item.qty || 0),
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

                  <b>
                    ${escapeHtml(item.name)}
                  </b>

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


                <strong
                  style="color:#f51231;"
                >
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
          Number(
            button.dataset.remove
          );


        cart.splice(index, 1);

        saveCart();

      };

    });


  $$("[data-qty]")
    .forEach((input) => {

      input.onchange = () => {

        const index =
          Number(
            input.dataset.qty
          );


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
          Number(
            input.dataset.select
          );


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
    "visible"
  );

}
/* =========================================================
   MODAL CLOSE BUTTONS
   ========================================================= */

document.addEventListener(
  "click",
  (event) => {

    if (
      event.target.matches(
        "[data-close-cart]"
      )
    ) {
      closeModal($("#cart"));
    }


    if (
      event.target.matches(
        "[data-close-detail]"
      )
    ) {
      closeModal($("#detail"));
    }


    if (
      event.target.matches(
        "[data-close-account]"
      )
    ) {
      closeModal($("#accountModal"));
    }


    if (
      event.target.matches(
        "[data-close-checkout]"
      )
    ) {
      closeModal($("#checkoutModal"));
    }


    if (
      event.target.matches(
        "[data-close-success]"
      )
    ) {
      closeModal($("#successModal"));
    }

  }
);


/* =========================================================
   CART BUTTON
   ========================================================= */

const cartButton =
  $("#cartBtn");


if (cartButton) {

  cartButton.addEventListener(
    "click",
    () => {

      renderCart();

      openModal($("#cart"));

    }
  );

}


/* =========================================================
   CHECKOUT BUTTON
   ========================================================= */

const checkoutButton =
  $("#checkout");


if (checkoutButton) {

  checkoutButton.addEventListener(
    "click",
    () => {

      const selectedItems =
        cart.filter(
          (item) =>
            item.selected !== false
        );


      if (!selectedItems.length) {

        alert(
          "Checkout করার জন্য অন্তত একটি পণ্য নির্বাচন করুন।"
        );

        return;

      }


      closeModal($("#cart"));

      openModal(
        $("#checkoutModal")
      );

    }
  );

}


/* =========================================================
   PAYMENT METHOD
   ========================================================= */

const paymentMethod =
  $("#paymentMethod");


if (paymentMethod) {

  paymentMethod.addEventListener(
    "change",
    () => {

      const paymentInfo =
        $("#mobilePaymentInfo");


      const transaction =
        $("#transactionId");


      const mobilePayment =
        paymentMethod.value === "bkash" ||
        paymentMethod.value === "nagad";


      if (paymentInfo) {

        paymentInfo.style.display =
          mobilePayment
            ? "block"
            : "none";

      }


      if (transaction) {

        transaction.required =
          mobilePayment;

      }

    }
  );

}


/* =========================================================
   BANGLADESH ADDRESS
   ========================================================= */

const bangladeshAddress = {

  "Dhaka": {
    "Dhaka": [
      "Dhaka City",
      "Savar",
      "Dhamrai",
      "Keraniganj",
      "Nawabganj",
      "Dohar"
    ],

    "Gazipur": [
      "Gazipur Sadar",
      "Kaliakair",
      "Kapasia",
      "Kaliganj",
      "Sreepur"
    ],

    "Narayanganj": [
      "Narayanganj Sadar",
      "Araihazar",
      "Bandar",
      "Rupganj",
      "Sonargaon"
    ]
  },


  "Chattogram": {

    "Cumilla": [
      "Cumilla Adarsha Sadar",
      "Cumilla Sadar Dakshin",
      "Barura",
      "Brahmanpara",
      "Burichang",
      "Chandina",
      "Chauddagram",
      "Daudkandi",
      "Debidwar",
      "Homna",
      "Laksam",
      "Lalmai",
      "Meghna",
      "Monoharganj",
      "Muradnagar",
      "Nangalkot",
      "Titas"
    ],

    "Chattogram": [
      "Chattogram City",
      "Anwara",
      "Banshkhali",
      "Boalkhali",
      "Chandanaish",
      "Fatikchhari",
      "Hathazari",
      "Lohagara",
      "Mirsharai",
      "Patiya",
      "Rangunia",
      "Raozan",
      "Sandwip",
      "Satkania",
      "Sitakunda"
    ],

    "Brahmanbaria": [
      "Brahmanbaria Sadar",
      "Akhaura",
      "Ashuganj",
      "Bancharampur",
      "Bijoynagar",
      "Kasba",
      "Nabinagar",
      "Nasirnagar",
      "Sarail"
    ],

    "Chandpur": [
      "Chandpur Sadar",
      "Faridganj",
      "Haimchar",
      "Hajiganj",
      "Kachua",
      "Matlab Dakshin",
      "Matlab Uttar",
      "Shahrasti"
    ],

    "Feni": [
      "Feni Sadar",
      "Chhagalnaiya",
      "Daganbhuiyan",
      "Fulgazi",
      "Parshuram",
      "Sonagazi"
    ],

    "Noakhali": [
      "Noakhali Sadar",
      "Begumganj",
      "Chatkhil",
      "Companiganj",
      "Hatiya",
      "Kabirhat",
      "Senbagh",
      "Sonaimuri",
      "Subarnachar"
    ],

    "Lakshmipur": [
      "Lakshmipur Sadar",
      "Raipur",
      "Ramganj",
      "Ramgati",
      "Kamalnagar"
    ],

    "Cox's Bazar": [
      "Cox's Bazar Sadar",
      "Chakaria",
      "Kutubdia",
      "Maheshkhali",
      "Pekua",
      "Ramu",
      "Teknaf",
      "Ukhia"
    ]
  },


  "Rajshahi": {

    "Rajshahi": [
      "Rajshahi City",
      "Bagha",
      "Bagmara",
      "Charghat",
      "Durgapur",
      "Godagari",
      "Mohanpur",
      "Paba",
      "Puthia",
      "Tanore"
    ],

    "Bogura": [
      "Bogura Sadar",
      "Adamdighi",
      "Dhunat",
      "Dupchanchia",
      "Gabtali",
      "Kahaloo",
      "Nandigram",
      "Sariakandi",
      "Shajahanpur",
      "Sherpur",
      "Shibganj",
      "Sonatala"
    ]
  },


  "Khulna": {

    "Khulna": [
      "Khulna City",
      "Batiaghata",
      "Dacope",
      "Dumuria",
      "Dighalia",
      "Koyra",
      "Paikgacha",
      "Phultala",
      "Rupsa",
      "Terokhada"
    ],

    "Jashore": [
      "Jashore Sadar",
      "Abhaynagar",
      "Bagherpara",
      "Chaugachha",
      "Jhikargacha",
      "Keshabpur",
      "Manirampur",
      "Sharsha"
    ]
  },


  "Barishal": {

    "Barishal": [
      "Barishal Sadar",
      "Agailjhara",
      "Babuganj",
      "Bakerganj",
      "Banaripara",
      "Gournadi",
      "Hizla",
      "Mehendiganj",
      "Muladi",
      "Wazirpur"
    ]
  },


  "Sylhet": {

    "Sylhet": [
      "Sylhet Sadar",
      "Balaganj",
      "Beanibazar",
      "Bishwanath",
      "Companiganj",
      "Dakshin Surma",
      "Fenchuganj",
      "Golapganj",
      "Gowainghat",
      "Jaintiapur",
      "Kanaighat",
      "Osmaninagar",
      "Zakiganj"
    ]
  },


  "Rangpur": {

    "Rangpur": [
      "Rangpur Sadar",
      "Badarganj",
      "Gangachara",
      "Kaunia",
      "Mithapukur",
      "Pirgachha",
      "Pirganj",
      "Taraganj"
    ]
  },


  "Mymensingh": {

    "Mymensingh": [
      "Mymensingh Sadar",
      "Bhaluka",
      "Dhobaura",
      "Fulbaria",
      "Gaffargaon",
      "Gauripur",
      "Haluaghat",
      "Ishwarganj",
      "Muktagachha",
      "Nandail",
      "Phulpur",
      "Trishal"
    ]
  }

};


/* =========================================================
   ADDRESS SELECTORS
   ========================================================= */

function initAddressSelectors() {

  const division =
    $("#division");

  const district =
    $("#district");

  const upazila =
    $("#upazila");


  if (
    !division ||
    !district ||
    !upazila
  ) {
    return;
  }


  division.innerHTML = `
    <option value="">
      বিভাগ নির্বাচন করুন
    </option>
  `;


  Object.keys(
    bangladeshAddress
  ).forEach(
    (divisionName) => {

      division.insertAdjacentHTML(
        "beforeend",
        `
          <option value="${escapeHtml(
            divisionName
          )}">
            ${escapeHtml(
              divisionName
            )}
          </option>
        `
      );

    }
  );


  division.addEventListener(
    "change",
    () => {

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


      const districts =
        bangladeshAddress[
          division.value
        ] || {};


      Object.keys(
        districts
      ).forEach(
        (districtName) => {

          district.insertAdjacentHTML(
            "beforeend",
            `
              <option value="${escapeHtml(
                districtName
              )}">
                ${escapeHtml(
                  districtName
                )}
              </option>
            `
          );

        }
      );

    }
  );


  district.addEventListener(
    "change",
    () => {

      upazila.innerHTML = `
        <option value="">
          উপজেলা / থানা নির্বাচন করুন
        </option>
      `;


      const upazilas =
        bangladeshAddress[
          division.value
        ]?.[
          district.value
        ] || [];


      upazilas.forEach(
        (upazilaName) => {

          upazila.insertAdjacentHTML(
            "beforeend",
            `
              <option value="${escapeHtml(
                upazilaName
              )}">
                ${escapeHtml(
                  upazilaName
                )}
              </option>
            `
          );

        }
      );

    }
  );

}


/* =========================================================
   DELIVERY CHARGE
   ========================================================= */

function deliveryCharge() {

  const district =
    $("#district")?.value || "";


  if (district === "Cumilla") {

    return 80;

  }


  return 150;

}


/* =========================================================
   CHECKOUT FORM
   ========================================================= */

const checkoutForm =
  $("#checkoutForm");


if (checkoutForm) {

  checkoutForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const selectedItems =
        cart.filter(
          (item) =>
            item.selected !== false
        );


      if (!selectedItems.length) {

        alert(
          "অর্ডারের জন্য কোনো পণ্য নির্বাচন করা হয়নি।"
        );

        return;

      }


      const formData =
        new FormData(
          checkoutForm
        );


      const name =
        String(
          formData.get("name") || ""
        ).trim();


      const phone =
        String(
          formData.get("phone") || ""
        ).trim();


      const division =
        String(
          formData.get("division") || ""
        ).trim();


      const district =
        String(
          formData.get("district") || ""
        ).trim();


      const upazila =
        String(
          formData.get("upazila") || ""
        ).trim();


      const area =
        String(
          formData.get("area") || ""
        ).trim();


      const address =
        String(
          formData.get("address") || ""
        ).trim();


      const payment =
        String(
          formData.get(
            "paymentMethod"
          ) || "cod"
        );


      const transactionId =
        String(
          formData.get(
            "transactionId"
          ) || ""
        ).trim();


      if (
        !name ||
        !phone ||
        !division ||
        !district ||
        !upazila ||
        !area ||
        !address
      ) {

        alert(
          "সব প্রয়োজনীয় তথ্য পূরণ করুন।"
        );

        return;

      }


      if (
        !/^01\d{9}$/.test(phone)
      ) {

        alert(
          "সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন।"
        );

        return;

      }


      if (
        (
          payment === "bkash" ||
          payment === "nagad"
        ) &&
        !transactionId
      ) {

        alert(
          "Transaction ID লিখুন।"
        );

        return;

      }


      const subtotal =
        selectedItems.reduce(
          (total, item) =>
            total +
            Number(item.price) *
            Number(item.qty),
          0
        );


      const delivery =
        deliveryCharge();


      const total =
        subtotal + delivery;


      const submitButton =
        checkoutForm.querySelector(
          'button[type="submit"]'
        );


      const originalText =
        submitButton?.textContent ||
        "CONFIRM ORDER";


      if (submitButton) {

        submitButton.disabled = true;

        submitButton.textContent =
          "ORDER PLACING...";

      }


      try {

        const orderData = {

          customer: {
            name,
            phone,
            division,
            district,
            upazila,
            area,
            address
          },

          items:
            selectedItems.map(
              (item) => ({

                productId:
                  item.productId,

                name:
                  item.name,

                sku:
                  item.sku || "",

                size:
                  item.size || "",

                color:
                  item.color || "",

                price:
                  Number(item.price),

                qty:
                  Number(item.qty),

                image:
                  item.image || ""

              })
            ),

          subtotal,

          deliveryCharge:
            delivery,

          total,

          paymentMethod:
            payment,

          transactionId:
            transactionId || "",

          paymentStatus:
            payment === "cod"
              ? "cash_on_delivery"
              : "verification_pending",

          status:
            "pending",

          source:
            "website",

          userId:
            user?.uid || null,

          createdAt:
            serverTimestamp()

        };


        const orderReference =
          await addDoc(
            collection(
              db,
              "orders"
            ),
            orderData
          );


        const orderedKeys =
          new Set(
            selectedItems.map(
              (item) => item.key
            )
          );


        cart =
          cart.filter(
            (item) =>
              !orderedKeys.has(
                item.key
              )
          );


        saveCart();


        checkoutForm.reset();


        if (
          $("#mobilePaymentInfo")
        ) {

          $("#mobilePaymentInfo")
            .style.display =
              "none";

        }


        closeModal(
          $("#checkoutModal")
        );


        const successInfo =
          $("#successOrderInfo");


        if (successInfo) {

          successInfo.innerHTML = `

            <div
              style="
                background:#f4f8fc;
                border-radius:12px;
                padding:15px;
                text-align:left;
              "
            >

              <div>
                Order ID:
                <b>
                  ${escapeHtml(
                    orderReference.id
                  )}
                </b>
              </div>

              <div
                style="
                  margin-top:7px;
                "
              >
                Total:
                <b>
                  ${money(total)}
                </b>
              </div>

              <div
                style="
                  margin-top:7px;
                "
              >
                Delivery:
                <b>
                  ${money(delivery)}
                </b>
              </div>

            </div>

          `;

        }


        openModal(
          $("#successModal")
        );

      } catch (error) {

        console.error(
          "Order error:",
          error
        );


        alert(
          "অর্ডার সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।"
        );

      } finally {

        if (submitButton) {

          submitButton.disabled =
            false;

          submitButton.textContent =
            originalText;

        }

      }

    }
  );

}


/* =========================================================
   ACCOUNT / AUTH
   ========================================================= */

function renderAccount() {

  const body =
    $("#accountBody");


  if (!body) return;


  if (user) {

    body.innerHTML = `

      <div
        style="
          text-align:center;
          padding:15px 0;
        "
      >

        <div
          style="
            width:70px;
            height:70px;
            margin:0 auto 12px;
            border-radius:50%;
            background:#eaf4ff;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:32px;
          "
        >
          ♙
        </div>


        <h3>
          Welcome
        </h3>


        <p>
          ${escapeHtml(
            user.email || ""
          )}
        </p>


        <button
          type="button"
          class="btn primary"
          id="logoutBtn"
          style="
            width:100%;
            margin-top:15px;
          "
        >
          LOGOUT
        </button>

      </div>

    `;


    $("#logoutBtn").onclick =
      async () => {

        try {

          await signOut(auth);

          closeModal(
            $("#accountModal")
          );

        } catch (error) {

          console.error(
            error
          );

        }

      };


    return;

  }


  body.innerHTML = `

    <div
      style="
        display:grid;
        gap:12px;
      "
    >

      <input
        class="field"
        id="authEmail"
        type="email"
        placeholder="Email Address"
      >


      <input
        class="field"
        id="authPassword"
        type="password"
        placeholder="Password"
      >


      <button
        type="button"
        class="btn primary"
        id="loginBtn"
      >
        LOGIN
      </button>


      <button
        type="button"
        class="btn light"
        id="registerBtn"
      >
        CREATE ACCOUNT
      </button>


      <button
        type="button"
        id="forgotBtn"
        style="
          border:0;
          background:none;
          color:#0569c9;
          cursor:pointer;
        "
      >
        Forgot Password?
      </button>


      <div
        id="authMessage"
        style="
          font-size:13px;
          text-align:center;
        "
      ></div>

    </div>

  `;


  const message =
    $("#authMessage");


  $("#loginBtn").onclick =
    async () => {

      const email =
        $("#authEmail").value.trim();


      const password =
        $("#authPassword").value;


      if (
        !email ||
        !password
      ) {

        message.textContent =
          "Email এবং Password লিখুন।";

        return;

      }


      try {

        message.textContent =
          "Login হচ্ছে...";


        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );


        message.textContent =
          "Login successful.";

      } catch (error) {

        console.error(error);

        message.textContent =
          "Login করা যায়নি। Email/Password পরীক্ষা করুন।";

      }

    };


  $("#registerBtn").onclick =
    async () => {

      const email =
        $("#authEmail").value.trim();


      const password =
        $("#authPassword").value;


      if (
        !email ||
        password.length < 6
      ) {

        message.textContent =
          "সঠিক Email এবং কমপক্ষে ৬ অক্ষরের Password দিন।";

        return;

      }


      try {

        message.textContent =
          "Account তৈরি হচ্ছে...";


        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );


        message.textContent =
          "Account তৈরি হয়েছে।";

      } catch (error) {

        console.error(error);

        message.textContent =
          "Account তৈরি করা যায়নি।";

      }

    };


  $("#forgotBtn").onclick =
    async () => {

      const email =
        $("#authEmail").value.trim();


      if (!email) {

        message.textContent =
          "প্রথমে Email Address লিখুন।";

        return;

      }


      try {

        await sendPasswordResetEmail(
          auth,
          email
        );


        message.textContent =
          "Password reset email পাঠানো হয়েছে।";

      } catch (error) {

        console.error(error);

        message.textContent =
          "Reset email পাঠানো যায়নি।";

      }

    };

}


onAuthStateChanged(
  auth,
  (currentUser) => {

    user =
      currentUser || null;


    renderAccount();


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
            ? "Account"
            : "Login";

      }

    }

  }
);


const accountButton =
  $("#account");


if (accountButton) {

  accountButton.addEventListener(
    "click",
    () => {

      renderAccount();

      openModal(
        $("#accountModal")
      );

    }
  );

}


/* =========================================================
   SEARCH / FILTER / SORT
   ========================================================= */

const searchInput =
  $("#search");


if (searchInput) {

  searchInput.addEventListener(
    "input",
    () => {

      renderProducts(
        activeCategory
      );

    }
  );

}


const stockFilter =
  $("#stock");


if (stockFilter) {

  stockFilter.addEventListener(
    "change",
    () => {

      renderProducts(
        activeCategory
      );

    }
  );

}


const sortFilter =
  $("#sort");


if (sortFilter) {

  sortFilter.addEventListener(
    "change",
    () => {

      renderProducts(
        activeCategory
      );

    }
  );

}


/* =========================================================
   LANGUAGE
   ========================================================= */

function initLanguageSwitch() {

  const buttons =
    $$(".mx-lang");


  buttons.forEach(
    (button) => {

      button.classList.toggle(
        "active",
        button.dataset.lang ===
          currentLanguage
      );


      button.addEventListener(
        "click",
        () => {

          currentLanguage =
            button.dataset.lang ||
            "bn";


          localStorage.setItem(
            "mx-lang",
            currentLanguage
          );


          buttons.forEach(
            (item) =>
              item.classList.toggle(
                "active",
                item === button
              )
          );


          renderProducts(
            activeCategory
          );

          renderPopularProducts();

          renderWishlistSection();

        }
      );

    }
  );

}


/* =========================================================
   VISUAL CATEGORY CARDS
   ========================================================= */

function initVisualCategories() {

  const cards =
    $$(".mx-category-card");


  cards.forEach(
    (card) => {

      card.addEventListener(
        "click",
        () => {

          const title =
            card.querySelector(
              ".mx-category-content b"
            )?.textContent?.trim();


          if (!title) return;


          const categoryMap = {

            "Football Jersey":
              "Football Jersey",

            "Cricket Jersey":
              "Cricket Jersey",

            "Kids Jersey":
              "Kids Jersey",

            "T-Shirt & Polo":
              "T-Shirt / Polo",

            "Shorts & Trouser":
              "Shorts / Trouser",

            "Football":
              "Football",

            "Cricket Equipment":
              "Cricket Equipment",

            "Badminton":
              "Badminton",

            "Custom Jersey":
              "Custom Jersey",

            "Custom Print":
              "Custom Print"

          };


          const mapped =
            categoryMap[title];


          if (mapped) {

            activeCategory =
              mapped;


            renderProducts(
              activeCategory
            );

          }

        }
      );

    }
  );

}


/* =========================================================
   START WEBSITE
   ========================================================= */

function startStore() {

  /*
    HERO FIRST

    Hero slider প্রথমে চালু হবে।
    তাই Firebase products load হতে
    অপেক্ষা করতে হবে না।
  */

  initBannerSlider();


  updateWishlistCount();

  renderCart();


  initLanguageSwitch();

  initAddressSelectors();

  initVisualCategories();


  /*
    এরপর Firebase Store Data load হবে।
  */

  loadStore();

}


/* =========================================================
   DOM READY
   ========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    startStore,
    {
      once: true
    }
  );

} else {

  startStore();

}
