import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  runTransaction
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
  firebaseConfig,
  ADMIN_UID
} from "../../firebase-config.js";


/* =====================================================
   FIREBASE
===================================================== */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = (selector) => document.querySelector(selector);

const money = (number) =>
  "৳" + Number(number || 0).toLocaleString("en-BD");


/* =====================================================
   DATA
===================================================== */

let products = [];
let categories = [];
let orders = [];
let offlineSales = [];
let purchases = [];
let expenses = [];

let selectedImages = [];


/* =====================================================
   LOGIN
===================================================== */

const loginForm = $("#loginForm");

if (loginForm) {

  loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const form = new FormData(loginForm);

    const email = form.get("email")?.trim();
    const password = form.get("password");

    const msg = $("#msg");

    if (msg) {
      msg.textContent = "Logging in...";
    }

    try {

      const credential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      if (credential.user.uid !== ADMIN_UID) {

        await signOut(auth);

        throw new Error("Unauthorized admin account");
      }

      if (msg) {
        msg.textContent = "";
      }

    } catch (error) {

      console.error(error);

      if (msg) {
        msg.textContent =
          "Login failed. Email অথবা Password পরীক্ষা করুন।";
      }

    }

  });

}


/* =====================================================
   AUTH STATE
===================================================== */

onAuthStateChanged(auth, (user) => {

  const login = $("#login");
  const admin = $("#admin");

  const isAdmin =
    user &&
    user.uid === ADMIN_UID;

  if (login) {
    login.style.display =
      isAdmin ? "none" : "grid";
  }

  if (admin) {
    admin.style.display =
      isAdmin ? "grid" : "none";
  }

  if (isAdmin) {
    loadSettings();
  }

});


/* =====================================================
   LOGOUT
===================================================== */

const logoutBtn = $("#logout");

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    async () => {

      await signOut(auth);

    }
  );

}


/* =====================================================
   ADMIN MENU
===================================================== */

document
  .querySelectorAll("[data-sec]")
  .forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll("[data-sec]")
          .forEach((item) =>
            item.classList.remove("on")
          );

        button.classList.add("on");


        document
          .querySelectorAll(".sec")
          .forEach((section) =>
            section.classList.remove("on")
          );


        const target =
          document.getElementById(
            button.dataset.sec
          );

        if (target) {
          target.classList.add("on");
        }


        const title = $("#title");

        if (title) {
          title.textContent =
            button.textContent
              .replace(/[^\w\sÀ-৿/]/g, "")
              .trim();
        }

      }
    );

  });


/* =====================================================
   IMAGE COMPRESSION
   Small-catalog fallback only
===================================================== */

function compressImage(file) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();

      reader.onload = () => {

        const image =
          new Image();

        image.onload = () => {

          const max = 700;

          const scale =
            Math.min(
              1,
              max /
              Math.max(
                image.width,
                image.height
              )
            );

          const canvas =
            document.createElement(
              "canvas"
            );

          canvas.width =
            Math.round(
              image.width * scale
            );

          canvas.height =
            Math.round(
              image.height * scale
            );

          const context =
            canvas.getContext("2d");

          context.drawImage(
            image,
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

        image.onerror = reject;

        image.src =
          reader.result;

      };

      reader.onerror =
        reject;

      reader.readAsDataURL(
        file
      );

    }
  );

}


/* =====================================================
   PRODUCT IMAGES
===================================================== */

const imageInput = $("#images");

if (imageInput) {

  imageInput.addEventListener(
    "change",
    async (event) => {

      const files =
        [...event.target.files]
          .slice(0, 5);

      selectedImages = [];

      const bar = $("#bar");

      if (bar) {
        bar.style.width = "5%";
      }

      try {

        for (
          let i = 0;
          i < files.length;
          i++
        ) {

          const file = files[i];

          if (
            ![
              "image/jpeg",
              "image/png",
              "image/webp"
            ].includes(file.type)
          ) {
            continue;
          }

          const compressed =
            await compressImage(file);

          selectedImages.push(
            compressed
          );

          if (bar) {

            bar.style.width =
              Math.round(
                ((i + 1) /
                  files.length) *
                  100
              ) + "%";

          }

        }

        renderImagePreview();

      } catch (error) {

        console.error(error);

        alert(
          "ছবি প্রসেস করা যায়নি।"
        );

      }

    }
  );

}


function renderImagePreview() {

  const preview =
    $("#previews");

  if (!preview) return;

  preview.innerHTML =
    selectedImages
      .map(
        (image) =>
          `<img src="${image}" alt="Product image">`
      )
      .join("");

}


/* =====================================================
   OPEN PRODUCT FORM
===================================================== */

