import { auth, db } from "./firebase.js";
import { ADMIN_UID } from "../../firebase-config.js";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  runTransaction
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const $ = (s) => document.querySelector(s);
const money = (n) => "৳" + Number(n || 0).toLocaleString("en-BD");

let products = [];
let categories = [];
let orders = [];
let images = [];

/* =========================
   ADMIN LOGIN
========================= */

$("#loginForm").onsubmit = async (e) => {
  e.preventDefault();

  const form = new FormData(e.target);

  try {
    const result = await signInWithEmailAndPassword(
      auth,
      form.get("email"),
      form.get("password")
    );

    if (result.user.uid !== ADMIN_UID) {
      await signOut(auth);
      throw new Error("এই Account Admin নয়।");
    }
  } catch (error) {
    $("#msg").textContent = error.message;
  }
};

$("#logout").onclick = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
  const isAdmin = user && user.uid === ADMIN_UID;

  $("#login").style.display = isAdmin ? "none" : "grid";
  $("#admin").style.display = isAdmin ? "grid" : "none";

  if (isAdmin) {
    loadAdmin();
  }
});

/* =========================
   SIDEBAR
========================= */

document.querySelectorAll(".side [data-sec]").forEach((button) => {
  button.onclick = () => {
    document.querySelectorAll(".side button").forEach((b) => {
      b.classList.remove("on");
    });

    document.querySelectorAll(".sec").forEach((section) => {
      section.classList.remove("on");
    });

    button.classList.add("on");

    const section = $("#" + button.dataset.sec);

    if (section) {
      section.classList.add("on");
    }

    $("#title").textContent = button.textContent.trim();
  };
});

/* =========================
   LOAD DATA
========================= */

async function loadAdmin() {
  try {
    const [productSnap, categorySnap, orderSnap] = await Promise.all([
      getDocs(collection(db, "products")),
      getDocs(collection(db, "categories")),
      getDocs(collection(db, "orders"))
    ]);

    products = productSnap.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));

    categories = categorySnap.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));

    orders = orderSnap.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));

    renderAdmin();
  } catch (error) {
    console.error(error);
    alert("Admin data load হয়নি: " + error.message);
  }
}

/* =========================
   VARIANTS
========================= */

function parseVariants(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((x) => x.trim());

      return {
        sku: parts[0] || "",
        size: parts[1] || "",
        color: parts[2] || "",
        cost: Number(parts[3] || 0),
        sell: Number(parts[4] || 0),
        stock: Number(parts[5] || 0)
      };
    });
}

/* =========================
   IMAGE
   Cloudinary ছাড়া
========================= */

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const maxSize = 600;

        const scale = Math.min(
          1,
          maxSize / Math.max(img.width, img.height)
        );

        const canvas = document.createElement("canvas");

        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext("2d");

        ctx.drawImage(
          img,
          0,
          0,
          canvas.width,
          canvas.height
        );

        resolve(
          canvas.toDataURL(
            "image/jpeg",
            0.55
          )
        );
      };

      img.onerror = reject;
      img.src = reader.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

$("#images").onchange = async (e) => {
  const files = [...e.target.files];

  if (files.length > 5) {
    alert("সর্বোচ্চ ৫টি ছবি দেওয়া যাবে।");
    e.target.value = "";
    return;
  }

  images = [];
  $("#previews").innerHTML = "";
  $("#bar").style.width = "0%";

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (
        ![
          "image/jpeg",
          "image/png",
          "image/webp"
        ].includes(file.type)
      ) {
        throw new Error(
          "শুধু JPG, PNG অথবা WebP ছবি দিন।"
        );
      }

      const dataURL = await compressImage(file);

      images.push({
        url: dataURL
      });

      $("#bar").style.width =
        ((i + 1) / files.length) * 100 + "%";

      $("#previews").innerHTML = images
        .map(
          (img) =>
            `<img src="${img.url}" alt="Product image">`
        )
        .join("");
    }
  } catch (error) {
    images = [];
    $("#previews").innerHTML = "";
    $("#bar").style.width = "0%";

    alert(error.message);
  }
};

