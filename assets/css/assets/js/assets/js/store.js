/* =========================================================
   MEHEDI XPRESS — CUSTOMER STORE
   Sports • Fashion • Custom Print
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
   BASIC HELPERS
   ========================================================= */

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) =>
  [...document.querySelectorAll(selector)];

const money = (number) =>
  "৳" + Number(number || 0).toLocaleString("en-BD");


function escapeHtml(value = "") {

  return String(value).replace(
    /[&<>"']/g,
    (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[character])
  );

}


function safeImage(product) {

  if (
    product?.images &&
    Array.isArray(product.images) &&
    product.images.length
  ) {

    const first = product.images[0];

    if (typeof first === "string") {
      return first;
    }

    if (first?.url) {
      return first.url;
    }

  }

  if (product?.image) {
    return product.image;
  }

  if (product?.imageUrl) {
    return product.imageUrl;
  }

  return "assets/images/placeholder.svg";
}


/* =========================================================
   STORE STATE
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

  cart =
    JSON.parse(
      localStorage.getItem("mx-cart") || "[]"
    );

  if (!Array.isArray(cart)) {
    cart = [];
  }

} catch {

  cart = [];

}


try {

  wishlist =
    JSON.parse(
      localStorage.getItem("mx-wishlist") || "[]"
    );

  if (!Array.isArray(wishlist)) {
    wishlist = [];
  }

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

  const regular =
    regularPrice(product);

  const sale =
    Number(product?.salePrice || 0);

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
   LOCAL STORAGE
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

    wishlist =
      wishlist.filter(
        (itemId) => itemId !== id
      );

  } else {

    wishlist.push(id);

  }

  saveWishlist();
}


function updateWishlistCount() {

  const element =
    $("#wishlistCount");

  if (element) {

    element.textContent =
      wishlist.length;

  }
}


/* =========================================================
   FIREBASE STORE LOAD
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
   STORE SETTINGS
   ========================================================= */

function showSettings() {

  const phone =
    settings.phone ||
    "+8801612961523";


  const phoneElement =
    $("#phone");


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
   CATEGORY FILTER
   ========================================================= */

function renderCategories() {

  const host =
    $("#cats");

  if (!host) {
    return;
  }


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
            .querySelectorAll(
              "[data-category]"
            )
            .forEach(
              (item) =>
                item.classList.remove(
                  "active"
                )
            );


          button.classList.add(
            "active"
          );


          renderProducts(
            activeCategory
          );


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

  const image =
    safeImage(product);

  const stock =
    productStock(product);

  const price =
    productPrice(product);

  const oldPrice =
    regularPrice(product);

  const discount =
    discountPercent(product);

  const wished =
    isWished(product.id);


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
          alt="${escapeHtml(
            productName(product)
          )}"
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
          ${escapeHtml(
            product.category || ""
          )}
        </div>


        <h3>
          ${escapeHtml(
            productName(product)
          )}
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
            color:${
              stock > 0
                ? "#159447"
                : "#e10b2c"
            };
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

function bindProductButtons(
  root = document
) {

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

      button.onclick = (
        event
      ) => {

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

  const host =
    $("#grid");

  if (!host) {
    return;
  }


  activeCategory =
    category || "";


  const search =
    ($("#search")?.value || "")
      .trim()
      .toLowerCase();


  const stockFilter =
    $("#stock")?.value || "all";


  let list =
    products.filter(
      (product) => {

        const text = `

          ${product.name || ""}

          ${product.nameEn || ""}

          ${product.code || ""}

          ${product.category || ""}

          ${product.description || ""}

        `
          .toLowerCase();


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

  const host =
    $("#popularGrid");

  if (!host) {
    return;
  }


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
          score(b) -
          score(a)
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

  const host =
    $("#wishlistGrid");

  if (!host) {
    return;
  }


  const list =
    products.filter(
      (product) =>
        wishlist.includes(
          product.id
        )
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


  if (!product) {
    return;
  }


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
          Number(
            variant.stock || 0
          ) > 0
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


  const detail =
    $("#detail");


  const body =
    $("#detailBody");


  if (!detail || !body) {
    return;
  }


  body.innerHTML = `

    <div
      style="
        display:grid;
        grid-template-columns:
          minmax(250px,1fr)
          minmax(280px,1fr);
        gap:30px;
      "
      class="mx-detail-grid"
    >

      <div>

        <img
          src="${escapeHtml(image)}"
          alt="${escapeHtml(
            productName(product)
          )}"
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
          ${escapeHtml(
            product.category || ""
          )}
        </div>


        <h2
          style="
            margin:7px 0 10px;
            color:#052f62;
          "
        >
          ${escapeHtml(
            productName(product)
          )}
        </h2>


        ${
          product.code
            ? `
              <p>
                Product Code:
                <b>
                  ${escapeHtml(
                    product.code
                  )}
                </b>
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
                ${escapeHtml(
                  product.description
                )}
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
          ${money(
            productPrice(product)
          )}
        </div>


        ${
          Number(
            product.reviewCount || 0
          ) > 0

            ? `
              <p
                style="
                  margin-bottom:15px;
                "
              >
                ⭐
                ${Number(
                  product.ratingAverage ||
                  product.rating ||
                  0
                ).toFixed(1)}

                (${Number(
                  product.reviewCount || 0
                )} reviews)
              </p>
            `

            : ""
        }


        ${
          variants.length

            ? `

              <label>
                <b>
                  Size / Color
                </b>
              </label>

              <select
                class="field"
                id="variantSelect"
                style="margin-top:7px;"
              >

                ${variants
                  .map(
                    (
                      variant,
                      index
                    ) => `

                      <option
                        value="${index}"
                      >

                        ${
                          variant.size ||
                          "Standard"
                        }

                        ${
                          variant.color
                            ? " / " +
                              variant.color
                            : ""
                        }

                        —
                        ${money(
                          variant.sell ||
                          productPrice(
                            product
                          )
                        )}

                        (${Number(
                          variant.stock ||
                          0
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
                style="
                  width:100%;
                "
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


  if (!variants.length) {
    return;
  }


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
      Number(
        variant.stock || 0
      );


    if (
      quantity >
      availableStock
    ) {

      alert(
        "পর্যাপ্ত স্টক নেই।"
      );

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
        existing.qty +
          quantity >
        availableStock
      ) {

        alert(
          "পর্যাপ্ত স্টক নেই।"
        );

        return;
      }


      existing.qty +=
        quantity;

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

    openModal(
      $("#cart")
    );

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


  if (!cartItems) {
    return;
  }


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
                grid-template-columns:
                  72px 1fr;
                gap:12px;
              "
            >

              <img
                src="${escapeHtml(
                  item.image ||
                  "assets/images/placeholder.svg"
                )}"
                alt="${escapeHtml(
                  item.name
                )}"
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
                    ${escapeHtml(
                      item.name
                    )}
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
                        escapeHtml(
                          item.size
                        )
                      : ""
                  }

                  ${
                    item.color
                      ? " • Color: " +
                        escapeHtml(
                          item.color
                        )
                      : ""
                  }

                </div>


                <strong
                  style="
                    color:#f51231;
                  "
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
                    max="${
                      item.maxStock || 999
                    }"
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


        cart.splice(
          index,
          1
        );


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


        if (!item) {
          return;
        }


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


        item.qty =
          quantity;


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


        if (!cart[index]) {
          return;
        }


        cart[index].selected =
          input.checked;


        saveCart();

      };

    });

}