const newProductButton =
  $("#newP");

if (newProductButton) {

  newProductButton.addEventListener(
    "click",
    () => {

      const editor =
        $("#editor");

      if (editor) {

        editor.style.display =
          editor.style.display === "none"
            ? "block"
            : "none";

      }

    }
  );

}


/* =====================================================
   VARIANT PARSER
===================================================== */

function parseVariants(text) {

  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {

      const parts =
        line
          .split("|")
          .map((part) =>
            part.trim()
          );

      return {

        sku:
          parts[0] || "",

        size:
          parts[1] || "",

        color:
          parts[2] || "",

        cost:
          Number(parts[3] || 0),

        sell:
          Number(parts[4] || 0),

        stock:
          Number(parts[5] || 0)

      };

    });

}


/* =====================================================
   PRODUCT SAVE
===================================================== */

const productForm =
  $("#productForm");

if (productForm) {

  productForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      const form =
        new FormData(
          productForm
        );

      const variants =
        parseVariants(
          form.get("variants")
        );

      if (!variants.length) {

        alert(
          "কমপক্ষে একটি Variant দিন।"
        );

        return;
      }

      if (!selectedImages.length) {

        alert(
          "কমপক্ষে একটি Product Image দিন।"
        );

        return;
      }


      const totalStock =
        variants.reduce(
          (total, variant) =>
            total +
            Number(
              variant.stock || 0
            ),
          0
        );


      const product = {

        name:
          String(
            form.get("name") || ""
          ).trim(),

        code:
          String(
            form.get("code") || ""
          ).trim(),

        category:
          String(
            form.get("category") || ""
          ),

        description:
          String(
            form.get("description") || ""
          ).trim(),

        regularPrice:
          Number(
            form.get("regularPrice") || 0
          ),

        salePrice:
          Number(
            form.get("salePrice") || 0
          ),

        price:
          Number(
            form.get("salePrice") ||
            form.get("regularPrice") ||
            0
          ),

        lowStock:
          Number(
            form.get("lowStock") || 3
          ),

        published:
          form.get("published") === "on",

        variants,

        stock:
          totalStock,

        images:
          selectedImages,

        soldCount: 0,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp()

      };


      try {

        await addDoc(
          collection(
            db,
            "products"
          ),
          product
        );

        productForm.reset();

        selectedImages = [];

        renderImagePreview();

        const editor =
          $("#editor");

        if (editor) {
          editor.style.display =
            "none";
        }

        alert(
          "Product successfully added."
        );

      } catch (error) {

        console.error(error);

        alert(
          "Product save হয়নি। Firebase Rules পরীক্ষা করুন।"
        );

      }

    }
  );

}


/* =====================================================
   PRODUCTS LIVE
===================================================== */

onSnapshot(
  collection(
    db,
    "products"
  ),
  (snapshot) => {

    products =
      snapshot.docs.map(
        (document) => ({
          id: document.id,
          ...document.data()
        })
      );

    renderProducts();

    renderInventory();

    updateProductSelectors();

    updateDashboard();

  },
  (error) =>
    console.error(
      "Products:",
      error
    )
);


/* =====================================================
   PRODUCT TABLE
===================================================== */

function renderProducts() {

  const table =
    $("#productTable");

  if (!table) return;


  if (!products.length) {

    table.innerHTML =
      "<p>এখনো কোনো Product নেই।</p>";

    return;

  }


  table.innerHTML = `

    <table>

      <thead>

        <tr>

          <th>Image</th>

          <th>Product</th>

          <th>Category</th>

          <th>Price</th>

          <th>Stock</th>

          <th>Action</th>

        </tr>

      </thead>

      <tbody>

        ${products.map(
          (product) => `

          <tr>

            <td>

              ${
                product.images?.[0]
                  ? `<img
                       src="${product.images[0]}"
                       style="
                         width:55px;
                         height:55px;
                         object-fit:cover;
                         border-radius:8px;
                       "
                     >`
                  : "-"
              }

            </td>

            <td>

              <b>
                ${product.name || ""}
              </b>

              <br>

              <small>
                ${product.code || ""}
              </small>

            </td>

            <td>
              ${product.category || "-"}
            </td>

            <td>
              ${money(
                product.price ||
                product.regularPrice
              )}
            </td>

            <td>
              ${product.stock || 0}
            </td>

            <td>

              <button
                class="btn danger"
                data-delete-product="${product.id}">
                Delete
              </button>

            </td>

          </tr>

        `).join("")}

      </tbody>

    </table>

  `;


  document
    .querySelectorAll(
      "[data-delete-product]"
    )
    .forEach((button) => {

      button.addEventListener(
        "click",
        async () => {

          const confirmed =
            confirm(
              "এই Product Delete করবেন?"
            );

          if (!confirmed) return;

          try {

            await deleteDoc(
              doc(
                db,
                "products",
                button.dataset
                  .deleteProduct
              )
            );

          } catch (error) {

            console.error(error);

            alert(
              "Product delete হয়নি।"
            );

          }

        }
      );

    });

}