/* =========================
   NEW PRODUCT
========================= */

$("#newP").onclick = () => {
  $("#editor").style.display =
    $("#editor").style.display === "none"
      ? "block"
      : "none";
};

/* =========================
   SAVE PRODUCT
========================= */

$("#productForm").onsubmit = async (e) => {
  e.preventDefault();

  const form = Object.fromEntries(
    new FormData(e.target)
  );

  const variants = parseVariants(form.variants);

  if (!variants.length) {
    alert("কমপক্ষে একটি Variant দিন।");
    return;
  }

  if (
    variants.some(
      (v) => !v.sku
    )
  ) {
    alert("প্রতিটি Variant-এর SKU দিন।");
    return;
  }

  if (!images.length) {
    alert("কমপক্ষে একটি Product ছবি দিন।");
    return;
  }

  const product = {
    name: form.name.trim(),
    code: form.code.trim(),
    category: form.category,
    description: form.description || "",

    regularPrice:
      Number(form.regularPrice || 0),

    salePrice:
      Number(form.salePrice || 0),

    lowStock:
      Number(form.lowStock || 3),

    published:
      e.target.published.checked,

    variants,
    images,

    createdAt:
      serverTimestamp()
  };

  try {
    await addDoc(
      collection(db, "products"),
      product
    );

    e.target.reset();

    images = [];

    $("#previews").innerHTML = "";
    $("#bar").style.width = "0%";
    $("#editor").style.display = "none";

    await loadAdmin();

    alert("Product সফলভাবে Save হয়েছে।");
  } catch (error) {
    console.error(error);

    if (
      error.message
        .toLowerCase()
        .includes("too large")
    ) {
      alert(
        "ছবির কারণে Product file অনেক বড় হয়েছে। ছোট/কম ছবি ব্যবহার করুন।"
      );
    } else {
      alert(
        "Product Save হয়নি: " +
        error.message
      );
    }
  }
};

/* =========================
   CATEGORY
========================= */

$("#catForm").onsubmit = async (e) => {
  e.preventDefault();

  const form = new FormData(e.target);
  const name = form.get("name").trim();

  if (!name) return;

  try {
    await addDoc(
      collection(db, "categories"),
      {
        name,
        active: true,
        createdAt: serverTimestamp()
      }
    );

    e.target.reset();

    await loadAdmin();

    alert("Category যোগ হয়েছে।");
  } catch (error) {
    alert(error.message);
  }
};

/* =========================
   DELETE PRODUCT
========================= */

async function deleteProduct(id) {
  const ok = confirm(
    "এই Product Delete করতে চান?"
  );

  if (!ok) return;

  try {
    await deleteDoc(
      doc(db, "products", id)
    );

    await loadAdmin();

    alert("Product Delete হয়েছে।");
  } catch (error) {
    alert(error.message);
  }
}

/* =========================
   TABLE
========================= */