/* =========================================================
   MODAL / DRAWER
   ========================================================= */

function openModal(element) {

  if (!element) {
    return;
  }

  element.classList.add(
    "active"
  );

}


function closeModal(element) {

  if (!element) {
    return;
  }

  element.classList.remove(
    "active",
    "open",
    "show",
    "on"
  );

}


/* =========================================================
   CLOSE BUTTONS
   ========================================================= */

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
    () =>
      closeModal(
        $("#accountModal")
      )
  );


$("[data-close-checkout]")
  ?.addEventListener(
    "click",
    () =>
      closeModal(
        $("#checkoutModal")
      )
  );


/* Click outside modal */

[
  "#cart",
  "#detail",
  "#accountModal",
  "#checkoutModal"
].forEach((selector) => {

  const element =
    $(selector);


  element?.addEventListener(
    "click",
    (event) => {

      if (
        event.target === element
      ) {

        closeModal(element);

      }

    }
  );

});


/* ESC */

document.addEventListener(
  "keydown",
  (event) => {

    if (event.key !== "Escape") {
      return;
    }


    [
      "#cart",
      "#detail",
      "#accountModal",
      "#checkoutModal"
    ].forEach(
      (selector) =>
        closeModal(
          $(selector)
        )
    );

  }
);


/* =========================================================
   SEARCH / SORT / STOCK
   ========================================================= */

$("#search")
  ?.addEventListener(
    "input",
    () =>
      renderProducts(
        activeCategory
      )
  );