/* =====================================================
   CATEGORIES
===================================================== */

onSnapshot(
  collection(
    db,
    "categories"
  ),
  (snapshot) => {

    categories =
      snapshot.docs.map(
        (document) => ({
          id: document.id,
          ...document.data()
        })
      );

    renderCategories();

    updateCategorySelect();

  },
  (error) =>
    console.error(
      "Categories:",
      error
    )
);


const categoryForm =
  $("#catForm");

if (categoryForm) {

  categoryForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      const form =
        new FormData(
          categoryForm
        );

      const name =
        String(
          form.get("name") || ""
        ).trim();

      if (!name) return;


      try {

        await addDoc(
          collection(
            db,
            "categories"
          ),
          {

            name,

            active: true,

            createdAt:
              serverTimestamp()

          }
        );

        categoryForm.reset();

      } catch (error) {

        console.error(error);

        alert(
          "Category add হয়নি।"
        );

      }

    }
  );

}


function renderCategories() {

  const list =
    $("#catList");

  if (!list) return;


  if (!categories.length) {

    list.innerHTML =
      "<p>এখনো কোনো Category নেই।</p>";

    return;

  }


  list.innerHTML =
    categories
      .map(
        (category) => `

          <div
            class="row between"
            style="
              margin-top:10px;
              padding:10px;
              border-bottom:1px solid #eee;
            "
          >

            <b>
              ${category.name}
            </b>

            <button
              class="btn danger"
              data-delete-category="${category.id}">
              Delete
            </button>

          </div>

        `
      )
      .join("");


  document
    .querySelectorAll(
      "[data-delete-category]"
    )
    .forEach((button) => {

      button.addEventListener(
        "click",
        async () => {

          if (
            !confirm(
              "Category delete করবেন?"
            )
          ) return;

          await deleteDoc(
            doc(
              db,
              "categories",
              button.dataset
                .deleteCategory
            )
          );

        }
      );

    });

}


function updateCategorySelect() {

  const select =
    $("#productCat");

  if (!select) return;


  select.innerHTML = `

    <option value="">
      Select Category
    </option>

    ${categories
      .filter(
        (category) =>
          category.active !== false
      )
      .map(
        (category) =>
          `<option value="${category.name}">
             ${category.name}
           </option>`
      )
      .join("")}

  `;

}


/* =====================================================
   ORDERS
===================================================== */

onSnapshot(
  collection(
    db,
    "orders"
  ),
  (snapshot) => {

    orders =
      snapshot.docs.map(
        (document) => ({
          id: document.id,
          ...document.data()
        })
      );

    renderOrders();

    updateDashboard();

  },
  (error) =>
    console.error(
      "Orders:",
      error
    )
);


const orderStatuses = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled"
];


function renderOrders() {

  const table =
    $("#orderTable");

  if (!table) return;


  if (!orders.length) {

    table.innerHTML =
      "<p>এখনো কোনো Online Order নেই।</p>";

    return;

  }


  table.innerHTML = `

    <table>

      <thead>

        <tr>

          <th>Customer</th>

          <th>Items</th>

          <th>Total</th>

          <th>Payment</th>

          <th>Status</th>

        </tr>

      </thead>

      <tbody>

        ${orders.map(
          (order) => `

          <tr>

            <td>

              <b>
                ${order.customerName || ""}
              </b>

              <br>

              ${order.phone || ""}

              <br>

              <small>
                ${order.district || ""}
                ${order.area || ""}
              </small>

            </td>

            <td>

              ${(order.items || [])
                .map(
                  (item) =>
                    `${item.name || "Product"} × ${item.qty || 1}`
                )
                .join("<br>")}

            </td>

            <td>
              ${money(order.total)}
            </td>

            <td>

              ${order.payment || order.paymentMethod || ""}

              <br>

              <small>
                ${order.trx || order.trxId || ""}
              </small>

            </td>

            <td>

              <select
                class="field"
                data-order-status="${order.id}"
              >

                ${orderStatuses.map(
                  (status) => `

                    <option
                      value="${status}"
                      ${
                        status ===
                        order.status
                          ? "selected"
                          : ""
                      }
                    >
                      ${status}
                    </option>

                  `
                ).join("")}

              </select>

            </td>

          </tr>

        `).join("")}

      </tbody>

    </table>

  `;


  document
    .querySelectorAll(
      "[data-order-status]"
    )
    .forEach((select) => {

      select.addEventListener(
        "change",
        () =>
          changeOrderStatus(
            select.dataset
              .orderStatus,
            select.value
          )
      );

    });

}