function table(headers, rows) {
  return `
    <table>
      <thead>
        <tr>
          ${headers
            .map((h) => `<th>${h}</th>`)
            .join("")}
        </tr>
      </thead>

      <tbody>
        ${rows
          .map(
            (row) => `
              <tr>
                ${row
                  .map(
                    (cell) =>
                      `<td>${cell}</td>`
                  )
                  .join("")}
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

/* =========================
   RENDER ADMIN
========================= */

function renderAdmin() {
  const categoryOptions = categories
    .filter((c) => c.active !== false)
    .map(
      (c) =>
        `<option value="${c.name}">
          ${c.name}
        </option>`
    )
    .join("");

  $("#productCat").innerHTML =
    categoryOptions ||
    `<option value="">আগে Category যোগ করুন</option>`;

  $("#catList").innerHTML =
    categories
      .map(
        (c) =>
          `<div class="panel"
                style="margin-top:8px">
             ${c.name}
             —
             ${c.active === false
               ? "Inactive"
               : "Active"}
           </div>`
      )
      .join("") ||
    "<p>Category নেই।</p>";

  /* PRODUCTS */

  $("#productTable").innerHTML =
    table(
      [
        "Product",
        "Code",
        "Category",
        "Stock",
        "Action"
      ],
      products.map((p) => [
        p.name || "",
        p.code || "",
        p.category || "",

        (p.variants || []).reduce(
          (total, v) =>
            total + Number(v.stock || 0),
          0
        ),

        `<button
           class="btn danger"
           data-delete-product="${p.id}">
           Delete
         </button>`
      ])
    );

  document
    .querySelectorAll(
      "[data-delete-product]"
    )
    .forEach((button) => {
      button.onclick = () =>
        deleteProduct(
          button.dataset.deleteProduct
        );
    });

  /* ORDERS */

  const sortedOrders = [...orders].sort(
    (a, b) =>
      (b.createdAt?.seconds || 0) -
      (a.createdAt?.seconds || 0)
  );

  $("#orderTable").innerHTML =
    table(
      [
        "Order",
        "Customer",
        "Phone",
        "Total",
        "Payment",
        "Status"
      ],

      sortedOrders.map((order) => [
        "#" + order.id.slice(0, 8),

        order.customerName || "",

        order.phone || "",

        money(order.total),

        order.paymentStatus ||
          order.payment ||
          "",

        `
          <select
            class="field"
            data-order-status="${order.id}">

            ${[
              "Pending",
              "Confirmed",
              "Processing",
              "Shipped",
              "Delivered",
              "Cancelled"
            ]
              .map(
                (status) =>
                  `<option
                     value="${status}"
                     ${
                       status === order.status
                         ? "selected"
                         : ""
                     }>
                     ${status}
                   </option>`
              )
              .join("")}

          </select>
        `
      ])
    );

  document
    .querySelectorAll(
      "[data-order-status]"
    )
    .forEach((select) => {
      select.onchange = () =>
        changeOrderStatus(
          select.dataset.orderStatus,
          select.value
        );
    });

  /* INVENTORY */

  const variants = products.flatMap(
    (product) =>
      (product.variants || []).map(
        (variant) => ({
          product,
          ...variant
        })
      )
  );

  $("#inventoryTable").innerHTML =
    table(
      [
        "Product",
        "SKU",
        "Size",
        "Color",
        "Cost",
        "Sell",
        "Stock"
      ],

      variants.map((v) => [
        v.product.name,
        v.sku,
        v.size || "-",
        v.color || "-",
        money(v.cost),
        money(v.sell),
        v.stock
      ])
    );

  const units =
    variants.reduce(
      (total, v) =>
        total + Number(v.stock || 0),
      0
    );

  const costValue =
    variants.reduce(
      (total, v) =>
        total +
        Number(v.cost || 0) *
        Number(v.stock || 0),
      0
    );

  const retailValue =
    variants.reduce(
      (total, v) =>
        total +
        Number(v.sell || 0) *
        Number(v.stock || 0),
      0
    );

  $("#units").textContent = units;
  $("#costVal").textContent =
    money(costValue);
  $("#retailVal").textContent =
    money(retailValue);

  $("#out").textContent =
    variants.filter(
      (v) =>
        Number(v.stock || 0) <= 0
    ).length;

  /* POS + PURCHASE SELECT */

  const variantOptions =
    variants
      .map(
        (v) =>
          `<option
             value="${v.product.id}|${v.sku}">
             ${v.product.name}
             —
             ${v.sku}
             —
             Stock ${v.stock}
           </option>`
      )
      .join("");

  $("#posVariant").innerHTML =
    variantOptions;

  $("#purchaseVariant").innerHTML =
    variantOptions;

  /* DASHBOARD */

  $("#pending").textContent =
    orders.filter(
      (order) =>
        order.status === "Pending"
    ).length;

  $("#low").textContent =
    variants.filter(
      (v) =>
        Number(v.stock || 0) <=
        Number(v.product.lowStock || 3)
    ).length;

  $("#recent").innerHTML =
    sortedOrders
      .slice(0, 5)
      .map(
        (order) =>
          `<p>
             <b>${order.customerName || "Customer"}</b>
             —
             ${money(order.total)}
             —
             ${order.status}
           </p>`
      )
      .join("") ||
    "<p>এখনো Order নেই।</p>";

  calculateDashboard();
}

/* =========================
   DASHBOARD SALES
========================= */

function calculateDashboard() {
  const now = new Date();

  const todayKey =
    `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

  let todaySales = 0;
  let monthSales = 0;

  orders.forEach((order) => {
    if (
      order.status !== "Delivered" ||
      !order.createdAt?.seconds
    ) {
      return;
    }

    const date =
      new Date(
        order.createdAt.seconds * 1000
      );

    if (
      date.getFullYear() ===
        now.getFullYear() &&
      date.getMonth() ===
        now.getMonth()
    ) {
      monthSales +=
        Number(order.total || 0);
    }

    const key =
      `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

    if (key === todayKey) {
      todaySales +=
        Number(order.total || 0);
    }
  });

  $("#today").textContent =
    money(todaySales);

  $("#month").textContent =
    money(monthSales);
}

