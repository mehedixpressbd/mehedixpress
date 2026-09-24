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
function renderCart() {

  const host = $("#cartItems");

  if (!host) return;


  $("#count").textContent =
    cart.reduce(
      (sum, item) =>
        sum + Number(item.qty || 0),
      0
    );


  if (!cart.length) {

    host.innerHTML =
      '<p class="muted">আপনার Cart খালি।</p>';

    $("#subtotal").textContent =
      "Subtotal: ৳0";

    return;
  }


  host.innerHTML =
    cart.map((item, index) => `

      <div class="cartitem">

        <input
          type="checkbox"
          data-select="${index}"
          ${item.selected !== false ? "checked" : ""}>


        <img
          src="${escapeHtml(
            item.image ||
            "assets/images/placeholder.svg"
          )}"
          alt="${escapeHtml(item.name)}">


        <div>

          <b>
            ${escapeHtml(item.name)}
          </b>


          <div class="muted">

            ${escapeHtml(item.size || "")}

            ${item.color ? " • " + escapeHtml(item.color) : ""}

          </div>


          <div>
            ${money(item.price)}
          </div>


          <div class="qty">

            <button
              type="button"
              data-minus="${index}">
              −
            </button>


            <span>
              ${item.qty}
            </span>


            <button
              type="button"
              data-plus="${index}">
              +
            </button>

          </div>

        </div>


        <button
          type="button"
          class="btn danger"
          data-remove="${index}">
          ×
        </button>

      </div>

    `).join("");


  const selectedItems =
    cart.filter(
      item =>
        item.selected !== false
    );


  const subtotal =
    selectedItems.reduce(
      (sum, item) =>
        sum +
        Number(item.price) *
        Number(item.qty),
      0
    );


  $("#subtotal").textContent =
    "Subtotal: " +
    money(subtotal);


  host
    .querySelectorAll("[data-select]")
    .forEach(input => {

      input.onchange = () => {

        const index =
          Number(
            input.dataset.select
          );


        cart[index].selected =
          input.checked;


        saveCart();
      };

    });


  host
    .querySelectorAll("[data-minus]")
    .forEach(button => {

      button.onclick = () => {

        const index =
          Number(
            button.dataset.minus
          );


        cart[index].qty =
          Math.max(
            1,
            Number(cart[index].qty) - 1
          );


        saveCart();
      };

    });


  host
    .querySelectorAll("[data-plus]")
    .forEach(button => {

      button.onclick = () => {

        const index =
          Number(
            button.dataset.plus
          );


        cart[index].qty =
          Number(
            cart[index].qty
          ) + 1;


        saveCart();
      };

    });


  host
    .querySelectorAll("[data-remove]")
    .forEach(button => {

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
}


$("#cartBtn").onclick = () => {

  renderCart();

  $("#cart")
    .classList
    .add("on");
};


document
  .querySelectorAll("[data-close]")
  .forEach(button => {

    button.onclick = () => {

      const id =
        button.dataset.close;


      document
        .getElementById(id)
        ?.classList
        .remove("on");
    };

  });


$("#search").addEventListener(
  "input",
  () =>
    renderProducts(
      activeCategory
    )
);


$("#stock").addEventListener(
  "change",
  () =>
    renderProducts(
      activeCategory
    )
);


$("#sort").addEventListener(
  "change",
  () =>
    renderProducts(
      activeCategory
    )
);


/* =====================================================
   CHECKOUT
===================================================== */

$("#checkout").onclick = () => {

  const selected =
    cart.filter(
      item =>
        item.selected !== false
    );


  if (!selected.length) {

    alert(
      "Checkout করার জন্য অন্তত একটি পণ্য Select করুন।"
    );

    return;
  }


  if (!user) {

    alert(
      "অর্ডার করার আগে Account-এ Login করুন।"
    );


    $("#cart")
      .classList
      .remove("on");


    openAccount();

    return;
  }


  $("#cart")
    .classList
    .remove("on");


  $("#checkoutModal")
    .classList
    .add("on");


  fillCheckoutProfile();
};


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


    if (!snapshot.exists()) {
      return;
    }


    const profile =
      snapshot.data();


    const form =
      $("#checkoutForm");


    if (profile.name) {
      form.name.value =
        profile.name;
    }


    if (profile.phone) {
      form.phone.value =
        profile.phone;
    }


    if (profile.address) {
      form.address.value =
        profile.address;
    }


    if (
      profile.division &&
      $("#checkoutDivision")
    ) {

      $("#checkoutDivision").value =
        profile.division;


      $("#checkoutDivision")
        .dispatchEvent(
          new Event("change")
        );
    }


    setTimeout(() => {

      if (
        profile.district &&
        $("#checkoutDistrict")
      ) {

        $("#checkoutDistrict").value =
          profile.district;


        $("#checkoutDistrict")
          .dispatchEvent(
            new Event("change")
          );
      }


      setTimeout(() => {

        if (
          profile.upazila &&
          $("#checkoutUpazila")
        ) {

          $("#checkoutUpazila").value =
            profile.upazila;
        }

      }, 50);

    }, 50);


    if (profile.area) {
      form.area.value =
        profile.area;
    }

  } catch (error) {

    console.error(
      "Profile fill error:",
      error
    );
  }
}