/* =====================================================
   ORDER STOCK TRANSACTION
===================================================== */

async function changeOrderStatus(
  orderId,
  nextStatus
) {

  const orderRef =
    doc(
      db,
      "orders",
      orderId
    );


  try {

    await runTransaction(
      db,
      async (transaction) => {

        const orderSnapshot =
          await transaction.get(
            orderRef
          );

        if (
          !orderSnapshot.exists()
        ) {
          throw new Error(
            "Order পাওয়া যায়নি।"
          );
        }


        const order =
          orderSnapshot.data();

        const items =
          order.items || [];


        /*
          IMPORTANT:
          Read product documents first.
        */

        const productData = [];


        if (
          (
            nextStatus ===
              "Confirmed" &&
            order.stockState !==
              "deducted"
          ) ||
          (
            nextStatus ===
              "Cancelled" &&
            order.stockState ===
              "deducted"
          ) ||
          (
            nextStatus ===
              "Delivered" &&
            !order.salesCounted
          )
        ) {

          for (
            const item of items
          ) {

            const productId =
              item.productId ||
              item.id;

            if (!productId)
              continue;


            const productRef =
              doc(
                db,
                "products",
                productId
              );

            const productSnapshot =
              await transaction.get(
                productRef
              );


            if (
              !productSnapshot.exists()
            ) {
              throw new Error(
                "Product পাওয়া যায়নি।"
              );
            }


            productData.push({

              item,

              ref: productRef,

              data:
                productSnapshot.data()

            });

          }

        }


        /*
          CONFIRMED
          Deduct stock once.
        */

        if (
          nextStatus ===
            "Confirmed" &&
          order.stockState !==
            "deducted"
        ) {

          for (
            const entry of productData
          ) {

            const qty =
              Number(
                entry.item.qty || 0
              );

            const currentStock =
              Number(
                entry.data.stock || 0
              );


            if (
              currentStock < qty
            ) {

              throw new Error(
                `${entry.data.name} - পর্যাপ্ত Stock নেই।`
              );

            }


            transaction.update(
              entry.ref,
              {
                stock:
                  currentStock -
                  qty
              }
            );

          }


          transaction.update(
            orderRef,
            {
              stockState:
                "deducted"
            }
          );

        }


        /*
          CANCELLED
          Return stock only if deducted.
        */

        if (
          nextStatus ===
            "Cancelled" &&
          order.stockState ===
            "deducted" &&
          !order.salesCounted
        ) {

          for (
            const entry of productData
          ) {

            transaction.update(
              entry.ref,
              {
                stock:
                  Number(
                    entry.data.stock || 0
                  ) +
                  Number(
                    entry.item.qty || 0
                  )
              }
            );

          }


          transaction.update(
            orderRef,
            {
              stockState:
                "returned"
            }
          );

        }


        /*
          DELIVERED
          Count sale/profit once.
        */

        if (
          nextStatus ===
            "Delivered" &&
          !order.salesCounted
        ) {

          let profit = 0;


          for (
            const entry of productData
          ) {

            const qty =
              Number(
                entry.item.qty || 0
              );

            const sellingPrice =
              Number(
                entry.item.price || 0
              );

            const cost =
              Number(
                entry.data.costPrice ||
                entry.item.cost ||
                0
              );


            profit +=
              (
                sellingPrice -
                cost
              ) *
              qty;


            transaction.update(
              entry.ref,
              {
                soldCount:
                  Number(
                    entry.data
                      .soldCount || 0
                  ) +
                  qty
              }
            );

          }


          transaction.update(
            orderRef,
            {

              salesCounted:
                true,

              profit,

              deliveredAt:
                serverTimestamp()

            }
          );

        }


        transaction.update(
          orderRef,
          {

            status:
              nextStatus,

            updatedAt:
              serverTimestamp()

          }
        );

      }
    );


    alert(
      "Order status updated."
    );

  } catch (error) {

    console.error(error);

    alert(error.message);

  }

}


/* =====================================================
   INVENTORY
===================================================== */