/* =========================
   ORDER STATUS + STOCK
========================= */

async function changeOrderStatus(
  orderId,
  nextStatus
) {
  const orderRef =
    doc(db, "orders", orderId);

  try {
    await runTransaction(
      db,
      async (transaction) => {
        const orderSnap =
          await transaction.get(orderRef);

        if (!orderSnap.exists()) {
          throw new Error(
            "Order পাওয়া যায়নি।"
          );
        }

        const order =
          orderSnap.data();

        const previousStatus =
          order.status;

        const deductStock =
          previousStatus === "Pending" &&
          nextStatus === "Confirmed" &&
          order.stockState === "none";

        const returnStock =
          nextStatus === "Cancelled" &&
          order.stockState === "deducted";

        /*
          Firestore transaction-এর সব
          product READ আগে করা হচ্ছে।
          এরপর WRITE করা হবে।
        */

        const productRecords = [];

        if (deductStock || returnStock) {
          for (const item of order.items || []) {
            const productRef =
              doc(
                db,
                "products",
                item.productId
              );

            const productSnap =
              await transaction.get(
                productRef
              );

            if (!productSnap.exists()) {
              throw new Error(
                "একটি Product পাওয়া যায়নি।"
              );
            }

            productRecords.push({
              item,
              ref: productRef,
              data: productSnap.data()
            });
          }
        }

        /* ALL READS FINISHED */

        for (const record of productRecords) {
          const variants = [
            ...(record.data.variants || [])
          ];

          const index =
            variants.findIndex(
              (v) =>
                v.sku === record.item.sku
            );

          if (index < 0) {
            throw new Error(
              "Product Variant পাওয়া যায়নি।"
            );
          }

          const qty =
            Number(record.item.qty || 0);

          const currentStock =
            Number(
              variants[index].stock || 0
            );

          if (deductStock) {
            if (currentStock < qty) {
              throw new Error(
                `${record.data.name || "Product"} এর Stock কম।`
              );
            }

            variants[index] = {
              ...variants[index],
              stock:
                currentStock - qty
            };
          }

          if (returnStock) {
            variants[index] = {
              ...variants[index],
              stock:
                currentStock + qty
            };
          }

          transaction.update(
            record.ref,
            {
              variants
            }
          );
        }

        const updateData = {
          status: nextStatus
        };

        if (deductStock) {
          updateData.stockState =
            "deducted";
        }

        if (returnStock) {
          updateData.stockState =
            "returned";
        }

        if (nextStatus === "Delivered") {
          updateData.deliveredAt =
            serverTimestamp();
        }

        transaction.update(
          orderRef,
          updateData
        );
      }
    );

    await loadAdmin();

    alert(
      "Order Status Update হয়েছে।"
    );
  } catch (error) {
    console.error(error);

    alert(
      "Status Update হয়নি: " +
      error.message
    );

    await loadAdmin();
  }
}