function deliveryCharge(
  district
) {

  const name =
    String(
      district || ""
    )
      .trim()
      .toLowerCase();


  const isCumilla =
    name.includes("cumilla") ||
    name.includes("comilla") ||
    name.includes("কুমিল্লা");


  return isCumilla

    ? Number(
        settings.insideDelivery ||
        80
      )

    : Number(
        settings.outsideDelivery ||
        150
      );
}


$("#checkoutForm")
  .addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      if (!user) {

        alert(
          "Login প্রয়োজন।"
        );

        return;
      }


      const selected =
        cart.filter(
          item =>
            item.selected !== false
        );


      if (!selected.length) {

        alert(
          "কোনো পণ্য Select করা নেই।"
        );

        return;
      }


      const form =
        new FormData(
          event.currentTarget
        );


      const customerName =
        String(
          form.get("name") || ""
        ).trim();


      const phone =
        String(
          form.get("phone") || ""
        ).trim();


      const division =
        String(
          form.get("division") || ""
        ).trim();


      const district =
        String(
          form.get("district") || ""
        ).trim();


      const upazila =
        String(
          form.get("upazila") || ""
        ).trim();


      const area =
        String(
          form.get("area") || ""
        ).trim();


      const address =
        String(
          form.get("address") || ""
        ).trim();


      const payment =
        String(
          form.get("payment") ||
          "Cash on Delivery"
        );


      const trx =
        String(
          form.get("trx") || ""
        ).trim();


      if (
        !customerName ||
        !phone ||
        !division ||
        !district ||
        !upazila ||
        !area ||
        !address
      ) {

        alert(
          "ঠিকানার সব প্রয়োজনীয় তথ্য পূরণ করুন।"
        );

        return;
      }


      if (
        payment !==
        "Cash on Delivery" &&
        !trx
      ) {

        alert(
          "bKash/Nagad পেমেন্টের Transaction ID লিখুন।"
        );

        return;
      }


      const subtotal =
        selected.reduce(
          (sum, item) =>
            sum +
            Number(item.price) *
            Number(item.qty),
          0
        );


      const delivery =
        deliveryCharge(
          district
        );


      const total =
        subtotal +
        delivery;


      const orderItems =
        selected.map(
          item => ({

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

            image:
              item.image || "",

            price:
              Number(item.price),

            qty:
              Number(item.qty)

          })
        );


      const submitButton =
        event.currentTarget
          .querySelector(
            '[type="submit"]'
          );


      submitButton.disabled =
        true;


      submitButton.textContent =
        "ORDER হচ্ছে...";


      try {

        const orderRef =
          await addDoc(
            collection(
              db,
              "orders"
            ),
            {

              userId:
                user.uid,

              customerName,

              phone,

              address: {

                division,
                district,
                upazila,
                area,
                fullAddress:
                  address

              },

              payment: {

                method:
                  payment,

                transactionId:
                  trx,

                status:
                  payment ===
                  "Cash on Delivery"

                    ? "COD"

                    : "Pending Verification"

              },

              items:
                orderItems,

              subtotal:
                Number(subtotal),

              delivery:
                Number(delivery),

              total:
                Number(total),

              status:
                "Pending",

              stockState:
                "none",

              source:
                "online",

              createdAt:
                serverTimestamp()

            }
          );


        const selectedKeys =
          new Set(
            selected.map(
              item =>
                item.key
            )
          );


        cart =
          cart.filter(
            item =>
              !selectedKeys.has(
                item.key
              )
          );


        saveCart();


        $("#checkoutModal")
          .classList
          .remove("on");


        event.currentTarget
          .reset();


        alert(
          "অর্ডার সফল হয়েছে।\n\nOrder ID: " +
          orderRef.id +
          "\n\nমোট: " +
          money(total)
        );


        openAccount();

      } catch (error) {

        console.error(
          error
        );


        alert(
          "অর্ডার Save হয়নি। Firestore Rules পরীক্ষা করুন।"
        );

      } finally {

        submitButton.disabled =
          false;


        submitButton.textContent =
          "PLACE ORDER";
      }
    }
  );