function renderInventory() {

  const table =
    $("#inventoryTable");

  if (!table) return;


  let units = 0;
  let costValue = 0;
  let retailValue = 0;
  let stockOut = 0;


  products.forEach(
    (product) => {

      const stock =
        Number(
          product.stock || 0
        );

      units += stock;


      const variants =
        product.variants || [];


      if (variants.length) {

        variants.forEach(
          (variant) => {

            costValue +=
              Number(
                variant.stock || 0
              ) *
              Number(
                variant.cost || 0
              );

            retailValue +=
              Number(
                variant.stock || 0
              ) *
              Number(
                variant.sell || 0
              );

          }
        );

      }


      if (stock <= 0) {
        stockOut++;
      }

    }
  );


  if ($("#units")) {
    $("#units").textContent =
      units;
  }

  if ($("#costVal")) {
    $("#costVal").textContent =
      money(costValue);
  }

  if ($("#retailVal")) {
    $("#retailVal").textContent =
      money(retailValue);
  }

  if ($("#out")) {
    $("#out").textContent =
      stockOut;
  }


  table.innerHTML = `

    <table>

      <thead>

        <tr>

          <th>Product</th>

          <th>Code</th>

          <th>Stock</th>

          <th>Low Stock</th>

        </tr>

      </thead>

      <tbody>

        ${products.map(
          (product) => `

            <tr>

              <td>
                ${product.name}
              </td>

              <td>
                ${product.code || "-"}
              </td>

              <td>
                <b>
                  ${product.stock || 0}
                </b>
              </td>

              <td>
                ${product.lowStock || 3}
              </td>

            </tr>

          `
        ).join("")}

      </tbody>

    </table>

  `;

}


/* =====================================================
   PRODUCT SELECTORS
===================================================== */

function updateProductSelectors() {

  const options =
    products
      .map(
        (product) =>
          `<option value="${product.id}">
             ${product.name} — Stock ${product.stock || 0}
           </option>`
      )
      .join("");


  if ($("#posVariant")) {

    $("#posVariant").innerHTML =
      `<option value="">
         Select Product
       </option>${options}`;

  }


  if ($("#purchaseVariant")) {

    $("#purchaseVariant").innerHTML =
      `<option value="">
         Select Product
       </option>${options}`;

  }

}


/* =====================================================
   POS / OFFLINE SALES
===================================================== */

const posForm =
  $("#posForm");

if (posForm) {

  posForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      const form =
        new FormData(posForm);

      const productId =
        $("#posVariant")?.value;

      const qty =
        Number(
          form.get("qty") || 0
        );

      const discount =
        Number(
          form.get("discount") || 0
        );

      const product =
        products.find(
          (item) =>
            item.id === productId
        );


      if (!product) {

        alert(
          "Product নির্বাচন করুন।"
        );

        return;
      }


      if (
        qty < 1 ||
        Number(product.stock || 0) <
          qty
      ) {

        alert(
          "পর্যাপ্ত Stock নেই।"
        );

        return;
      }


      const price =
        Number(
          product.price ||
          product.salePrice ||
          product.regularPrice ||
          0
        );


      const total =
        Math.max(
          0,
          price * qty -
          discount
        );


      const saleRef =
        doc(
          collection(
            db,
            "offlineSales"
          )
        );


      const productRef =
        doc(
          db,
          "products",
          product.id
        );


      try {

        await runTransaction(
          db,
          async (transaction) => {

            const snapshot =
              await transaction.get(
                productRef
              );

            const current =
              snapshot.data();

            if (
              Number(
                current.stock || 0
              ) < qty
            ) {

              throw new Error(
                "Stock insufficient."
              );

            }


            transaction.update(
              productRef,
              {

                stock:
                  Number(
                    current.stock || 0
                  ) -
                  qty,

                soldCount:
                  Number(
                    current.soldCount ||
                    0
                  ) +
                  qty

              }
            );


            transaction.set(
              saleRef,
              {

                saleCode:
                  "POS-" +
                  Date.now(),

                productId:
                  product.id,

                productName:
                  product.name,

                qty,

                price,

                discount,

                total,

                payment:
                  form.get(
                    "payment"
                  ),

                customer:
                  form.get(
                    "customer"
                  ) || "Walk-in",

                source:
                  "Offline",

                createdAt:
                  serverTimestamp()

              }
            );

          }
        );


        posForm.reset();

        alert(
          "POS Sale saved."
        );

      } catch (error) {

        console.error(error);

        alert(error.message);

      }

    }
  );

}


/* =====================================================
   OFFLINE SALES LIST
===================================================== */

onSnapshot(
  collection(
    db,
    "offlineSales"
  ),
  (snapshot) => {

    offlineSales =
      snapshot.docs.map(
        (document) => ({
          id: document.id,
          ...document.data()
        })
      );

    renderOfflineSales();

    updateDashboard();

    renderReports();

  }
);


