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

const $ = (s) => document.querySelector(s);
const money = (n) => "৳" + Number(n || 0).toLocaleString("en-BD");

let products = [];
let categories = [];
let settings = {};
let user = null;

let cart = JSON.parse(localStorage.getItem("mx-cart") || "[]");

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

    settings = settingsSnap.exists()
      ? settingsSnap.data()
      : {};

    showSettings();
    renderCategories();
    renderProducts();
    renderCart();

  } catch (error) {
    console.error(error);

    $("#grid").innerHTML =
      "<p>ডাটা লোড হয়নি। Firebase configuration এবং Firestore Rules পরীক্ষা করুন।</p>";
  }
}

function showSettings() {
  if (settings.phone) {
    $("#phone").innerHTML =
      `<a style="color:white;text-decoration:none"
          href="tel:${settings.phone}">
          ${settings.phone}
       </a>`;
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
    `<button class="btn light"
       data-category="">
       সব
     </button>` +

    categories
      .filter((category) => category.active !== false)
      .map(
        (category) =>
          `<button class="btn light"
             data-category="${category.name}">
             ${category.name}
           </button>`
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

function renderProducts(category = "") {

  const search =
    ($("#search").value || "").toLowerCase();

  const stockFilter =
    $("#stock").value;

  let list = products.filter((product) => {

    const text =
      `${product.name || ""} ${product.code || ""}`
        .toLowerCase();

    const categoryMatch =
      !category ||
      product.category === category;

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
    $("#sort").value;

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
    list
      .map((product) => {

        const image =
          product.images?.[0]?.url ||
          "assets/images/placeholder.svg";

        const stock =
          productStock(product);

        return `
          <article class="card">

            <img
              src="${image}"
              alt="${product.name || "Product"}"
            >

            <h3>${product.name}</h3>

            <div class="muted">
              ${product.code || ""}
            </div>

            <div class="price">

              ${money(productPrice(product))}

              ${
                product.salePrice
                  ? `<span class="old">
                       ${money(product.regularPrice)}
                     </span>`
                  : ""
              }

            </div>

            <p>
              ${
                stock > 0
                  ? "স্টকে আছে"
                  : "স্টক শেষ"
              }
            </p>

            <button
              class="btn light"
              data-detail="${product.id}">
              DETAILS
            </button>

          </article>
        `;
      })
      .join("") ||

    "<p>কোনো পণ্য পাওয়া যায়নি।</p>";

  document
    .querySelectorAll("[data-detail]")
    .forEach((button) => {

      button.onclick =
        () => showProduct(button.dataset.detail);

    });
}

function showProduct(id) {

  const product =
    products.find((p) => p.id === id);

  if (!product) return;

  const variants =
    (product.variants || [])
      .filter(
        (variant) =>
          Number(variant.stock || 0) > 0
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
          alt="${product.name}"
        >
      </div>

      <div>

        <h2>${product.name}</h2>

        <p>
          ${product.description || ""}
        </p>

        <div class="price">
          ${money(productPrice(product))}
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

                ${variants
                  .map(
                    (variant, index) =>
                      `<option value="${index}">
                        ${variant.size || "-"}
                        /
                        ${variant.color || "-"}
                        —
                        ${money(variant.sell)}
                        (${variant.stock} available)
                       </option>`
                  )
                  .join("")}

              </select>

              <br><br>

              <label>Quantity</label>

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

  $("#detail").classList.add("on");

  if (!variants.length) return;

  $("#addCart").onclick = () => {

    const variant =
      variants[
        Number($("#variantSelect").value)
      ];

    const quantity =
      Math.max(
        1,
        Number($("#productQty").value)
      );

    if (
      quantity >
      Number(variant.stock)
    ) {
      alert("পর্যাপ্ত স্টক নেই।");
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
        alert("পর্যাপ্ত স্টক নেই।");
        return;
      }

      existing.qty += quantity;

    } else {

      cart.push({
        key,
        productId: product.id,
        name: product.name,
        image,
        sku: variant.sku,
        size: variant.size || "",
        color: variant.color || "",
        price: Number(variant.sell || 0),
        qty: quantity,
        selected: true
      });
    }

    saveCart();

    $("#detail")
      .classList
      .remove("on");
  };
}

function renderCart() {

  $("#count").textContent =
    cart.reduce(
      (total, item) =>
        total + Number(item.qty),
      0
    );

  $("#cartItems").innerHTML =
    cart
      .map(
        (item, index) => `

          <div class="panel"
               style="margin-bottom:10px">

            <label>

              <input
                type="checkbox"
                data-select="${index}"
                ${item.selected ? "checked" : ""}>

              <b>${item.name}</b>

            </label>

            <p class="muted">

              ${item.size || ""}
              ${item.color || ""}

            </p>

            <div>

              ${money(item.price)}

              ×

              <input
                type="number"
                min="1"
                value="${item.qty}"
                data-qty="${index}"
                style="width:70px;padding:6px">

              <button
                class="btn danger"
                data-remove="${index}">
                Remove
              </button>

            </div>

          </div>
        `
      )
      .join("");

  const subtotal =
    cart
      .filter((item) => item.selected)
      .reduce(
        (total, item) =>
          total +
          Number(item.price) *
          Number(item.qty),
        0
      );

  $("#subtotal").textContent =
    "Subtotal: " +
    money(subtotal);

  document
    .querySelectorAll("[data-remove]")
    .forEach((button) => {

      button.onclick = () => {

        cart.splice(
          Number(button.dataset.remove),
          1
        );

        saveCart();
      };
    });

  document
    .querySelectorAll("[data-qty]")
    .forEach((input) => {

      input.onchange = () => {

        cart[
          Number(input.dataset.qty)
        ].qty =
          Math.max(
            1,
            Number(input.value)
          );

        saveCart();
      };
    });

  document
    .querySelectorAll("[data-select]")
    .forEach((input) => {

      input.onchange = () => {

        cart[
          Number(input.dataset.select)
        ].selected =
          input.checked;

        saveCart();
      };
    });
}

/* SEARCH */

$("#search").oninput =
  () => renderProducts();

$("#sort").onchange =
  () => renderProducts();

$("#stock").onchange =
  () => renderProducts();

/* CART */

$("#cartBtn").onclick =
  () =>
    $("#cart")
      .classList
      .add("on");

/* CLOSE BUTTONS */

document
  .querySelectorAll("[data-close]")
  .forEach((button) => {

    button.onclick = () => {

      const target =
        button.dataset.close;

      $("#" + target)
        .classList
        .remove("on");
    };
  });

/* CHECKOUT */

$("#checkout").onclick = () => {

  const selected =
    cart.filter(
      (item) => item.selected
    );

  if (!selected.length) {

    alert(
      "Cart থেকে অন্তত একটি পণ্য select করুন।"
    );

    return;
  }

  if (!user) {

    alert(
      "Checkout করার আগে Account থেকে Login/Register করুন।"
    );

    $("#cart")
      .classList
      .remove("on");

    $("#accountModal")
      .classList
      .add("on");

    showAccount();

    return;
  }

  $("#cart")
    .classList
    .remove("on");

  $("#checkoutModal")
    .classList
    .add("on");
};

$("#checkoutForm").onsubmit =
  async (event) => {

    event.preventDefault();

    if (!user) {
      alert("Login প্রয়োজন।");
      return;
    }

    const form =
      Object.fromEntries(
        new FormData(event.target)
      );

    const items =
      cart.filter(
        (item) => item.selected
      );

    if (!items.length) {
      alert("Cart খালি।");
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
      (form.district || "")
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

    if (
      form.payment !==
        "Cash on Delivery" &&
      !(form.trx || "").trim()
    ) {

      alert(
        "bKash/Nagad payment-এর Transaction ID দিন।"
      );

      return;
    }

    try {

      await addDoc(
        collection(db, "orders"),
        {
          userId: user.uid,

          customerName:
            form.name,

          phone:
            form.phone,

          district:
            form.district,

          area:
            form.area,

          address:
            form.address,

          payment:
            form.payment,

          trx:
            form.trx || "",

          paymentStatus:
            form.payment ===
            "Cash on Delivery"
              ? "COD"
              : "Pending Verification",

          items,

          subtotal,

          delivery,

          total:
            subtotal + delivery,

          status:
            "Pending",

          stockState:
            "none",

          createdAt:
            serverTimestamp()
        }
      );

      cart =
        cart.filter(
          (item) =>
            !item.selected
        );

      saveCart();

      event.target.reset();

      $("#checkoutModal")
        .classList
        .remove("on");

      alert(
        "আপনার Order গ্রহণ করা হয়েছে।"
      );

    } catch (error) {

      console.error(error);

      alert(
        "Order করা যায়নি: " +
        error.message
      );
    }
  };

/* ACCOUNT */

$("#account").onclick = () => {

  $("#accountModal")
    .classList
    .add("on");

  showAccount();
};

function showAccount() {

  if (user) {

    $("#accountBody").innerHTML = `

      <p>
        Login:
        <b>${user.email}</b>
      </p>

      <button
        class="btn primary"
        id="showOrders">
        আমার Orders
      </button>

      <button
        class="btn danger"
        id="logoutCustomer">
        Logout
      </button>

      <div
        id="myOrders"
        style="margin-top:15px">
      </div>
    `;

    $("#logoutCustomer").onclick =
      () => signOut(auth);

    $("#showOrders").onclick =
      loadMyOrders;

    return;
  }

  $("#accountBody").innerHTML = `

    <form id="customerLogin">

      <input
        class="field"
        name="email"
        type="email"
        placeholder="Email"
        required>

      <br><br>

      <input
        class="field"
        name="password"
        type="password"
        minlength="6"
        placeholder="Password"
        required>

      <br><br>

      <button
        class="btn primary">
        LOGIN
      </button>

      <button
        class="btn light"
        id="registerCustomer"
        type="button">
        REGISTER
      </button>

      <button
        class="btn light"
        id="resetPassword"
        type="button">
        RESET PASSWORD
      </button>

    </form>
  `;

  $("#customerLogin").onsubmit =
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

      } catch (error) {

        alert(error.message);
      }
    };

  $("#registerCustomer").onclick =
    async () => {

      const form =
        new FormData(
          $("#customerLogin")
        );

      const email =
        form.get("email");

      const password =
        form.get("password");

      if (!email || !password) {

        alert(
          "Email এবং Password লিখুন।"
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

            role:
              "customer",

            createdAt:
              serverTimestamp()
          }
        );

        alert(
          "Account তৈরি হয়েছে।"
        );

      } catch (error) {

        alert(error.message);
      }
    };

  $("#resetPassword").onclick =
    async () => {

      const form =
        new FormData(
          $("#customerLogin")
        );

      const email =
        form.get("email");

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

        alert(error.message);
      }
    };
}

async function loadMyOrders() {

  if (!user) return;

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

    $("#myOrders").innerHTML =
      list
        .map(
          (order) => `

            <div class="panel"
                 style="margin-bottom:10px">

              <b>
                Order #
                ${order.id.slice(0, 8)}
              </b>

              <p>
                Status:
                ${order.status}
              </p>

              <p>
                Total:
                ${money(order.total)}
              </p>

              <p class="muted">
                Payment:
                ${order.paymentStatus || ""}
              </p>

            </div>
          `
        )
        .join("") ||

      "<p>এখনো কোনো Order নেই।</p>";

  } catch (error) {

    console.error(error);

    $("#myOrders").innerHTML =
      "<p>Order history load করা যায়নি।</p>";
  }
}

/* AUTH STATE */

onAuthStateChanged(
  auth,
  (currentUser) => {

    user = currentUser;

    if (
      $("#accountModal")
        .classList
        .contains("on")
    ) {
      showAccount();
    }
  }
);

/* START */

loadStore();