/* =========================
   POS / OFFLINE SALE
========================= */

$("#posForm").onsubmit =
  async (e) => {
    e.preventDefault();

    const form =
      new FormData(e.target);

    if (!$("#posVariant").value) {
      alert("Product Variant নেই।");
      return;
    }

    const [productId, sku] =
      $("#posVariant")
        .value
        .split("|");

    const qty =
      Number(form.get("qty"));

    const discount =
      Number(
        form.get("discount") || 0
      );

    const productRef =
      doc(
        db,
        "products",
        productId
      );

    try {
      await runTransaction(
        db,
        async (transaction) => {
          const snap =
            await transaction.get(
              productRef
            );

          if (!snap.exists()) {
            throw new Error(
              "Product পাওয়া যায়নি।"
            );
          }

          const product =
            snap.data();

          const variants = [
            ...(product.variants || [])
          ];

          const index =
            variants.findIndex(
              (v) => v.sku === sku
            );

          if (index < 0) {
            throw new Error(
              "Variant পাওয়া যায়নি।"
            );
          }

          const variant = {
            ...variants[index]
          };

          if (
            Number(variant.stock) <
            qty
          ) {
            throw new Error(
              "পর্যাপ্ত Stock নেই।"
            );
          }

          const total =
            Number(variant.sell) *
              qty -
            discount;

          variants[index] = {
            ...variant,
            stock:
              Number(variant.stock) -
              qty
          };

          transaction.update(
            productRef,
            {
              variants
            }
          );

          const saleRef =
            doc(
              collection(
                db,
                "offlineSales"
              )
            );

          transaction.set(
            saleRef,
            {
              productId,
              productName:
                product.name || "",
              sku,
              qty,
              unitPrice:
                Number(variant.sell),
              cost:
                Number(variant.cost),
              discount,
              total,
              payment:
                form.get("payment"),
              customer:
                form.get("customer") ||
                "",
              createdAt:
                serverTimestamp()
            }
          );

          const movementRef =
            doc(
              collection(
                db,
                "stockMovements"
              )
            );

          transaction.set(
            movementRef,
            {
              type:
                "offline-sale",
              productId,
              sku,
              qty: -qty,
              createdAt:
                serverTimestamp()
            }
          );
        }
      );

      e.target.reset();

      await loadAdmin();

      alert(
        "Offline/POS Sale Save হয়েছে।"
      );
    } catch (error) {
      alert(error.message);
    }
  };

/* =========================
   PURCHASE / STOCK IN
========================= */

$("#purchaseForm").onsubmit =
  async (e) => {
    e.preventDefault();

    const form =
      new FormData(e.target);

    if (
      !$("#purchaseVariant").value
    ) {
      alert("Product Variant নেই।");
      return;
    }

    const [productId, sku] =
      $("#purchaseVariant")
        .value
        .split("|");

    const qty =
      Number(form.get("qty"));

    const newCost =
      Number(form.get("cost"));

    const productRef =
      doc(
        db,
        "products",
        productId
      );

    try {
      await runTransaction(
        db,
        async (transaction) => {
          const snap =
            await transaction.get(
              productRef
            );

          if (!snap.exists()) {
            throw new Error(
              "Product পাওয়া যায়নি।"
            );
          }

          const product =
            snap.data();

          const variants = [
            ...(product.variants || [])
          ];

          const index =
            variants.findIndex(
              (v) => v.sku === sku
            );

          if (index < 0) {
            throw new Error(
              "Variant পাওয়া যায়নি।"
            );
          }

          const variant = {
            ...variants[index]
          };

          const oldStock =
            Number(
              variant.stock || 0
            );

          const oldCost =
            Number(
              variant.cost || 0
            );

          const totalStock =
            oldStock + qty;

          const weightedCost =
            totalStock > 0
              ? (
                  (
                    oldStock *
                      oldCost +
                    qty *
                      newCost
                  ) /
                  totalStock
                )
              : newCost;

          variants[index] = {
            ...variant,

            stock:
              totalStock,

            cost:
              Number(
                weightedCost.toFixed(2)
              )
          };

          transaction.update(
            productRef,
            {
              variants
            }
          );

          const purchaseRef =
            doc(
              collection(
                db,
                "purchases"
              )
            );

          transaction.set(
            purchaseRef,
            {
              supplier:
                form.get("supplier") ||
                "",

              productId,

              productName:
                product.name || "",

              sku,

              qty,

              cost:
                newCost,

              total:
                qty * newCost,

              createdAt:
                serverTimestamp()
            }
          );

          const movementRef =
            doc(
              collection(
                db,
                "stockMovements"
              )
            );

          transaction.set(
            movementRef,
            {
              type: "purchase",
              productId,
              sku,
              qty,
              createdAt:
                serverTimestamp()
            }
          );
        }
      );

      e.target.reset();

      await loadAdmin();

      alert(
        "Purchase/Stock-In Save হয়েছে।"
      );
    } catch (error) {
      alert(error.message);
    }
  };