function renderOfflineSales() {

  const table =
    $("#posTable");

  if (!table) return;


  table.innerHTML = `

    <table>

      <thead>

        <tr>

          <th>Sale</th>

          <th>Product</th>

          <th>Qty</th>

          <th>Total</th>

          <th>Payment</th>

        </tr>

      </thead>

      <tbody>

        ${offlineSales.map(
          (sale) => `

          <tr>

            <td>
              ${sale.saleCode || ""}
            </td>

            <td>
              ${sale.productName || ""}
            </td>

            <td>
              ${sale.qty || 0}
            </td>

            <td>
              ${money(sale.total)}
            </td>

            <td>
              ${sale.payment || ""}
            </td>

          </tr>

        `).join("")}

      </tbody>

    </table>

  `;

}


/* =====================================================
   PURCHASE / STOCK IN
===================================================== */

const purchaseForm =
  $("#purchaseForm");

if (purchaseForm) {

  purchaseForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      const form =
        new FormData(
          purchaseForm
        );

      const productId =
        $("#purchaseVariant")?.value;

      const qty =
        Number(
          form.get("qty") || 0
        );

      const cost =
        Number(
          form.get("cost") || 0
        );

      const product =
        products.find(
          (item) =>
            item.id === productId
        );


      if (
        !product ||
        qty < 1
      ) {

        alert(
          "Product ও Quantity পরীক্ষা করুন।"
        );

        return;
      }


      const productRef =
        doc(
          db,
          "products",
          product.id
        );


      const purchaseRef =
        doc(
          collection(
            db,
            "purchases"
          )
        );


      try {

        await runTransaction(
          db,
          async (transaction) => {

            const snapshot =
              await transaction.get(
                productRef
              );

            const current =
              snapshot.data();

            const oldStock =
              Number(
                current.stock || 0
              );

            const oldCost =
              Number(
                current.costPrice || 0
              );


            const newStock =
              oldStock + qty;


            const weightedCost =
              newStock > 0
                ?
                (
                  oldStock *
                    oldCost +
                  qty *
                    cost
                ) /
                newStock
                :
                cost;


            transaction.update(
              productRef,
              {

                stock:
                  newStock,

                costPrice:
                  weightedCost,

                updatedAt:
                  serverTimestamp()

              }
            );


            transaction.set(
              purchaseRef,
              {

                purchaseCode:
                  "PUR-" +
                  Date.now(),

                supplier:
                  form.get(
                    "supplier"
                  ) || "",

                productId:
                  product.id,

                productName:
                  product.name,

                qty,

                unitCost:
                  cost,

                total:
                  qty * cost,

                createdAt:
                  serverTimestamp()

              }
            );

          }
        );


        purchaseForm.reset();

        alert(
          "Purchase / Stock In saved."
        );

      } catch (error) {

        console.error(error);

        alert(error.message);

      }

    }
  );

}


/* =====================================================
   PURCHASE LIST
===================================================== */

onSnapshot(
  collection(
    db,
    "purchases"
  ),
  (snapshot) => {

    purchases =
      snapshot.docs.map(
        (document) => ({
          id: document.id,
          ...document.data()
        })
      );

    renderPurchases();

    renderReports();

  }
);


function renderPurchases() {

  const table =
    $("#purchaseTable");

  if (!table) return;


  table.innerHTML = `

    <table>

      <thead>

        <tr>

          <th>Purchase</th>

          <th>Supplier</th>

          <th>Product</th>

          <th>Qty</th>

          <th>Cost</th>

          <th>Total</th>

        </tr>

      </thead>

      <tbody>

        ${purchases.map(
          (purchase) => `

          <tr>

            <td>
              ${purchase.purchaseCode || ""}
            </td>

            <td>
              ${purchase.supplier || ""}
            </td>

            <td>
              ${purchase.productName || ""}
            </td>

            <td>
              ${purchase.qty || 0}
            </td>

            <td>
              ${money(purchase.unitCost)}
            </td>

            <td>
              ${money(purchase.total)}
            </td>

          </tr>

        `).join("")}

      </tbody>

    </table>

  `;

}


/* =====================================================
   EXPENSE
===================================================== */

const expenseForm =
  $("#expenseForm");

if (expenseForm) {

  expenseForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      const form =
        new FormData(
          expenseForm
        );


      try {

        await addDoc(
          collection(
            db,
            "expenses"
          ),
          {

            category:
              String(
                form.get(
                  "category"
                ) || ""
              ).trim(),

            amount:
              Number(
                form.get(
                  "amount"
                ) || 0
              ),

            note:
              String(
                form.get(
                  "note"
                ) || ""
              ).trim(),

            createdAt:
              serverTimestamp()

          }
        );


        expenseForm.reset();

        alert(
          "Expense saved."
        );

      } catch (error) {

        console.error(error);

        alert(
          "Expense save হয়নি।"
        );

      }

    }
  );

}


