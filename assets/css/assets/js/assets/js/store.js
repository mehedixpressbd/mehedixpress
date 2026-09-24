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
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const $ = (s) => document.querySelector(s);
const money = (n) => "৳" + Number(n || 0).toLocaleString("en-BD");

let products = [];
let categories = [];
let settings = {};
let user = null;

let cart = JSON.parse(localStorage.getItem("mx-cart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("mx-wishlist") || "[]");
let activeCategory = "";

const demoCategories = [
  "Football Jersey",
  "Cricket Jersey",
  "Kids Jersey",
  "T-Shirt / Polo",
  "Shorts / Trouser",
  "Football & Cricket",
  "Badminton",
  "Custom Print"
];

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[ch]));
}

function saveWishlist() {
  localStorage.setItem("mx-wishlist", JSON.stringify(wishlist));
  renderProducts(activeCategory);
  renderWishlistSection();
}

function isWished(id) {
  return wishlist.includes(id);
}

function toggleWishlist(id) {
  wishlist = isWished(id)
    ? wishlist.filter(x => x !== id)
    : [...wishlist, id];

  saveWishlist();
}

function renderWishlistSection() {
  const host = document.querySelector("#wishlistGrid");

  if (!host) return;

  const list = products.filter(p => wishlist.includes(p.id));

  host.innerHTML = list.length
    ? list.map(productCard).join("")
    : '<p class="muted">❤️ পছন্দের পণ্য Heart বাটনে চাপ দিলে এখানে দেখা যাবে।</p>';

  bindProductButtons(host);
}

function saveCart() {
  localStorage.setItem("mx-cart", JSON.stringify(cart));
  renderCart();
}

async function loadStore() {
  try {
    const [productSnap, categorySnap, settingsSnap] =
      await Promise.all([
        getDocs(
          query(
            collection(db, "products"),
            where("published", "==", true)
          )
        ),
        getDocs(collection(db, "categories")),
        getDoc(doc(db, "settings", "store"))
      ]);

    products = productSnap.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));

    categories = categorySnap.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));

    if (!categories.length) {
      categories = demoCategories.map((name, i) => ({
        id: "demo-" + i,
        name,
        active: true
      }));
    }

    settings = settingsSnap.exists()
      ? settingsSnap.data()
      : {};

    showSettings();
    renderCategories();
    renderProducts();
    renderPopularProducts();
    renderWishlistSection();
    renderCart();

    initBannerSlider();
    initLanguageSwitch();
    initAddressSelectors();

  } catch (error) {
    console.error(error);

    $("#grid").innerHTML =
      "<p>ডাটা লোড হয়নি। Firebase configuration এবং Firestore Rules পরীক্ষা করুন।</p>";
  }
}

function showSettings() {
  if (settings.phone) {
    $("#phone").innerHTML = `
      <a
        style="color:white;text-decoration:none"
        href="tel:${settings.phone}">
        ${settings.phone}
      </a>
    `;
  }

  $("#footer").textContent =
    [
      settings.address,
      settings.phone,
      settings.hours
    ]
      .filter(Boolean)
      .join(" • ");
}

function productStock(product) {
  return (product.variants || [])
    .reduce(
      (total, variant) =>
        total + Number(variant.stock || 0),
      0
    );
}

function productPrice(product) {
  return Number(
    product.salePrice ||
    product.regularPrice ||
    product.variants?.[0]?.sell ||
    0
  );
}

function renderCategories() {
  $("#cats").innerHTML =
    `
      <button
        class="btn light"
        data-category="">
        সব
      </button>
    ` +

    categories
      .filter((category) => category.active !== false)
      .map(
        (category) => `
          <button
            class="btn light"
            data-category="${category.name}">
            ${category.name}
          </button>
        `
      )
      .join("");

  document
    .querySelectorAll("[data-category]")
    .forEach((button) => {

      button.onclick = () => {
        renderProducts(button.dataset.category);
      };

    });
}

function discountPercent(product) {
  const regular = Number(product.regularPrice || 0);
  const sale = Number(product.salePrice || 0);

  return regular > 0 &&
         sale > 0 &&
         sale < regular

    ? Math.round(
        ((regular - sale) / regular) * 100
      )

    : 0;
}

function productCard(product) {
  const image =
    product.images?.[0]?.url ||
    "assets/images/placeholder.svg";

  const stock = productStock(product);
  const discount = discountPercent(product);

  return `
    <article class="card">

      <button
        class="mx-wishlist-btn ${isWished(product.id) ? "on" : ""}"
        data-wish="${product.id}"
        aria-label="পছন্দের পণ্য">

        ${isWished(product.id) ? "♥" : "♡"}

      </button>

      ${
        discount
          ? `<span class="badge">-${discount}%</span>`
          : ""
      }

      <img
        src="${escapeHtml(image)}"
        alt="${escapeHtml(product.name || "Product")}">

      <h3>
        ${escapeHtml(product.name || "পণ্য")}
      </h3>

      <div class="muted">
        ${escapeHtml(product.code || "")}
      </div>

      <div class="price">

        ${money(productPrice(product))}

        ${
          product.salePrice &&
          Number(product.regularPrice) >
          Number(product.salePrice)

            ? `
              <span class="old">
                ${money(product.regularPrice)}
              </span>
            `

            : ""
        }

      </div>

      <p>
        ${stock > 0 ? "✓ In Stock" : "Out of Stock"}
      </p>

      <button
        class="btn light"
        data-detail="${product.id}">
        DETAILS
      </button>

    </article>
  `;
}