/* =========================
   EXPENSE
========================= */

$("#expenseForm").onsubmit =
  async (e) => {
    e.preventDefault();

    const form =
      new FormData(e.target);

    try {
      await addDoc(
        collection(db, "expenses"),
        {
          category:
            form.get("category"),

          amount:
            Number(
              form.get("amount")
            ),

          note:
            form.get("note") || "",

          createdAt:
            serverTimestamp()
        }
      );

      e.target.reset();

      alert("Expense Save হয়েছে।");
    } catch (error) {
      alert(error.message);
    }
  };

/* =========================
   SETTINGS
========================= */

$("#settingsForm").onsubmit =
  async (e) => {
    e.preventDefault();

    const form =
      Object.fromEntries(
        new FormData(e.target)
      );

    form.insideDelivery =
      Number(
        form.insideDelivery || 80
      );

    form.outsideDelivery =
      Number(
        form.outsideDelivery || 150
      );

    try {
      await setDoc(
        doc(
          db,
          "settings",
          "store"
        ),
        form,
        {
          merge: true
        }
      );

      alert(
        "Store Settings Save হয়েছে।"
      );
    } catch (error) {
      alert(error.message);
    }
  };

/* =========================
   REPORT CSV
========================= */

$("#csv").onclick = async () => {
  try {
    const [
      onlineSnap,
      offlineSnap,
      expenseSnap
    ] = await Promise.all([
      getDocs(
        collection(db, "orders")
      ),
      getDocs(
        collection(
          db,
          "offlineSales"
        )
      ),
      getDocs(
        collection(db, "expenses")
      )
    ]);

    const rows = [
      [
        "Type",
        "ID",
        "Status",
        "Amount"
      ]
    ];

    onlineSnap.docs.forEach((d) => {
      const x = d.data();

      rows.push([
        "Online",
        d.id,
        x.status || "",
        Number(x.total || 0)
      ]);
    });

    offlineSnap.docs.forEach((d) => {
      const x = d.data();

      rows.push([
        "Offline",
        d.id,
        "Completed",
        Number(x.total || 0)
      ]);
    });

    expenseSnap.docs.forEach((d) => {
      const x = d.data();

      rows.push([
        "Expense",
        d.id,
        x.category || "",
        -Number(x.amount || 0)
      ]);
    });

    const csv =
      rows
        .map((row) =>
          row
            .map(
              (value) =>
                `"${String(value)
                  .replaceAll(
                    '"',
                    '""'
                  )}"`
            )
            .join(",")
        )
        .join("\n");

    const blob =
      new Blob(
        ["\ufeff" + csv],
        {
          type:
            "text/csv;charset=utf-8"
        }
      );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "mehedi-xpress-report.csv";

    link.click();

    URL.revokeObjectURL(url);

  } catch (error) {
    alert(error.message);
  }
};