/* =====================================================
   EXPENSE LIST
===================================================== */

onSnapshot(
  collection(
    db,
    "expenses"
  ),
  (snapshot) => {

    expenses =
      snapshot.docs.map(
        (document) => ({
          id: document.id,
          ...document.data()
        })
      );

    renderExpenses();

    renderReports();

  }
);


function renderExpenses() {

  const table =
    $("#expenseTable");

  if (!table) return;


  table.innerHTML = `

    <table>

      <thead>

        <tr>

          <th>Category</th>

          <th>Amount</th>

          <th>Note</th>

        </tr>

      </thead>

      <tbody>

        ${expenses.map(
          (expense) => `

          <tr>

            <td>
              ${expense.category || ""}
            </td>

            <td>
              ${money(expense.amount)}
            </td>

            <td>
              ${expense.note || ""}
            </td>

          </tr>

        `).join("")}

      </tbody>

    </table>

  `;

}


/* =====================================================
   SETTINGS SAVE
===================================================== */

const settingsForm =
  $("#settingsForm");

if (settingsForm) {

  settingsForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      const form =
        new FormData(
          settingsForm
        );


      const settings = {

        phone:
          String(
            form.get("phone") || ""
          ).trim(),

        whatsapp:
          String(
            form.get("whatsapp") || ""
          ).trim(),

        bkashNumber:
          String(
            form.get("bkashNumber") || ""
          ).trim(),

        nagadNumber:
          String(
            form.get("nagadNumber") || ""
          ).trim(),

        insideDelivery:
          Number(
            form.get(
              "insideDelivery"
            ) || 80
          ),

        outsideDelivery:
          Number(
            form.get(
              "outsideDelivery"
            ) || 150
          ),

        address:
          String(
            form.get("address") || ""
          ).trim(),

        hours:
          String(
            form.get("hours") || ""
          ).trim(),

        email:
          String(
            form.get("email") || ""
          ).trim(),

        updatedAt:
          serverTimestamp()

      };


      try {

        await setDoc(
          doc(
            db,
            "settings",
            "store"
          ),
          settings,
          {
            merge: true
          }
        );


        alert(
          "Settings successfully saved."
        );

      } catch (error) {

        console.error(error);

        alert(
          "Settings save হয়নি। Firebase Rules পরীক্ষা করুন।"
        );

      }

    }
  );

}


/* =====================================================
   SETTINGS LOAD
===================================================== */

async function loadSettings() {

  if (!settingsForm) return;


  try {

    const snapshot =
      await getDoc(
        doc(
          db,
          "settings",
          "store"
        )
      );


    const settings =
      snapshot.exists()
        ? snapshot.data()
        : {};


    const defaults = {

      phone:
        "+8801612961523",

      whatsapp:
        "+8801612961523",

      bkashNumber:
        "01820693313",

      nagadNumber:
        "01820693313",

      insideDelivery:
        80,

      outsideDelivery:
        150,

      address:
        "দক্ষিণ বাঙ্গরা বাজার বাসস্ট্যান্ডের উত্তর পাশে, বাঙ্গরা বাজার থানা, মুরাদনগর, কুমিল্লা",

      hours:
        "সকাল ৯টা - রাত ৮টা",

      email:
        "mehedixpress522@gmail.com"

    };


    const data = {
      ...defaults,
      ...settings
    };


    Object.keys(
      defaults
    ).forEach(
      (key) => {

        const field =
          settingsForm.elements[key];

        if (field) {
          field.value =
            data[key] ?? "";
        }

      }
    );

  } catch (error) {

    console.error(
      "Settings load:",
      error
    );

  }

}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

  const today =
    new Date();

  const isToday =
    (timestamp) => {

      try {

        const date =
          timestamp?.toDate?.();

        return (
          date &&
          date.toDateString() ===
            today.toDateString()
        );

      } catch {
        return false;
      }

    };


  const delivered =
    orders.filter(
      (order) =>
        order.status ===
        "Delivered"
    );


  const todayOnline =
    delivered
      .filter(
        (order) =>
          isToday(
            order.deliveredAt ||
            order.updatedAt ||
            order.createdAt
          )
      )
      .reduce(
        (total, order) =>
          total +
          Number(
            order.total || 0
          ),
        0
      );


  const todayOffline =
    offlineSales
      .filter(
        (sale) =>
          isToday(
            sale.createdAt
          )
      )
      .reduce(
        (total, sale) =>
          total +
          Number(
            sale.total || 0
          ),
        0
      );


  if ($("#today")) {

    $("#today").textContent =
      money(
        todayOnline +
        todayOffline
      );

  }


  const currentMonth =
    today.getMonth();

  const currentYear =
    today.getFullYear();


  const inCurrentMonth =
    (timestamp) => {

      try {

        const date =
          timestamp?.toDate?.();

        return (
          date &&
          date.getMonth() ===
            currentMonth &&
          date.getFullYear() ===
            currentYear
        );

      } catch {
        return false;
      }

    };


  const monthOnline =
    delivered
      .filter(
        (order) =>
          inCurrentMonth(
            order.deliveredAt ||
            order.updatedAt ||
            order.createdAt
          )
      )
      .reduce(
        (total, order) =>
          total +
          Number(
            order.total || 0
          ),
        0
      );


  const monthOffline =
    offlineSales
      .filter(
        (sale) =>
          inCurrentMonth(
            sale.createdAt
          )
      )
      .reduce(
        (total, sale) =>
          total +
          Number(
            sale.total || 0
          ),
        0
      );


  if ($("#month")) {

    $("#month").textContent =
      money(
        monthOnline +
        monthOffline
      );

  }


  if ($("#pending")) {

    $("#pending").textContent =
      orders.filter(
        (order) =>
          order.status ===
          "Pending"
      ).length;

  }


  if ($("#low")) {

    $("#low").textContent =
      products.filter(
        (product) =>
          Number(
            product.stock || 0
          ) <=
          Number(
            product.lowStock || 3
          )
      ).length;

  }


  const recent =
    $("#recent");

  if (recent) {

    recent.innerHTML = `

      <h3>Recent Summary</h3>

      <p>
        Products:
        <b>${products.length}</b>
      </p>

      <p>
        Online Orders:
        <b>${orders.length}</b>
      </p>

      <p>
        Offline Sales:
        <b>${offlineSales.length}</b>
      </p>

    `;

  }

}