function bindProductButtons(root = document) {

  root
    .querySelectorAll("[data-detail]")
    .forEach(button => {

      button.onclick = () =>
        showProduct(button.dataset.detail);

    });


  root
    .querySelectorAll("[data-wish]")
    .forEach(button => {

      button.onclick = (e) => {

        e.stopPropagation();

        toggleWishlist(
          button.dataset.wish
        );
      };

    });
}

function renderProducts(category = activeCategory) {

  activeCategory = category || "";

  const search =
    ($("#search")?.value || "")
      .toLowerCase()
      .trim();

  const stockFilter =
    $("#stock")?.value || "";


  let list =
    products.filter(product => {

      const text =
        `${
          product.name || ""
        } ${
          product.code || ""
        } ${
          product.category || ""
        }`
          .toLowerCase();


      const categoryMatch =
        !activeCategory ||
        product.category === activeCategory;


      const searchMatch =
        !search ||
        text.includes(search);


      const stock =
        productStock(product);


      const stockMatch =
        !stockFilter ||
        (
          stockFilter === "in"
            ? stock > 0
            : stock <= 0
        );


      return (
        categoryMatch &&
        searchMatch &&
        stockMatch
      );
    });


  const sort =
    $("#sort")?.value || "new";


  if (sort === "low") {

    list.sort(
      (a, b) =>
        productPrice(a) -
        productPrice(b)
    );

  } else if (sort === "high") {

    list.sort(
      (a, b) =>
        productPrice(b) -
        productPrice(a)
    );

  } else {

    list.sort(
      (a, b) =>
        (b.createdAt?.seconds || 0) -
        (a.createdAt?.seconds || 0)
    );
  }


  $("#grid").innerHTML =
    list.length
      ? list.map(productCard).join("")
      : "<p>কোনো পণ্য পাওয়া যায়নি।</p>";


  bindProductButtons(
    $("#grid")
  );
}

function renderPopularProducts() {

  const host =
    document.querySelector("#popularGrid");


  if (
    !host ||
    !products.length
  ) {
    return;
  }


  const score = (product) =>

    Number(
      product.ratingAverage ||
      product.rating ||
      0
    ) * 10

    +

    Number(
      product.reviewCount ||
      0
    )

    +

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
      .slice(0, 4);


  host.innerHTML =
    list
      .map(productCard)
      .join("");


  bindProductButtons(host);
}

function showProduct(id) {

  const product =
    products.find(
      (p) => p.id === id
    );


  if (!product) return;


  const variants =
    (product.variants || [])
      .filter(
        (variant) =>
          Number(
            variant.stock || 0
          ) > 0
      );


  const image =
    product.images?.[0]?.url ||
    "assets/images/placeholder.svg";


  $("#detailBody").innerHTML = `

    <div class="grid">

      <div>

        <img
          style="width:100%;border-radius:12px"
          src="${image}"
          alt="${escapeHtml(product.name || "Product")}">

      </div>


      <div>

        <h2>
          ${escapeHtml(product.name || "")}
        </h2>


        <p>
          ${escapeHtml(product.description || "")}
        </p>


        <p class="muted">

          Category:
          ${escapeHtml(product.category || "-")}

          •

          Code:
          ${escapeHtml(product.code || "-")}

        </p>


        <p>

          ⭐
          ${Number(
            product.ratingAverage ||
            product.rating ||
            0
          ).toFixed(1)}

          (${Number(
            product.reviewCount ||
            0
          )} reviews)

        </p>


        <div class="price">

          ${money(
            productPrice(product)
          )}

        </div>


        ${
          variants.length

            ? `

              <label>
                Size / Color
              </label>


              <select
                class="field"
                id="variantSelect">

                ${
                  variants
                    .map(
                      (variant, index) => `

                        <option value="${index}">

                          ${escapeHtml(variant.size || "-")}

                          /

                          ${escapeHtml(variant.color || "-")}

                          —

                          ${money(variant.sell)}

                          (${variant.stock} available)

                        </option>

                      `
                    )
                    .join("")
                }

              </select>


              <br><br>


              <label>
                Quantity
              </label>


              <input
                class="field"
                id="productQty"
                type="number"
                min="1"
                value="1">


              <br><br>


              <button
                class="btn primary"
                id="addCart">

                ADD TO CART

              </button>

            `

            : `

              <p>
                <b>স্টক শেষ</b>
              </p>

            `
        }

      </div>

    </div>
  `;


  $("#detail")
    .classList
    .add("on");


  if (!variants.length) {
    return;
  }


  $("#addCart").onclick = () => {

    const variant =
      variants[
        Number(
          $("#variantSelect").value
        )
      ];


    const quantity =
      Math.max(
        1,
        Number(
          $("#productQty").value
        )
      );


    if (
      quantity >
      Number(variant.stock)
    ) {

      alert(
        "পর্যাপ্ত স্টক নেই।"
      );

      return;
    }


    const key =
      product.id +
      "|" +
      variant.sku;


    const existing =
      cart.find(
        (item) =>
          item.key === key
      );


    if (existing) {

      if (
        existing.qty + quantity >
        Number(variant.stock)
      ) {

        alert(
          "পর্যাপ্ত স্টক নেই।"
        );

        return;
      }


      existing.qty += quantity;

    } else {

      cart.push({

        key,

        productId:
          product.id,

        name:
          product.name,

        image,

        sku:
          variant.sku,

        size:
          variant.size || "",

        color:
          variant.color || "",

        price:
          Number(
            variant.sell || 0
          ),

        qty:
          quantity,

        selected:
          true
      });
    }


    saveCart();


    $("#detail")
      .classList
      .remove("on");
  };
}