$("#sort")
  ?.addEventListener(
    "change",
    () =>
      renderProducts(
        activeCategory
      )
  );


$("#stock")
  ?.addEventListener(
    "change",
    () =>
      renderProducts(
        activeCategory
      )
  );


/* =========================================================
   CART BUTTON
   ========================================================= */

$("#cartBtn")
  ?.addEventListener(
    "click",
    () => {

      renderCart();

      openModal(
        $("#cart")
      );

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


        closeModal(
          $("#cart")
        );


        showAccount();


        openModal(
          $("#accountModal")
        );


        return;
      }


      closeModal(
        $("#cart")
      );


      fillCheckoutProfile();


      openModal(
        $("#checkoutModal")
      );

    }
  );


/* =========================================================
   CHECKOUT
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
          new FormData(
            event.target
          )
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
        String(
          form.district || ""
        )
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
          paymentMethod ===
            "bkash" ||

          paymentMethod ===
            "nagad"
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
        );


      const orderData = {

        userId:
          user.uid,

        customerEmail:
          user.email || "",

        customerName:
          form.name || "",

        phone:
          form.phone || "",

        division:
          form.division || "",

        district:
          form.district || "",

        upazila:
          form.upazila || "",

        area:
          form.area || "",

        address:
          form.address || "",

        payment:
          paymentMethod,

        paymentMethod,

        trx:
          transactionId,

        transactionId,

        paymentStatus:
          paymentMethod === "cod"
            ? "COD"
            : "Pending Verification",

        items:
          orderItems,

        subtotal,

        delivery,

        total:
          subtotal +
          delivery,

        status:
          "Pending",

        stockState:
          "none",

        source:
          "Website",

        createdAt:
          serverTimestamp()

      };


      try {

        await addDoc(
          collection(
            db,
            "orders"
          ),
          orderData
        );


        cart =
          cart.filter(
            (item) =>
              item.selected === false
          );


        saveCart();


        event.target.reset();


        initAddressSelectors(
          true
        );


        closeModal(
          $("#checkoutModal")
        );


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

      openModal(
        $("#accountModal")
      );

    }
  );


function showAccount() {

  const host =
    $("#accountBody");


  if (!host) {
    return;
  }


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

          <b>
            আমার Account
          </b>

          <div
            style="
              color:#728399;
              font-size:13px;
            "
          >
            ${escapeHtml(
              user.email || ""
            )}
          </div>

        </div>

      </div>


      <div
        style="
          display:grid;
          gap:9px;
        "
      >

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
          style="
            color:#d90b29;
          "
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

    <div
      style="
        margin-bottom:18px;
      "
    >

      <h3>
        Login / Register
      </h3>

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

      <label>
        Email
      </label>

      <input
        class="field"
        name="email"
        type="email"
        placeholder="আপনার Email"
        required
      >


      <br><br>


      <label>
        Password
      </label>

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
          new FormData(
            event.target
          );


        try {

          await signInWithEmailAndPassword(

            auth,

            form.get("email"),

            form.get("password")

          );


          alert(
            "Login সফল হয়েছে।"
          );


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


        if (!formElement) {
          return;
        }


        const form =
          new FormData(
            formElement
          );


        const email =
          String(
            form.get("email") ||
            ""
          ).trim();


        const password =
          String(
            form.get("password") ||
            ""
          );


        if (
          !email ||
          !password
        ) {

          alert(
            "Email এবং Password লিখুন।"
          );

          return;
        }


        if (
          password.length < 6
        ) {

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

              email:
                result.user.email,

              name: "",

              phone: "",

              division: "",

              district: "",

              upazila: "",

              area: "",

              address: "",

              role:
                "customer",

              createdAt:
                serverTimestamp()

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


        if (!formElement) {
          return;
        }


        const form =
          new FormData(
            formElement
          );


        const email =
          String(
            form.get("email") ||
            ""
          ).trim();


        if (!email) {

          alert(
            "আগে Email লিখুন।"
          );

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

          alert(
            error.message
          );

        }

      }
    );

}


/* =========================================================
   PROFILE
   ========================================================= */