/* =====================================================
   ACCOUNT
===================================================== */

$("#account").onclick =
  openAccount;


function openAccount() {

  $("#accountModal")
    .classList
    .add("on");


  renderAccount();
}


onAuthStateChanged(
  auth,
  (currentUser) => {

    user =
      currentUser;


    renderAccount();


    if (
      $("#account")
    ) {

      const bold =
        $("#account")
          .querySelector("b");


      if (bold) {

        bold.textContent =
          user
            ? "My Account"
            : "Login";
      }
    }
  }
);


function renderAccount() {

  const host =
    $("#accountBody");


  if (!host) return;


  if (!user) {

    host.innerHTML = `

      <div class="account-tabs">

        <button
          class="btn primary"
          id="showLogin">

          Login

        </button>


        <button
          class="btn light"
          id="showRegister">

          Register

        </button>

      </div>


      <form
        id="loginForm"
        style="margin-top:16px">

        <h3>
          Customer Login
        </h3>


        <label>
          Email
        </label>

        <input
          class="field"
          type="email"
          name="email"
          required
          placeholder="আপনার Email">


        <br><br>


        <label>
          Password
        </label>

        <input
          class="field"
          type="password"
          name="password"
          required
          placeholder="Password">


        <br><br>


        <button
          class="btn primary"
          type="submit">

          LOGIN

        </button>


        <button
          class="btn light"
          type="button"
          id="resetPassword">

          Forgot Password?

        </button>

      </form>


      <form
        id="registerForm"
        style="margin-top:16px;display:none">

        <h3>
          নতুন Account তৈরি করুন
        </h3>


        <label>
          Email
        </label>

        <input
          class="field"
          type="email"
          name="email"
          required
          placeholder="আপনার Email">


        <br><br>


        <label>
          Password
        </label>

        <input
          class="field"
          type="password"
          name="password"
          minlength="6"
          required
          placeholder="কমপক্ষে ৬ অক্ষর">


        <br><br>


        <button
          class="btn primary"
          type="submit">

          CREATE ACCOUNT

        </button>

      </form>


      <p
        class="muted"
        style="margin-top:15px">

        বর্তমানে নিরাপদ Email + Password Login চালু আছে।

      </p>
    `;


    $("#showLogin").onclick =
      () => {

        $("#loginForm").style.display =
          "block";

        $("#registerForm").style.display =
          "none";
      };


    $("#showRegister").onclick =
      () => {

        $("#loginForm").style.display =
          "none";

        $("#registerForm").style.display =
          "block";
      };


    $("#loginForm")
      .onsubmit =
      async (event) => {

        event.preventDefault();


        const data =
          new FormData(
            event.currentTarget
          );


        try {

          await signInWithEmailAndPassword(
            auth,
            data.get("email"),
            data.get("password")
          );


          alert(
            "Login সফল হয়েছে।"
          );

        } catch (error) {

          console.error(
            error
          );


          alert(
            "Login হয়নি। Email অথবা Password পরীক্ষা করুন।"
          );
        }
      };


    $("#registerForm")
      .onsubmit =
      async (event) => {

        event.preventDefault();


        const data =
          new FormData(
            event.currentTarget
          );


        try {

          const credential =
            await createUserWithEmailAndPassword(
              auth,
              data.get("email"),
              data.get("password")
            );


          await setDoc(
            doc(
              db,
              "users",
              credential.user.uid
            ),
            {

              email:
                credential.user.email,

              role:
                "customer",

              name:
                "",

              phone:
                "",

              division:
                "",

              district:
                "",

              upazila:
                "",

              area:
                "",

              address:
                "",

              createdAt:
                serverTimestamp()

            }
          );


          alert(
            "Account তৈরি হয়েছে।"
          );

        } catch (error) {

          console.error(
            error
          );


          alert(
            "Account তৈরি হয়নি। Email আগে ব্যবহার করা হয়েছে কি না পরীক্ষা করুন।"
          );
        }
      };


    $("#resetPassword")
      .onclick =
      async () => {

        const email =
          $("#loginForm")
            .email
            .value
            .trim();


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
            "Password reset Email পাঠানো হয়েছে।"
          );

        } catch (error) {

          console.error(
            error
          );


          alert(
            "Reset Email পাঠানো যায়নি।"
          );
        }
      };


    return;
  }


  host.innerHTML = `

    <div class="mx-account-profile">

      <div class="mx-account-avatar">
        👤
      </div>


      <div>

        <b>
          Customer Account
        </b>

        <div class="muted">
          ${escapeHtml(user.email || "")}
        </div>

      </div>

    </div>


    <button
      class="btn primary"
      id="profileBtn">

      Profile & Address

    </button>


    <button
      class="btn light"
      id="ordersBtn">

      My Orders

    </button>


    <button
      class="btn light"
      id="logoutBtn">

      Logout

    </button>


    <div
      id="accountContent"
      style="margin-top:18px">
    </div>
  `;


  $("#profileBtn").onclick =
    loadProfileEditor;


  $("#ordersBtn").onclick =
    loadMyOrders;


  $("#logoutBtn").onclick =
    async () => {

      await signOut(auth);

      $("#accountModal")
        .classList
        .remove("on");
    };


  loadProfileEditor();
}
async function loadProfileEditor() {

  if (!user) return;


  const ref =
    doc(
      db,
      "users",
      user.uid
    );


  try {

    const snapshot =
      await getDoc(ref);


    const profile =
      snapshot.exists()
        ? snapshot.data()
        : {};


    const host =
      $("#accountContent");


    if (!host) return;


    host.innerHTML = `

      <h3>
        Profile & Address
      </h3>


      <form id="profileForm">

        <label>
          নাম
        </label>

        <input
          class="field"
          name="name"
          required
          value="${escapeHtml(profile.name || "")}"
          placeholder="আপনার নাম">


        <br><br>


        <label>
          মোবাইল নাম্বার
        </label>

        <input
          class="field"
          name="phone"
          required
          value="${escapeHtml(profile.phone || "")}"
          placeholder="01XXXXXXXXX">


        <br><br>


        <label>
          বিভাগ
        </label>

        <input
          class="field"
          name="division"
          value="${escapeHtml(profile.division || "")}"
          placeholder="যেমন: চট্টগ্রাম">


        <br><br>


        <label>
          জেলা
        </label>

        <input
          class="field"
          name="district"
          value="${escapeHtml(profile.district || "")}"
          placeholder="যেমন: কুমিল্লা">


        <br><br>


        <label>
          উপজেলা / থানা
        </label>

        <input
          class="field"
          name="upazila"
          value="${escapeHtml(profile.upazila || "")}"
          placeholder="যেমন: মুরাদনগর">


        <br><br>


        <label>
          ইউনিয়ন / এরিয়া
        </label>

        <input
          class="field"
          name="area"
          value="${escapeHtml(profile.area || "")}"
          placeholder="ইউনিয়ন / এলাকার নাম">


        <br><br>


        <label>
          সম্পূর্ণ ঠিকানা
        </label>

        <textarea
          class="field"
          name="address"
          rows="3"
          placeholder="গ্রাম / রাস্তা / বাজার / বাড়ির তথ্য">${escapeHtml(profile.address || "")}</textarea>


        <br><br>


        <button
          class="btn primary"
          type="submit">

          SAVE PROFILE

        </button>

      </form>
    `;


    $("#profileForm")
      .onsubmit =
      async (event) => {

        event.preventDefault();


        const data =
          Object.fromEntries(
            new FormData(
              event.currentTarget
            )
          );


        try {

          await setDoc(
            ref,
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

          console.error(
            error
          );


          alert(
            "Profile Save হয়নি।"
          );
        }
      };

  } catch (error) {

    console.error(
      error
    );
  }
}


/* =====================================================
   MY ORDERS
===================================================== */

async function loadMyOrders() {

  if (!user) return;


  const host =
    $("#accountContent");


  if (!host) return;


  host.innerHTML =
    "<p>Order history loading...</p>";


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
        document => ({

          id:
            document.id,

          ...document.data()

        })
      );


    list.sort(
      (a, b) =>
        (b.createdAt?.seconds || 0) -
        (a.createdAt?.seconds || 0)
    );


    host.innerHTML = `

      <h3>
        My Orders
      </h3>

      ${
        list.length

          ? list.map(
              order => `

                <div
                  class="panel"
                  style="margin-bottom:12px">

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
                    <strong>
                      ${money(
                        order.total
                      )}
                    </strong>
                  </p>


                  <p class="muted">

                    Payment:

                    ${escapeHtml(
                      order.payment?.method ||
                      "-"
                    )}

                    •

                    ${escapeHtml(
                      order.payment?.status ||
                      "-"
                    )}

                  </p>

                </div>

              `
            ).join("")

          : "<p>এখনো কোনো Order নেই।</p>"
      }
    `;

  } catch (error) {

    console.error(
      error
    );


    host.innerHTML =
      "<p>Order history load করা যায়নি।</p>";
  }
}