/* =====================================================
   REPORTS
===================================================== */

function renderReports() {

  const report =
    $("#report");

  if (!report) return;


  const onlineRevenue =
    orders
      .filter(
        (order) =>
          order.status ===
          "Delivered"
      )
      .reduce(
        (total, order) =>
          total +
          Number(
            order.total || 0
          ),
        0
      );


  const offlineRevenue =
    offlineSales.reduce(
      (total, sale) =>
        total +
        Number(
          sale.total || 0
        ),
      0
    );


  const purchaseTotal =
    purchases.reduce(
      (total, purchase) =>
        total +
        Number(
          purchase.total || 0
        ),
      0
    );


  const expenseTotal =
    expenses.reduce(
      (total, expense) =>
        total +
        Number(
          expense.amount || 0
        ),
      0
    );


  report.innerHTML = `

    <h3>Business Summary</h3>

    <p>
      Online Delivered Sales:
      <b>${money(onlineRevenue)}</b>
    </p>

    <p>
      Offline / POS Sales:
      <b>${money(offlineRevenue)}</b>
    </p>

    <p>
      Combined Revenue:
      <b>${money(
        onlineRevenue +
        offlineRevenue
      )}</b>
    </p>

    <p>
      Purchases:
      <b>${money(purchaseTotal)}</b>
    </p>

    <p>
      Expenses:
      <b>${money(expenseTotal)}</b>
    </p>

  `;

}


/* =====================================================
   CSV EXPORT
===================================================== */

const csvButton =
  $("#csv");

if (csvButton) {

  csvButton.addEventListener(
    "click",
    () => {

      const rows = [

        [
          "Type",
          "Reference",
          "Amount"
        ]

      ];


      orders
        .filter(
          (order) =>
            order.status ===
            "Delivered"
        )
        .forEach(
          (order) => {

            rows.push([
              "Online",
              order.id,
              order.total || 0
            ]);

          }
        );


      offlineSales.forEach(
        (sale) => {

          rows.push([
            "Offline",
            sale.saleCode || sale.id,
            sale.total || 0
          ]);

        }
      );


      expenses.forEach(
        (expense) => {

          rows.push([
            "Expense",
            expense.category || "",
            expense.amount || 0
          ]);

        }
      );


      const csv =
        rows
          .map(
            (row) =>
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
          [csv],
          {
            type:
              "text/csv;charset=utf-8"
          }
        );


      const url =
        URL.createObjectURL(
          blob
        );


      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        "mehedi-xpress-report.csv";

      link.click();

      URL.revokeObjectURL(
        url
      );

    }
  );

}


/* =====================================================
   INITIAL
===================================================== */

updateDashboard();
renderReports();