async function loadProfileEditor() {

  if (!user) {
    return;
  }


  const host =
    $("#profileEditor");


  if (!host) {
    return;
  }


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

        <h3
          style="
            margin-bottom:13px;
          "
        >
          Profile / Address
        </h3>


        <form id="profileForm">

          <input
            class="field"
            name="name"
            placeholder="আপনার নাম"
            value="${escapeHtml(
              profile.name || ""
            )}"
            required
          >

          <br><br>


          <input
            class="field"
            name="phone"
            placeholder="মোবাইল নম্বর"
            value="${escapeHtml(
              profile.phone || ""
            )}"
            required
          >

          <br><br>


          <input
            class="field"
            name="division"
            placeholder="বিভাগ"
            value="${escapeHtml(
              profile.division || ""
            )}"
          >

          <br><br>


          <input
            class="field"
            name="district"
            placeholder="জেলা"
            value="${escapeHtml(
              profile.district || ""
            )}"
          >

          <br><br>


          <input
            class="field"
            name="upazila"
            placeholder="উপজেলা / থানা"
            value="${escapeHtml(
              profile.upazila || ""
            )}"
          >

          <br><br>


          <input
            class="field"
            name="area"
            placeholder="এলাকা / গ্রাম"
            value="${escapeHtml(
              profile.area || ""
            )}"
          >

          <br><br>


          <textarea
            class="field"
            name="address"
            rows="3"
            placeholder="সম্পূর্ণ ঠিকানা"
          >${escapeHtml(
            profile.address || ""
          )}</textarea>

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
              new FormData(
                event.target
              )
            );


          try {

            await setDoc(

              reference,

              {

                ...data,

                email:
                  user.email || "",

                role:
                  "customer",

                updatedAt:
                  serverTimestamp()

              },

              {
                merge: true
              }

            );


            alert(
              "Profile Save হয়েছে।"
            );


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
      <p>
        Profile load করা যায়নি।
      </p>
    `;

  }

}


/* =========================================================
   FILL CHECKOUT FROM PROFILE
   ========================================================= */

async function fillCheckoutProfile() {

  if (!user) {
    return;
  }


  try {

    const snapshot =
      await getDoc(
        doc(
          db,
          "users",
          user.uid
        )
      );


    if (!snapshot.exists()) {
      return;
    }


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
      bdAddress[
        profile.division
      ]
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

  if (!user) {
    return;
  }


  const host =
    $("#myOrders");


  if (!host) {
    return;
  }


  host.innerHTML = `
    <div class="mx-loading">
      Order history load হচ্ছে...
    </div>
  `;


  try {

    const snapshot =
      await getDocs(

        query(

          collection(
            db,
            "orders"
          ),

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

          id:
            document.id,

          ...document.data()

        })
      );


    list.sort(
      (a, b) =>

        (
          b.createdAt?.seconds ||
          0
        ) -

        (
          a.createdAt?.seconds ||
          0
        )
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

        <h3
          style="
            margin-bottom:12px;
          "
        >
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
                    order.id.slice(
                      0,
                      8
                    )
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
                  <strong
                    style="
                      color:#f51231;
                    "
                  >
                    ${money(
                      order.total
                    )}
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
      <p>
        Order History load করা যায়নি।
      </p>
    `;

  }

}


/* =========================================================
   BANGLADESH ADDRESS DATA
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

function fillDistricts(
  divisionName
) {

  const district =
    $("#checkoutDistrict");


  const upazila =
    $("#checkoutUpazila");


  if (!district) {
    return;
  }


  const list =
    bdAddress[
      divisionName
    ] || [];


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


function fillUpazilas(
  districtName
) {

  const upazila =
    $("#checkoutUpazila");


  if (!upazila) {
    return;
  }


  const list =

    districtName ===
      "কুমিল্লা"

      ? cumillaUpazilas

      : [
          "অন্যান্য / আমার এলাকা"
        ];


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


function initAddressSelectors(
  force = false
) {

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


  division.dataset.ready =
    "1";


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
   HERO — 4 IMAGE AUTO SLIDER
   ========================================================= */