/* =====================================================
   BANNER SLIDER
===================================================== */

function initBannerSlider() {

  const slides =
    [
      ...document.querySelectorAll(
        ".mx-banner-slide"
      )
    ];


  const dotsHost =
    $("#bannerDots");


  if (
    !slides.length ||
    !dotsHost ||
    dotsHost.dataset.ready
  ) {
    return;
  }


  dotsHost.dataset.ready =
    "1";


  let index = 0;
  let timer;


  dotsHost.innerHTML =
    slides.map(
      (_, i) => `

        <button
          type="button"
          data-slide="${i}"
          aria-label="Banner ${i + 1}">
        </button>

      `
    ).join("");


  const dots =
    [
      ...dotsHost.querySelectorAll(
        "button"
      )
    ];


  function show(i) {

    index =
      (
        i +
        slides.length
      ) %
      slides.length;


    slides.forEach(
      (slide, number) => {

        slide.classList.toggle(
          "active",
          number === index
        );
      }
    );


    dots.forEach(
      (dot, number) => {

        dot.classList.toggle(
          "active",
          number === index
        );
      }
    );
  }


  function restart() {

    clearInterval(
      timer
    );


    timer =
      setInterval(
        () =>
          show(
            index + 1
          ),
        5500
      );
  }


  $("#bannerPrev")
    ?.addEventListener(
      "click",
      () => {

        show(
          index - 1
        );

        restart();
      }
    );


  $("#bannerNext")
    ?.addEventListener(
      "click",
      () => {

        show(
          index + 1
        );

        restart();
      }
    );


  dots.forEach(
    dot => {

      dot.addEventListener(
        "click",
        () => {

          show(
            Number(
              dot.dataset.slide
            )
          );

          restart();
        }
      );
    }
  );


  show(0);
  restart();
}