function initBannerSlider() {

  const slides =
    $$(".mx-banner-slide");


  const dotsHost =
    $("#bannerDots");


  const previous =
    $("#bannerPrev");


  const next =
    $("#bannerNext");


  if (
    !slides.length ||
    !dotsHost
  ) {

    return;
  }


  let currentIndex = 0;

  let timer = null;


  dotsHost.innerHTML =
    slides
      .map(
        (_, index) => `

          <button
            type="button"
            class="mx-banner-dot ${
              index === 0
                ? "active"
                : ""
            }"
            data-banner-dot="${index}"
            aria-label="Banner ${index + 1}"
          ></button>

        `
      )
      .join("");


  const dots =
    [
      ...dotsHost.querySelectorAll(
        "[data-banner-dot]"
      )
    ];


  function showSlide(index) {

    currentIndex =
      (
        index +
        slides.length
      ) %
      slides.length;


    slides.forEach(
      (slide, slideIndex) => {

        slide.classList.toggle(
          "active",
          slideIndex ===
            currentIndex
        );

      }
    );


    dots.forEach(
      (dot, dotIndex) => {

        dot.classList.toggle(
          "active",
          dotIndex ===
            currentIndex
        );

      }
    );

  }


  function stopAutoSlide() {

    if (timer) {

      clearInterval(timer);

      timer = null;

    }

  }


  function startAutoSlide() {

    stopAutoSlide();


    timer =
      setInterval(
        () => {

          showSlide(
            currentIndex + 1
          );

        },
        5500
      );

  }


  function restart() {

    startAutoSlide();

  }


  previous
    ?.addEventListener(
      "click",
      (event) => {

        event.preventDefault();

        event.stopPropagation();

        showSlide(
          currentIndex - 1
        );

        restart();

      }
    );


  next
    ?.addEventListener(
      "click",
      (event) => {

        event.preventDefault();

        event.stopPropagation();

        showSlide(
          currentIndex + 1
        );

        restart();

      }
    );


  dots.forEach(
    (dot) => {

      dot.addEventListener(
        "click",
        (event) => {

          event.preventDefault();

          event.stopPropagation();


          showSlide(
            Number(
              dot.dataset.bannerDot
            )
          );


          restart();

        }
      );

    }
  );


  /* pause when mouse over */

  const hero =
    $(".mx-hero");


  hero?.addEventListener(
    "mouseenter",
    stopAutoSlide
  );


  hero?.addEventListener(
    "mouseleave",
    startAutoSlide
  );


  /* swipe support */

  let touchStartX = 0;


  hero?.addEventListener(
    "touchstart",
    (event) => {

      touchStartX =
        event.touches[0]
          ?.clientX || 0;

    },
    {
      passive: true
    }
  );


  hero?.addEventListener(
    "touchend",
    (event) => {

      const touchEndX =
        event.changedTouches[0]
          ?.clientX || 0;


      const difference =
        touchStartX -
        touchEndX;


      if (
        Math.abs(
          difference
        ) < 45
      ) {

        return;
      }


      if (
        difference > 0
      ) {

        showSlide(
          currentIndex + 1
        );

      } else {

        showSlide(
          currentIndex - 1
        );

      }


      restart();

    },
    {
      passive: true
    }
  );


  showSlide(0);

  startAutoSlide();

}


/* =========================================================
   LANGUAGE SWITCH
   ========================================================= */

function initLanguageSwitch() {

  const buttons =
    $$(".mx-lang");


  if (!buttons.length) {
    return;
  }


  document.documentElement.lang =
    currentLanguage;


  function updateButtons() {

    buttons.forEach(
      (button) => {

        button.classList.toggle(
          "active",
          button.dataset.lang ===
            currentLanguage
        );

      }
    );

  }


  updateButtons();


  buttons.forEach(
    (button) => {

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


          document.documentElement.lang =
            currentLanguage;


          updateButtons();

          renderProducts();

          renderPopularProducts();

          renderWishlistSection();


          if (
            currentLanguage ===
            "en"
          ) {

            const search =
              $("#search");


            if (search) {

              search.placeholder =
                "Search products, jerseys or Product Code...";

            }


            const searchButton =
              $(".mx-search-button");


            if (searchButton) {

              searchButton.textContent =
                "Search";

            }

          } else {

            const search =
              $("#search");


            if (search) {

              search.placeholder =
                "পণ্য, জার্সি বা Product Code খুঁজুন...";

            }


            const searchButton =
              $(".mx-search-button");


            if (searchButton) {

              searchButton.textContent =
                "খুঁজুন";

            }

          }

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

    user =
      currentUser;


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
      (
        accountModal.classList.contains(
          "active"
        ) ||
        accountModal.classList.contains(
          "open"
        ) ||
        accountModal.classList.contains(
          "show"
        )
      )
    ) {

      showAccount();

    }

  }
);


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
      ([
        selector,
        category
      ]) => {

        $(selector)
          ?.addEventListener(
            "click",
            (event) => {

              event.preventDefault();


              activeCategory =
                category;


              renderProducts(
                category
              );


              $("#products")
                ?.scrollIntoView({
                  behavior:
                    "smooth"
                });

            }
          );

      }
    );

}


/* =========================================================
   INITIAL START
   ========================================================= */

function startStore() {

  updateWishlistCount();

  renderCart();

  initBannerSlider();

  initLanguageSwitch();

  initAddressSelectors();

  initVisualCategories();

  loadStore();

}


startStore();