/* =====================================================
   LANGUAGE
===================================================== */

function initLanguageSwitch() {

  const buttons =
    [
      ...document.querySelectorAll(
        ".mx-lang"
      )
    ];


  if (!buttons.length) {
    return;
  }


  const saved =
    localStorage.getItem(
      "mx-lang"
    ) ||
    "bn";


  document.documentElement.lang =
    saved;


  buttons.forEach(
    button => {

      button.classList.toggle(
        "active",
        button.dataset.lang === saved
      );
    }
  );


  buttons.forEach(
    button => {

      button.onclick = () => {

        const lang =
          button.dataset.lang;


        localStorage.setItem(
          "mx-lang",
          lang
        );


        document.documentElement.lang =
          lang;


        buttons.forEach(
          item => {

            item.classList.toggle(
              "active",
              item === button
            );
          }
        );


        if (
          lang === "en"
        ) {

          alert(
            "English preference Save হয়েছে। সম্পূর্ণ English catalogue দেখাতে Admin থেকে Product ও Category-এর English translation যোগ করতে হবে।"
          );
        }
      };
    }
  );
}


/* =====================================================
   BANGLADESH ADDRESS
===================================================== */

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


function initAddressSelectors() {

  const division =
    $("#checkoutDivision");


  const district =
    $("#checkoutDistrict");


  const upazila =
    $("#checkoutUpazila");


  if (
    !division ||
    !district ||
    !upazila ||
    division.dataset.ready
  ) {
    return;
  }


  division.dataset.ready =
    "1";


  division.innerHTML = `

    <option value="">
      বিভাগ নির্বাচন করুন
    </option>

    ${
      Object.keys(
        bdAddress
      )
        .map(
          name => `
            <option value="${name}">
              ${name}
            </option>
          `
        )
        .join("")
    }
  `;


  division.onchange = () => {

    const list =
      bdAddress[
        division.value
      ] ||
      [];


    district.innerHTML = `

      <option value="">
        জেলা নির্বাচন করুন
      </option>

      ${
        list
          .map(
            name => `
              <option value="${name}">
                ${name}
              </option>
            `
          )
          .join("")
      }
    `;


    upazila.innerHTML = `

      <option value="">
        উপজেলা / থানা নির্বাচন করুন
      </option>
    `;
  };


  district.onchange = () => {

    const list =
      district.value ===
      "কুমিল্লা"

        ? cumillaUpazilas

        : [
            "অন্যান্য / আমার এলাকা"
          ];


    upazila.innerHTML = `

      <option value="">
        উপজেলা / থানা নির্বাচন করুন
      </option>

      ${
        list
          .map(
            name => `
              <option value="${name}">
                ${name}
              </option>
            `
          )
          .join("")
      }
    `;
  };
}


/* =====================================================
   START WEBSITE
===================================================== */

loadStore();
