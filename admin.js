<!doctype html><html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mehedi Xpress Admin</title>

<style>

*{box-sizing:border-box}body{margin:0;font-family:Arial,"Noto Sans Bengali",sans-serif;background:#f3f6fb;color:#172033}.login{min-height:100vh;display:grid;place-items:center}.loginbox,.card{background:#fff;border-radius:18px;box-shadow:0 8px 30px #0001;padding:22px}.loginbox{width:min(430px,92%)}input,select,textarea{width:100%;padding:12px;border:1px solid #d9e0ea;border-radius:10px}textarea{min-height:100px}.field{display:flex;flex-direction:column;gap:6px}.formgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.full{grid-column:1/-1}.btn{border:0;border-radius:10px;padding:11px 15px;font-weight:700;cursor:pointer}.primary{background:#2563eb;color:#fff}.danger{background:#fee2e2;color:#b91c1c}.layout{display:grid;grid-template-columns:240px 1fr;min-height:100vh}.side{background:#111827;color:#fff;padding:20px}.brand{font-size:22px;font-weight:900;margin-bottom:25px}.menu button{width:100%;text-align:left;background:transparent;color:#dbeafe;border:0;padding:12px;border-radius:10px;margin:3px 0;cursor:pointer}.menu button.active,.menu button:hover{background:#2563eb}.main{padding:24px;overflow:auto}.top{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.panel{display:none}.panel.active{display:block}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.stat{background:#fff;border-radius:16px;padding:18px}.stat b{font-size:28px;display:block}.head{display:flex;justify-content:space-between;align-items:center;margin:25px 0 12px}.tablewrap{overflow:auto}table{width:100%;border-collapse:collapse;background:#fff}th,td{padding:12px;border-bottom:1px solid #edf0f5;text-align:left;vertical-align:top}.pimg{width:58px;height:58px;object-fit:cover;border-radius:10px}.preview{display:flex;gap:8px;flex-wrap:wrap}.preview img{width:85px;height:85px;object-fit:cover;border-radius:10px}.hint{font-size:12px;color:#64748b}.status{padding:5px 9px;border-radius:999px;background:#e0e7ff}.actions{display:flex;gap:6px;flex-wrap:wrap}.notice{background:#fff7ed;padding:12px;border-radius:12px;margin-bottom:15px;color:#9a3412}
@media(max-width:850px){.layout{grid-template-columns:1fr}.side{position:static}.menu{display:flex;overflow:auto}.menu button{white-space:nowrap}.stats{grid-template-columns:1fr 1fr}.formgrid{grid-template-columns:1fr}.full{grid-column:auto}.main{padding:14px}}

/* Admin Authentication V3 */
.loginbox{max-width:610px!important}
#loginMsg,#securityMsg{font-weight:700;color:#b42318;word-break:break-word} #loginMsg small{font-weight:500;font-size:13px}
.loginbox small{color:#667085}


:root{--mx-navy:#071f3f;--mx-blue:#0b63ce;--mx-red:#ef233c;--mx-bg:#f4f7fb;--mx-line:#e3eaf3}
body{background:var(--mx-bg)}
.side{background:linear-gradient(180deg,#061a35,#0a2d59);padding:22px 16px}
.brand{padding:8px 8px 22px;border-bottom:1px solid #ffffff1c;margin-bottom:15px}
.brand:after{content:"PRIVATE MANAGEMENT";display:block;margin-top:5px;font-size:10px;letter-spacing:.16em;color:#8fb8e8}
.menu button{font-size:14px;font-weight:700;transition:.18s ease}
.menu button.active,.menu button:hover{background:#ffffff18;color:#fff}
.main{max-width:1600px;width:100%;margin:auto}
.top{background:#fff;border:1px solid var(--mx-line);padding:14px 18px;border-radius:15px;box-shadow:0 5px 20px #10233d0b}
.card,.stat{border:1px solid var(--mx-line);box-shadow:0 5px 20px #10233d0a}
.stat{position:relative;overflow:hidden}
.stat:before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--mx-blue)}
.primary{background:linear-gradient(135deg,#0b63ce,#074a9c)}
.login{background:radial-gradient(circle at top,#e8f3ff,#f5f8fc 48%,#eef3f9)}
.loginbox{border:1px solid #dce7f3;box-shadow:0 20px 60px #071f3f1f}
.loginbox:before{content:"MEHEDI XPRESS";display:block;color:var(--mx-navy);font-size:24px;font-weight:900;margin-bottom:3px}
.loginbox:after{content:"Private Admin Access • Authorized administrator only";display:block;color:#718198;font-size:11px;margin-top:14px;text-align:center}
table{border:1px solid var(--mx-line);border-radius:14px;overflow:hidden}
th{background:#f7faff;color:#34516f;font-size:12px;text-transform:uppercase;letter-spacing:.03em}
input:focus,select:focus,textarea:focus{outline:2px solid #0b63ce2b;border-color:#0b63ce}
@media(max-width:850px){.side{padding:14px}.brand{margin-bottom:8px}.main{padding:14px}.top{align-items:flex-start;gap:10px}.stats{gap:9px}}


.variant-head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin:6px 0 10px}
.variant-table-wrap{overflow:auto;border:1px solid #e3eaf3;border-radius:12px}
.variant-table{min-width:650px;border:0;border-radius:0}
.variant-table input{min-width:110px;padding:9px}
.variant-total{text-align:right;padding:10px 2px 0;color:#34516f}
.offer-price{color:#d71920;font-weight:900}.old-price{text-decoration:line-through;color:#8996a8;font-size:12px;margin-left:5px}
.badge-active{background:#dcfce7;color:#166534}.badge-disabled{background:#f1f5f9;color:#64748b}
@media(max-width:600px){.variant-head{align-items:flex-start;flex-direction:column}}

.posgrid{display:grid;grid-template-columns:1.25fr .9fr;gap:14px}.pos-products{max-height:480px;overflow:auto}.pos-item{display:flex;justify-content:space-between;gap:10px;padding:11px;border-bottom:1px solid #edf0f5}.pos-cart-row{display:grid;grid-template-columns:1.6fr .7fr .7fr .8fr auto;gap:7px;align-items:center;padding:8px 0;border-bottom:1px solid #edf0f5}.pos-cart-row input{padding:8px;border:1px solid #d9e0ea;border-radius:8px;width:100%}.totals{margin-top:12px;border-top:2px solid #e3eaf3;padding-top:10px}.totalrow{display:flex;justify-content:space-between;padding:5px 0}.grand{font-size:20px;font-weight:900}.memo{background:#fff;color:#111;padding:28px;max-width:850px;margin:auto}.memo-head{display:grid;grid-template-columns:90px 1fr auto;gap:15px;align-items:center;border-bottom:2px solid #071f3f;padding-bottom:14px}.memo-logo{width:80px;height:80px;object-fit:contain}.memo-brand h1{margin:0;color:#071f3f}.memo-brand p{margin:4px 0;font-size:12px}.memo-meta{text-align:right;font-size:12px}.memo-customer{display:grid;grid-template-columns:1fr 1fr;gap:6px 20px;padding:14px 0}.memo table{font-size:13px}.memo-summary{margin-left:auto;width:min(360px,100%);padding-top:12px}.memo-foot{margin-top:30px;display:flex;justify-content:space-between;gap:20px;text-align:center;font-size:12px}.memo-note{text-align:center;margin-top:24px;border-top:1px dashed #aaa;padding-top:10px}
@media(max-width:900px){.posgrid{grid-template-columns:1fr}.pos-cart-row{grid-template-columns:1.4fr .7fr .7fr}.pos-cart-row .lineTotal,.pos-cart-row .removeLine{grid-column:auto}.memo-head{grid-template-columns:65px 1fr}.memo-meta{grid-column:1/-1;text-align:left}.memo-customer{grid-template-columns:1fr}}
@media print{body *{visibility:hidden!important}#memoPrint,#memoPrint *,#orderInvoicePrint,#orderInvoicePrint *{visibility:visible!important}#memoPrint,#orderInvoicePrint{position:absolute;left:0;top:0;width:100%;box-shadow:none!important;margin:0!important}.no-print{display:none!important}
body.print-a4 #memoPrint,body.print-a4 #orderInvoicePrint{width:194mm!important;min-height:281mm!important;padding:10mm!important;font-size:12pt!important}
body.print-a5 #memoPrint,body.print-a5 #orderInvoicePrint{width:132mm!important;min-height:194mm!important;padding:7mm!important;font-size:9.5pt!important}
body.print-a5 #memoPrint .memo-logo,body.print-a5 #orderInvoicePrint .memo-logo{width:55px!important;height:55px!important}
body.print-a5 #memoPrint .memo-brand h1,body.print-a5 #orderInvoicePrint .memo-brand h1{font-size:22px!important}
body.print-a5 #memoPrint .memo-brand p,body.print-a5 #memoPrint .memo-meta,body.print-a5 #orderInvoicePrint .memo-brand p,body.print-a5 #orderInvoicePrint .memo-meta{font-size:9px!important}
body.print-a5 #memoPrint table,body.print-a5 #orderInvoicePrint table{font-size:9px!important}
body.print-a5 #memoPrint .grand{font-size:15px!important}
body.print-a5 #memoPrint .memo-foot,body.print-a5 #memoPrint .memo-note{font-size:9px!important}
}


body.admin-authenticated #login{display:none!important}
.address-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.phone-help{font-size:12px;color:#64748b}
.field-error{border-color:#dc2626!important;outline:2px solid #dc262622!important}
@media(max-width:700px){.address-grid{grid-template-columns:1fr}}


/* Dashboard navigation / stock filters */
.stat.mx-clickable{cursor:pointer;transition:transform .15s,box-shadow .15s;border:1px solid #cbdcf0;text-align:left;color:inherit;font:inherit}.stat.mx-clickable:hover,.stat.mx-clickable:focus-visible{transform:translateY(-2px);box-shadow:0 10px 25px #0b63ce20;outline:2px solid #0b63ce55}.stat.mx-clickable small{display:block;color:#64748b;font-size:12px;margin-top:6px}.mx-inline-tools{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin:10px 0}.mx-inline-tools select,.mx-inline-tools input{width:auto;min-width:160px}.mx-thumb{width:70px;height:48px;object-fit:cover;border-radius:8px;border:1px solid #dce5f1}.mx-settings-row{display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:12px 0;border-bottom:1px solid #edf0f5}.mx-settings-row input[type=file]{max-width:290px}.mx-status-note{padding:10px;background:#eaf4ff;border-radius:10px;margin:12px 0}
</style></head><body>
<section id="login" class="login"><form id="loginForm" class="loginbox">
<div style="text-align:center;margin-bottom:18px">
  <img src="assets/images/logo.png" alt="Mehedi Xpress" style="width:82px;height:82px;object-fit:contain;border-radius:18px" onerror="this.style.display='none'">
  <h1 style="margin:8px 0 4px">🔐 Mehedi Xpress Admin</h1>
  <p style="margin:0">Private & Authorized Administrator Access</p>
</div>
<div class="field"><label>Email</label><input id="email" type="email" value="mehedixpress522@gmail.com" autocomplete="username" required></div><br>
<div class="field"><label>Password</label><input id="password" type="password" autocomplete="current-password" required></div><br>
<button class="btn primary" style="width:100%">Login</button>
<button type="button" class="btn" style="width:100%;margin-top:10px" onclick="resetAdminPassword()">Forgot / Reset Password</button>
<p id="loginMsg" style="line-height:1.5"></p>
<small style="display:block;text-align:center;margin-top:16px">Public Sign Up disabled • Admin account is created once in Firebase Authentication</small>
</form></section>
<div id="app" class="layout" style="display:none"><aside class="side"><div class="brand">MEHEDI XPRESS<br><small>Admin Panel</small></div><div class="menu"><button class="active" data-p="dashboard">📊 Dashboard</button><button data-p="products">📦 Products</button><button data-p="categories">🗂 Categories</button><button data-p="inventory">📋 Inventory</button><button data-p="orders">🛒 Orders</button><button data-p="sales">💰 Sales Report</button><button data-p="pos">🧾 Offline Sale / POS</button><button data-p="customers">👥 Customer Directory</button><button data-p="reviews">⭐ Reviews</button><button data-p="banners">🖼 Banners</button><button data-p="settings">⚙ Settings</button><button id="logout">🚪 Logout</button></div></aside>
<main class="main"><div class="top"><h2 id="title">Dashboard</h2><a href="index.html" target="_blank">🌐 Website দেখুন</a></div>
<section id="dashboard" class="panel active"><div class="stats"><button type="button" class="stat mx-clickable" data-stat-route="products"><b id="sProducts">0</b>Products<small>পণ্যের তালিকা →</small></button><button type="button" class="stat mx-clickable" data-stat-route="orders"><b id="sOrders">0</b>Orders<small>অনলাইন অর্ডার →</small></button><button type="button" class="stat mx-clickable" data-stat-route="sales"><b id="sSales">৳0</b>Sales<small>অনলাইন ও অফলাইন বিক্রয় →</small></button><button type="button" class="stat mx-clickable" data-stat-route="pending"><b id="sPending">0</b>Pending<small>Pending তালিকা →</small></button></div><div class="stats" style="margin-top:14px">
<button type="button" class="stat mx-clickable" data-stat-route="inventory"><b id="sTotalStock">0</b>Total Stock<small>স্টক তালিকা →</small></button>
<button type="button" class="stat mx-clickable" data-stat-route="low"><b id="sLowStock">0</b>Low Stock<small>কম স্টক পণ্য →</small></button>
<button type="button" class="stat mx-clickable" data-stat-route="out"><b id="sOutStock">0</b>Out of Stock<small>স্টক শেষ পণ্য →</small></button>
<button type="button" class="stat mx-clickable" data-stat-route="inventory"><b id="sStockValue">৳0</b>Stock Cost Value<small>স্টকের ক্রয়মূল্য →</small></button>
</div>
<div class="head"><h3>⚠ Stock Alerts</h3></div><div id="stockAlerts" class="card"></div>
<div class="head"><h3>Recent Orders</h3></div><div class="tablewrap"><table><tbody id="recent"></tbody></table></div></section>
<section id="products" class="panel"><div class="head"><h3>Product Management</h3><button class="btn primary" id="newProduct">+ Add Product</button></div><div id="productEditor" class="card" style="display:none">
<form id="productForm" class="formgrid">
<input id="editId" type="hidden">
<div class="field"><label>Product Name *</label><input id="pName" required placeholder="যেমন: Argentina Home Jersey 2026"></div>
<div class="field"><label>Product Code / SKU *</label><input id="pCode" required placeholder="যেমন: ARG-26-HOME"></div>
<div class="field"><label>Category *</label><select id="pCategory" required></select></div>
<div class="field"><label>Purchase / Cost Price (৳) *</label><input id="pCostPrice" type="number" min="0" value="0" required></div>
<div class="field"><label>Regular / Previous Price (৳) *</label><input id="pRegularPrice" type="number" min="0" required></div>
<div class="field"><label>Offer Price (৳)</label><input id="pOfferPrice" type="number" min="0" placeholder="Offer না থাকলে খালি রাখুন"></div>
<div class="field"><label>Low Stock Alert At</label><input id="pLowStockAt" type="number" min="0" value="5"></div>
<div class="field"><label>Product Status</label><select id="pStatus"><option value="active">Active — Website-এ দেখাবে</option><option value="disabled">Disabled — Website-এ লুকানো</option></select></div>
<div class="field full"><div id="priceCalc" class="notice">Discount: 0% • Profit/Piece: ৳0 • Markup: 0%</div></div>
<div class="field full"><label>Product Description</label><textarea id="pDetails" placeholder="কাপড়, quality, fit, ব্যবহার, গুরুত্বপূর্ণ তথ্য..."></textarea></div>

<div class="field full">
<label>Product Images — সর্বোচ্চ 5টি</label>
<input id="pImages" type="file" accept="image/jpeg,image/png,image/webp" multiple>
<span class="hint">Front, Back, Side/Detail ছবি দিতে পারবেন। প্রথম ছবিটি Main Image হিসেবে ব্যবহার হবে।</span>
<div id="preview" class="preview"></div>
</div>

<div class="field full">
<div class="variant-head"><div><b>Size / Color / Stock Variants</b><div class="hint">প্রতিটি Size + Color-এর stock আলাদাভাবে দিন। মোট stock অটোমেটিক হিসাব হবে।</div></div><button class="btn" type="button" id="addVariant">+ Add Variant</button></div>
<div class="variant-table-wrap"><table class="variant-table"><thead><tr><th>Variant SKU</th><th>Size</th><th>Color</th><th>Stock</th><th></th></tr></thead><tbody id="variantRows"></tbody></table></div>
<div class="variant-total">Total Stock: <b id="variantTotal">0</b></div>
</div>

<div class="full actions"><button class="btn primary">Save Product</button><button class="btn" type="button" id="cancelProduct">Cancel</button></div>
</form></div>
<div class="tablewrap"><table><thead><tr><th>Image</th><th>Product</th><th>Code</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Action</th></tr></thead><tbody id="productRows"></tbody></table></div></section>
<section id="categories" class="panel"><div class="head"><h3>Category Management</h3></div><div class="card"><form id="catForm" class="formgrid"><div class="field"><label>নতুন Category</label><input id="catName" required></div><div class="field"><label>Category Photo (optional)</label><input id="catImage" type="file" accept="image/png,image/jpeg,image/webp"></div><div><br><button class="btn primary">Add Category</button></div></form><div id="catChips" style="margin-top:20px"></div><p class="hint">ছবি পরিবর্তন করতে Category-এর Edit Image ব্যবহার করুন।</p></div></section>
<section id="inventory" class="panel"><div class="head"><h3>Inventory / Stock</h3></div>
<div class="notice">প্রতিটি Product-এর Size/Color Variant stock থেকে মোট stock হিসাব হয়। Low Stock limit অনুযায়ী Dashboard alert দেখাবে।</div><div class="mx-inline-tools"><label>Stock Filter <select id="inventoryFilter"><option value="all">সব পণ্য</option><option value="low">Low Stock</option><option value="out">Out of Stock</option></select></label><input id="inventorySearch" placeholder="পণ্যের নাম / কোড খুঁজুন"></div>
<div class="tablewrap"><table><thead><tr><th>Product</th><th>Code</th><th>Category</th><th>Stock</th><th>Alert At</th><th>Cost Value</th><th>Status</th><th>Action</th></tr></thead><tbody id="inventoryRows"></tbody></table></div>
</section>
<section id="orders" class="panel">
<div class="head"><h3>Online Order Management</h3><span class="status">Website Orders</span></div>
<div class="toolbar"><input id="orderSearch" placeholder="Order ID / Memo ID / Customer ID / Mobile / Tracking"><select id="orderStatusFilter"><option value="">All Status</option><option>Pending</option><option>Confirmed</option><option>Processing</option><option>Shipped</option><option>Delivered</option><option>Completed</option><option>Cancelled</option><option>Returned</option></select></div>
<p id="orderLoadState" class="mx-status-note">Firebase থেকে অনলাইন অর্ডার লোড হচ্ছে...</p><div class="mx-inline-tools"><label>Source <select id="orderSourceFilter"><option value="online">Online Orders</option><option value="offline">Offline Sales</option></select></label></div><div class="tablewrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Action</th></tr></thead><tbody id="orderRows"></tbody></table></div>
</section>

<section id="sales" class="panel"><div class="head"><h3>Online & Offline Sales Report</h3></div><div class="mx-inline-tools"><label>Source <select id="salesSource"><option value="all">সব বিক্রয়</option><option value="online">Online</option><option value="offline">Offline POS</option></select></label><label>Status <select id="salesStatus"><option value="all">সব Status</option><option>Pending</option><option>Confirmed</option><option>Processing</option><option>Shipped</option><option>Delivered</option><option>Completed</option><option>Cancelled</option><option>Returned</option></select></label></div><div id="salesSummary" class="notice"></div><div class="tablewrap"><table><thead><tr><th>Source / ID</th><th>Customer</th><th>Items</th><th>Amount</th><th>Status</th><th>Details</th></tr></thead><tbody id="salesRows"></tbody></table></div></section>
<section id="customers" class="panel">
<div class="head"><h3>👥 Customer Directory / Customer Search</h3><span class="status">Online + Offline</span></div>
<div class="notice">Customer ID, মোবাইল, নাম, Order ID অথবা Memo ID দিয়ে খুঁজুন। এখানে বিদ্যমান Order, Offline Sale ও Customer Records একসঙ্গে দেখানো হয়। এটি নতুন Customer ID তৈরি করে না।</div>
<div class="toolbar"><input id="mxCustomerSearch" placeholder="Customer ID / Mobile / Name / Order ID / Memo ID" style="width:min(100%,550px)"><select id="mxCustomerSource"><option value="all">All Customers</option><option value="online">Online Only</option><option value="offline">Offline Only</option></select></div>
<p id="mxCustomerCount" class="hint"></p>
<div class="tablewrap"><table><thead><tr><th>Customer / ID</th><th>Mobile</th><th>Address</th><th>Online Orders</th><th>Offline Sales</th><th>Actions</th></tr></thead><tbody id="mxCustomerRows"></tbody></table></div>
<div id="mxCustomerDetails" class="card" style="display:none;margin-top:15px"></div>
</section>
<section id="orderdetail" class="panel">
<div class="head no-print"><h3>Online Order Details</h3><div class="actions"><button class="btn primary" id="orderPrintA4">🖨 Invoice A4</button><button class="btn primary" id="orderPrintA5">🖨 Invoice A5</button><button class="btn" id="backOrders">← Orders</button></div></div>
<div id="orderDetailBox" class="card"></div>
<div id="orderInvoicePrint" class="memo" style="margin-top:14px"></div>
</section>

<section id="pos" class="panel">
<div class="head"><h3>Offline Sale / POS</h3><span class="status">Shared Product Stock</span></div>
<div class="posgrid">
 <div>
  <div class="card">
   <div class="field"><label>Product Search</label><input id="posSearch" placeholder="Product name / code / category"></div>
   <div id="posProductList" class="pos-products"></div>
  </div>
  <div class="card" style="margin-top:14px">
   <h3>Customer Information</h3>
   <div class="formgrid">
    <div class="field"><label>Customer Name *</label><input id="posCustomerName" required placeholder="কাস্টমারের পূর্ণ নাম"></div>
    <div class="field"><label>Mobile *</label><input id="posCustomerMobile" type="tel" inputmode="numeric" maxlength="11" pattern="01[3-9][0-9]{8}" placeholder="01XXXXXXXXX" required><span class="phone-help">বাংলাদেশি ১১ সংখ্যার মোবাইল নম্বর দিন।</span></div>
    <div class="field"><label>WhatsApp</label><input id="posCustomerWhatsApp" type="tel" inputmode="numeric" maxlength="11" pattern="01[3-9][0-9]{8}" placeholder="01XXXXXXXXX"></div>
    <div class="field"><label>Customer ID</label><input id="posCustomerId" placeholder="Auto if blank"></div>
    <div class="field"><label>বিভাগ *</label><select id="posDivision" required><option value="">বিভাগ নির্বাচন করুন</option></select></div>
    <div class="field"><label>জেলা *</label><select id="posDistrict" required><option value="">জেলা নির্বাচন করুন</option></select></div>
    <div class="field"><label>উপজেলা / থানা *</label><select id="posUpazila" required><option value="">উপজেলা / থানা নির্বাচন করুন</option></select><input id="posUpazilaManual" type="text" hidden placeholder="আপনার উপজেলা / থানার নাম লিখুন" style="margin-top:7px"></div>
    <div class="field"><label>এলাকা / গ্রাম *</label><input id="posArea" required placeholder="এলাকা / গ্রামের নাম"></div>
    <div class="field full"><label>বাড়ি / রোড / সম্পূর্ণ ঠিকানা</label><textarea id="posCustomerAddress" placeholder="বাড়ি, রোড, বাজার বা প্রয়োজনীয় বিস্তারিত ঠিকানা"></textarea></div>
   </div>
  </div>
 </div>
 <div>
  <div class="card">
   <h3>Sale Cart</h3><div id="posCart"><p class="hint">Product থেকে Add to Cart করুন।</p></div>
   <div class="formgrid" style="margin-top:12px">
    <div class="field"><label>Overall Discount (৳)</label><input id="posDiscount" type="number" min="0" value="0"></div>
    <div class="field"><label>Delivery Charge (৳)</label><input id="posDelivery" type="number" min="0" value="0"></div>
    <div class="field"><label>Payment Method</label><select id="posPayment"><option>Cash</option><option>bKash</option><option>Nagad</option><option>Bank</option><option>Due</option></select></div>
    <div class="field"><label>Paid Amount (৳)</label><input id="posPaid" type="number" min="0" value="0"></div>
   </div>
   <div class="totals">
    <div class="totalrow"><span>Subtotal</span><b id="posSubtotal">৳0</b></div>
    <div class="totalrow"><span>Discount</span><b id="posDiscountShow">- ৳0</b></div>
    <div class="totalrow"><span>Delivery</span><b id="posDeliveryShow">+ ৳0</b></div>
    <div class="totalrow grand"><span>Grand Total</span><span id="posGrand">৳0</span></div>
    <div class="totalrow"><span>Due</span><b id="posDue">৳0</b></div>
   </div>
   <button class="btn primary" id="completeSale" style="width:100%;margin-top:12px">Complete Sale & Generate Cash Memo</button>
  </div>
 </div>
</div>
</section>

<section id="cashmemo" class="panel">
<div class="head no-print"><h3>Cash Memo / Invoice</h3><div class="actions"><button class="btn primary" id="printA4">🖨 Print A4</button><button class="btn primary" id="printA5">🖨 Print A5</button><button class="btn" id="backToPos">← POS</button></div></div>
<div id="memoPrint" class="memo"><p>Sale complete করলে Cash Memo এখানে তৈরি হবে।</p></div>
</section>
<section id="reviews" class="panel"><div class="head"><h3>Product Reviews</h3></div><div class="tablewrap"><table><thead><tr><th>Customer</th><th>Product</th><th>Rating</th><th>Comment</th><th>Action</th></tr></thead><tbody id="reviewRows"></tbody></table></div></section>
<section id="banners" class="panel"><div class="head"><h3>Homepage Banner Slider</h3></div><div class="card"><p>প্রতিটি স্লাইডের ছবি বদলান। কোনো ছবি না দিলে বর্তমান ডিজাইন অপরিবর্তিত থাকবে।</p><div id="bannerAdminRows"></div><p id="bannerSaveMessage" class="hint"></p></div></section>
<section id="settings" class="panel">
<div class="head"><h3>Website Settings & Security</h3></div>
<div class="card">
  <h3>Admin Account</h3>
  <p>Signed in: <b id="adminAccountEmail">—</b></p>
  <div class="field"><label>New Password</label><input id="newAdminPassword" type="password" minlength="8" placeholder="কমপক্ষে 8 অক্ষর"></div><br>
  <button type="button" class="btn primary" id="changeAdminPassword">Change Password</button>
  <p id="securityMsg"></p>
</div>
<div class="card" style="margin-top:14px"><p>Products, Categories, Orders ও Reviews Firebase দিয়ে নিয়ন্ত্রণ হবে। Customer account system আলাদা থাকবে এবং কোনো Customer account Admin access পাবে না।</p></div>
</section>
</main></div>
<script type="module">
import{initializeApp}from"https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import{getAuth,signInWithEmailAndPassword,onAuthStateChanged,signOut,sendPasswordResetEmail,updatePassword}from"https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import{getFirestore,collection,onSnapshot,addDoc,setDoc,doc,deleteDoc,updateDoc,serverTimestamp,getDoc,getDocs,runTransaction}from"https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
const firebaseConfig={
apiKey:"AIzaSyATKk9r50AZYrdbVxzPxn0h8WBI-ESNZGQ",
authDomain:"mehedi-xpress.firebaseapp.com",
projectId:"mehedi-xpress",
storageBucket:"mehedi-xpress.firebasestorage.app",
messagingSenderId:"750136252870",
appId:"1:750136252870:web:201f53d2dfeac82eb07ac7"
};
const ADMIN_UID="3Z0MLHObZOay8OFFnhreMvbg0e53";
const fb=initializeApp(firebaseConfig),auth=getAuth(fb),db=getFirestore(fb);let products=[],orders=[],reviews=[],categories=["ফুটবল জার্সি","ক্রিকেট জার্সি","কিডস জার্সি","টি-শার্ট ও পোলো","শর্টস ও ট্রাউজার","ফুটবল ও ক্রিকেট সামগ্রী","ব্যাডমিন্টন","কাস্টম প্রিন্ট","অন্যান্য"],existingImages=[];
const $=id=>document.getElementById(id),money=n=>"৳"+Number(n||0).toLocaleString("en-BD"),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
$("loginForm").onsubmit=async e=>{
 e.preventDefault();
 $("loginMsg").textContent="Login হচ্ছে...";
 try{
   const credential=await signInWithEmailAndPassword(auth,$("email").value.trim(),$("password").value);
   if(credential.user.uid!==ADMIN_UID){
     await signOut(auth);
     $("loginMsg").textContent="এই অ্যাকাউন্ট Admin হিসেবে অনুমোদিত নয়।";
     return;
   }
   $("loginMsg").textContent="";
 }catch(x){
   console.error("Firebase Admin Login Error:", x);
   const code=x?.code||"unknown-error";
   const message=x?.message||"No Firebase message";
   $("loginMsg").innerHTML="Login হয়নি।<br><b>Firebase Error:</b> "+
     String(code).replace(/</g,"&lt;").replace(/>/g,"&gt;")+
     "<br><small>"+String(message).replace(/</g,"&lt;").replace(/>/g,"&gt;")+"</small>";
 }
};

window.resetAdminPassword=async()=>{
 const email=$("email").value.trim()||"mehedixpress522@gmail.com";
 try{
   await sendPasswordResetEmail(auth,email);
   $("loginMsg").textContent="Password reset email পাঠানো হয়েছে। Inbox/Spam দেখুন।";
 }catch(e){
   $("loginMsg").textContent="Reset email পাঠানো যায়নি। Firebase Authentication-এ account আছে কি না দেখুন।";
 }
};

onAuthStateChanged(auth,async u=>{
 const allowed=!!u && u.uid===ADMIN_UID;
 $("login").style.display=allowed?"none":"grid";
 $("app").style.display=allowed?"grid":"none";
 if(u && !allowed){
   await signOut(auth);
   $("loginMsg").textContent="Unauthorized account. Admin access বন্ধ করা হয়েছে।";
   return;
 }
 if(allowed){
   document.body.classList.add("admin-authenticated");
   $("login").remove();
   const ae=$("adminAccountEmail"); if(ae) ae.textContent=u.email||"";
   start();
 }
});
$("logout").onclick=()=>signOut(auth);
$("changeAdminPassword").onclick=async()=>{
 const user=auth.currentUser,pass=$("newAdminPassword").value;
 if(!user||user.uid!==ADMIN_UID){$("securityMsg").textContent="Admin session পাওয়া যায়নি।";return}
 if(pass.length<8){$("securityMsg").textContent="Password কমপক্ষে 8 অক্ষরের দিন।";return}
 try{
   await updatePassword(user,pass);
   $("newAdminPassword").value="";
   $("securityMsg").textContent="Password সফলভাবে পরিবর্তন হয়েছে।";
 }catch(e){
   $("securityMsg").textContent="নিরাপত্তার কারণে আবার Login করে তারপর Password পরিবর্তন করুন।";
 }
};
document.querySelectorAll(".menu button[data-p]").forEach(b=>b.onclick=()=>{document.querySelectorAll(".menu button").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));$(b.dataset.p).classList.add("active");$("title").textContent=b.textContent.trim()});
let offlineSales=[],categoryRecords=[],mxCustomerDocs=[];
let started=false;function start(){if(started)return;started=true;
 onSnapshot(collection(db,"products"),s=>{products=s.docs.map(d=>({id:d.id,...d.data()}));renderProducts();stats()});
 onSnapshot(collection(db,"orders"),s=>{orders=s.docs.map(d=>({id:d.id,...d.data()}));$("orderLoadState").textContent=`${orders.length}টি Online Order লোড হয়েছে।`;renderOrders();stats();renderSalesReport();renderMxCustomers()},e=>{$("orderLoadState").textContent="Online Orders load হয়নি: "+(e.code||e.message);console.error("Online orders:",e)});
 onSnapshot(collection(db,"reviews"),s=>{reviews=s.docs.map(d=>({id:d.id,...d.data()}));renderReviews()});
 onSnapshot(collection(db,"categories"),s=>{categoryRecords=s.docs.map(d=>({id:d.id,...d.data()}));const x=categoryRecords.map(d=>d.name).filter(Boolean);if(x.length)categories=x;renderCats()},e=>console.warn("Categories:",e));
 onSnapshot(collection(db,"sales"),s=>{offlineSales=s.docs.map(d=>({id:d.id,...d.data()}));stats();renderSalesReport();renderMxCustomers()},e=>console.warn("Offline sales:",e));
 onSnapshot(collection(db,"customers"),s=>{mxCustomerDocs=s.docs.map(d=>({id:d.id,...d.data()}));renderMxCustomers()},e=>{console.warn("Customer directory:",e);renderMxCustomers()});
 loadBannerAdmin();
}
function stats(){
 $("sProducts").textContent=products.length;
 $("sOrders").textContent=orders.length+offlineSales.length;
 $("sPending").textContent=orders.filter(o=>(o.status||"Pending")==="Pending").length;
 const onlineCompleted=orders.filter(o=>o.status==="Completed" && o.paymentVerified===true).reduce((sum,o)=>sum+Number(o.total||0),0);
 const offlineCompleted=offlineSales.filter(o=>o.status!=="Cancelled").reduce((sum,o)=>sum+Number(o.total||0),0);
 $("sSales").textContent=money(onlineCompleted+offlineCompleted);
 $("recent").innerHTML=[...orders].sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)).slice(0,5).map(o=>`<tr><td><button class="btn" onclick="viewOrder('${o.id}')">${esc(orderCode(o))}</button></td><td>${esc(o.customerName||"—")}</td><td>${esc(orderItems(o).map(x=>x.name).join(", "))}</td><td>${money(o.total)}</td></tr>`).join("")||'<tr><td>কোনো Online Order নেই</td></tr>';
 const totalStock=products.reduce((sum,p)=>sum+Number(p.stock||0),0);
 const low=products.filter(p=>Number(p.stock||0)>0&&Number(p.stock||0)<=Number(p.lowStockAt??5));
 const out=products.filter(p=>Number(p.stock||0)<=0);
 $("sTotalStock").textContent=totalStock;$("sLowStock").textContent=low.length;$("sOutStock").textContent=out.length;
 $("sStockValue").textContent=money(products.reduce((sum,p)=>sum+Number(p.stock||0)*Number(p.costPrice||0),0));
 const alerts=[...out,...low].sort((a,b)=>Number(a.stock||0)-Number(b.stock||0));
 $("stockAlerts").innerHTML=alerts.length?alerts.map(p=>`<div style="display:flex;justify-content:space-between;gap:10px;padding:9px;border-bottom:1px solid #edf0f5"><span><b>${esc(p.name)}</b><br><small>${esc(p.code||"")}</small></span><span><b>${Number(p.stock||0)} pcs</b> • ${Number(p.stock||0)<=0?"Out of Stock":"Low Stock"} <button class="btn" onclick="editProduct('${p.id}')">Add Stock</button></span></div>`).join(""):"কোনো Low Stock alert নেই।";
 renderInventory();
}
function renderInventory(){
 const el=$("inventoryRows");if(!el)return;
 const filter=$("inventoryFilter")?.value||"all",q=($("inventorySearch")?.value||"").toLowerCase();
 const list=products.filter(p=>{const s=Number(p.stock||0),l=Number(p.lowStockAt??5);return(filter==="all"||(filter==="low"&&s>0&&s<=l)||(filter==="out"&&s<=0))&&(!q||[p.name,p.code,p.category].join(" ").toLowerCase().includes(q))});
 el.innerHTML=list.map(p=>{const s=Number(p.stock||0),l=Number(p.lowStockAt??5),cv=s*Number(p.costPrice||0);const st=s<=0?"Out of Stock":s<=l?"Low Stock":"In Stock";return `<tr><td><b>${esc(p.name)}</b></td><td>${esc(p.code||"—")}</td><td>${esc(p.category||"—")}</td><td>${s}</td><td>${l}</td><td>${money(cv)}</td><td>${st}</td><td><button class="btn" onclick="editProduct('${p.id}')">Edit / Add Stock</button></td></tr>`}).join("")||'<tr><td colspan="8">এই Filter-এ কোনো পণ্য নেই।</td></tr>';
}
$("inventoryFilter").onchange=renderInventory;$("inventorySearch").oninput=renderInventory;
function goAdminPanel(panel){document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));$(panel).classList.add("active");document.querySelectorAll(".menu button[data-p]").forEach(x=>x.classList.toggle("active",x.dataset.p===panel));$("title").textContent=document.querySelector(`.menu button[data-p="${panel}"]`)?.textContent.trim()||panel;window.scrollTo({top:0,behavior:"smooth"})}
document.querySelectorAll("[data-stat-route]").forEach(b=>b.onclick=()=>{const r=b.dataset.statRoute;if(["low","out","inventory"].includes(r)){$("inventoryFilter").value=r==="inventory"?"all":r;goAdminPanel("inventory");renderInventory()}else if(r==="pending"){$("orderSourceFilter").value="online";$("orderStatusFilter").value="Pending";goAdminPanel("orders");renderOrders()}else if(r==="orders"){$("orderSourceFilter").value="online";$("orderStatusFilter").value="";goAdminPanel("orders");renderOrders()}else if(r==="sales"){goAdminPanel("sales");renderSalesReport()}else goAdminPanel(r)});
function renderCats(){
 $("pCategory").innerHTML=categories.map(c=>`<option>${esc(c)}</option>`).join("");
 $("catChips").innerHTML=categories.map(c=>{const record=categoryRecords.find(x=>x.name===c);return `<div class="mx-settings-row">${record?.image?`<img class="mx-thumb" src="${esc(record.image)}">`:""}<b>${esc(c)}</b><button class="btn" type="button" data-cat-image="${esc(c)}">Edit Image</button><button class="btn danger" type="button" data-cat-delete="${esc(c)}">Delete</button></div>`}).join("");
 $("catChips").querySelectorAll("[data-cat-image]").forEach(b=>b.onclick=()=>editCategoryImage(b.dataset.catImage));
 $("catChips").querySelectorAll("[data-cat-delete]").forEach(b=>b.onclick=()=>window.deleteCategory(b.dataset.catDelete));
}
$("catForm").onsubmit=async e=>{e.preventDefault();const n=$("catName").value.trim();if(!n)return;try{const file=$("catImage").files[0],image=file?await compressAdminImage(file,640):"";await setDoc(doc(db,"categories",encodeURIComponent(n)),{name:n,...(image?{image}:{}),updatedAt:serverTimestamp()},{merge:true});$("catName").value="";$("catImage").value=""}catch(err){alert("Category save হয়নি: "+err.message)}};
async function editCategoryImage(n){const picker=document.createElement("input");picker.type="file";picker.accept="image/jpeg,image/png,image/webp";picker.onchange=async()=>{if(!picker.files[0])return;try{const image=await compressAdminImage(picker.files[0],640);await setDoc(doc(db,"categories",encodeURIComponent(n)),{name:n,image,updatedAt:serverTimestamp()},{merge:true});alert("Category image saved") }catch(e){alert("Image save হয়নি: "+e.message)}};picker.click()}
window.deleteCategory=async n=>{if(confirm("Category মুছবেন?"))await deleteDoc(doc(db,"categories",encodeURIComponent(n)))};
function compressAdminImage(file,max=900){return new Promise((resolve,reject)=>{if(!file.type.startsWith("image/"))return reject(new Error("Image file দিন"));const fr=new FileReader();fr.onerror=reject;fr.onload=()=>{const im=new Image();im.onerror=reject;im.onload=()=>{const scale=Math.min(1,max/Math.max(im.width,im.height));const c=document.createElement("canvas");c.width=Math.round(im.width*scale);c.height=Math.round(im.height*scale);c.getContext("2d").drawImage(im,0,0,c.width,c.height);const data=c.toDataURL("image/jpeg",.7);if(data.length>850000)return reject(new Error("Image অনেক বড়; ছোট ছবি দিন"));resolve(data)};im.src=fr.result};fr.readAsDataURL(file)})}
async function loadBannerAdmin(){try{const snap=await getDoc(doc(db,"siteSettings","homepage"));const data=snap.exists()?snap.data():{};$("bannerAdminRows").innerHTML=[0,1,2,3].map(n=>`<div class="mx-settings-row"><b>Slide ${n+1}</b>${data.banners?.[n]?`<img class="mx-thumb" src="${esc(data.banners[n])}">`:"<small>Default banner</small>"}<input type="file" accept="image/jpeg,image/png,image/webp" data-banner-file="${n}"><button type="button" class="btn primary" data-banner-save="${n}">Save Slide</button></div>`).join("");$("bannerAdminRows").querySelectorAll("[data-banner-save]").forEach(b=>b.onclick=async()=>{const n=Number(b.dataset.bannerSave),file=$("bannerAdminRows").querySelector(`[data-banner-file="${n}"]`).files[0];if(!file)return alert("ছবি নির্বাচন করুন");b.disabled=true;try{const image=await compressAdminImage(file,1200);const latest=await getDoc(doc(db,"siteSettings","homepage"));const banners=[...(latest.data()?.banners||[])];banners[n]=image;await setDoc(doc(db,"siteSettings","homepage"),{banners,updatedAt:serverTimestamp()},{merge:true});$("bannerSaveMessage").textContent=`Slide ${n+1} saved`;loadBannerAdmin()}catch(e){alert("Banner save হয়নি: "+e.message)}finally{b.disabled=false}})}catch(e){$("bannerSaveMessage").textContent="Banner settings load হয়নি: "+(e.code||e.message)}}
function imageUrl(x){return typeof x==="string"?x:(x?.url||"")}
function renderProducts(){
 $("productRows").innerHTML=products.map(p=>{const img=imageUrl((p.images||[])[0]);const reg=Number(p.regularPrice??p.price??0),off=p.offerPrice===null||p.offerPrice===undefined?null:Number(p.offerPrice);
 return `<tr><td>${img?`<img class="pimg" src="${esc(img)}" onerror="this.style.display='none'">`:"—"}</td><td><b>${esc(p.name)}</b><br><small>${esc(p.details||"").slice(0,70)}</small></td><td>${esc(p.code||"—")}</td><td>${esc(p.category)}</td><td>${off!==null&&off<reg?`<span class="offer-price">${money(off)}</span><span class="old-price">${money(reg)}</span>`:money(off??reg)}</td><td>${Number(p.stock||0)}</td><td><span class="status ${p.active===false?"badge-disabled":"badge-active"}">${p.active===false?"Disabled":"Active"}</span></td><td class="actions"><button class="btn" onclick="editProduct('${p.id}')">Edit</button><button class="btn danger" onclick="removeProduct('${p.id}')">Delete</button></td></tr>`}).join("");
 renderInventory();
}

let selectedOrder=null;
function orderCode(o){return o.orderCode||o.orderId||("MXO-"+o.id.slice(0,8).toUpperCase())}
function orderPhone(o){return o.phone||o.mobile||o.customerMobile||o.customerPhone||""}
function orderAddress(o){
 const parts=[o.addressDetail||o.address||o.customerAddress,o.area,o.upazila,o.district,o.division].map(x=>String(x||"").trim()).filter(Boolean);
 const result=[];for(const part of parts){if(!result.some(x=>x===part||x.includes(part)))result.push(part)}
 return result.join(", ");
}
function orderItems(o){
 if(Array.isArray(o.items)&&o.items.length)return o.items.map(x=>({
   productId:x.productId||x.id||"",name:x.name||x.productName||x.product||"Product",code:x.code||x.sku||"",
   variantSku:x.variantSku||x.sku||"",size:x.size||"",color:x.color||"",qty:Number(x.qty||x.quantity||1),
   price:Number(x.price||x.unitPrice||0),lineTotal:Number(x.lineTotal??(Number(x.qty||x.quantity||1)*Number(x.price||x.unitPrice||0)))
 }));
 return [{productId:o.productId||"",name:o.product||o.productName||"Product",code:o.code||"",variantSku:o.variantSku||"",size:o.size||"",color:o.color||"",qty:Number(o.qty||o.quantity||1),price:Number(o.price||o.total||0),lineTotal:Number(o.total||0)}];
}
function orderPayment(o){return o.paymentMethod||o.payment||"Cash on Delivery"}
function statusClass(st){return st==="Delivered"?"badge-active":(st==="Cancelled"||st==="Returned")?"badge-disabled":""}
function renderOrders(){
 const box=$("orderRows");if(!box)return;
 const q=($("orderSearch")?.value||"").trim().toLowerCase(),sf=$("orderStatusFilter")?.value||"";
 const list=[...orders].sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)).filter(o=>{
   const txt=[orderCode(o),o.id,o.customerId,o.customerName,orderPhone(o),o.trackingId,o.paymentTransactionId].join(" ").toLowerCase();
   return(!q||txt.includes(q))&&(!sf||(o.status||"Pending")===sf);
 });
 box.innerHTML=list.length?list.map(o=>{const its=orderItems(o),st=o.status||"Pending";return `<tr>
 <td><b>${esc(orderCode(o))}</b><br><small>${o.createdAt?.toDate?o.createdAt.toDate().toLocaleString("en-BD"):""}</small></td>
 <td><b>${esc(o.customerName||"—")}</b><br><small>${esc(orderPhone(o))}</small></td>
 <td>${its.length} item(s)<br><small>${esc(its.map(x=>x.name).join(", ").slice(0,70))}</small></td>
 <td>${money(o.total||its.reduce((a,x)=>a+x.lineTotal,0))}</td><td>${esc(orderPayment(o))}</td>
 <td><span class="status ${statusClass(st)}">${esc(st)}</span></td>
 <td class="actions"><button class="btn" onclick="viewOrder('${o.id}')">View / Manage</button></td></tr>`}).join(""):'<tr><td colspan="7">কোনো Order পাওয়া যায়নি।</td></tr>';
}

function renderSalesReport(){
 const box=$("salesRows");if(!box)return;
 const src=$("salesSource").value,st=$("salesStatus").value;
 const online=orders.map(o=>({...o,_source:"online",_code:orderCode(o),_status:o.status||"Pending"}));
 const offline=offlineSales.map(o=>({...o,_source:"offline",_code:o.saleId||o.id,_status:o.status||"Completed"}));
 const list=[...online,...offline].filter(o=>(src==="all"||o._source===src)&&(st==="all"||o._status===st)).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
 $("salesSummary").textContent=`${list.length}টি রেকর্ড • মোট ${money(list.reduce((sum,o)=>sum+Number(o.total||0),0))} (নির্বাচিত ফিল্টার)`;
 box.innerHTML=list.map(o=>{const items=o._source==="online"?orderItems(o):o.items||[];return `<tr><td><b>${o._source==="online"?"🌐 Online":"🏪 Offline"}</b><br>${esc(o._code)}</td><td>${esc(o.customerName||o.name||"—")}</td><td>${esc(items.map(x=>x.name).join(", ").slice(0,100))}</td><td>${money(o.total)}</td><td>${esc(o._status)}</td><td>${o._source==="online"?`<button class="btn primary" onclick="viewOrder('${o.id}')">View / Manage</button>`:`<button class="btn" onclick="viewOfflineSale('${o.id}')">View Details</button>`}</td></tr>`}).join("")||'<tr><td colspan="6">কোনো বিক্রয় পাওয়া যায়নি।</td></tr>';
}
window.viewOfflineSale=id=>{const o=offlineSales.find(x=>x.id===id);if(!o)return;const lines=(o.items||[]).map(x=>`${x.name} × ${x.qty}`).join("\n");alert(`Offline Sale: ${o.saleId||id}\nCustomer: ${o.customerName||"—"}\nMobile: ${o.customerMobile||"—"}\nProducts:\n${lines}\nTotal: ${money(o.total)}\nStatus: ${o.status||"Completed"}`)};

$("orderSearch").oninput=renderOrders;$("orderStatusFilter").onchange=renderOrders;
$("orderSourceFilter").onchange=()=>{if($("orderSourceFilter").value==="offline"){goAdminPanel("sales");$("salesSource").value="offline";renderSalesReport()}else renderOrders()};
$("salesSource").onchange=renderSalesReport;$("salesStatus").onchange=renderSalesReport;

window.viewOrder=id=>{selectedOrder=orders.find(x=>x.id===id);if(!selectedOrder)return;renderOrderDetail(selectedOrder);document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));$("orderdetail").classList.add("active");$("title").textContent="Online Order Details"};
$("backOrders").onclick=()=>{document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));$("orders").classList.add("active");document.querySelectorAll("[data-p]").forEach(x=>x.classList.toggle("active",x.dataset.p==="orders"));$("title").textContent="🛒 Orders"};

function renderOrderDetail(o){
 const its=orderItems(o),st=o.status||"Pending",total=Number(o.total||its.reduce((a,x)=>a+x.lineTotal,0));
 $("orderDetailBox").innerHTML=`<div class="formgrid">
 <div><b>Order ID:</b> ${esc(orderCode(o))}</div><div><b>Status:</b> ${esc(st)}</div>
 <div><b>Customer:</b> ${esc(o.customerName||"—")}</div><div><b>Mobile:</b> ${esc(orderPhone(o)||"—")}</div>
 <div class="full"><b>Address:</b> ${esc(orderAddress(o)||"—")}</div><div><b>Payment:</b> ${esc(orderPayment(o))}</div><div><b>Total:</b> ${money(total)}</div>
 </div><div class="head"><h3>Customer Details / Edit</h3></div>
 <div class="formgrid" style="padding:12px;background:#f6f9fe;border-radius:12px">
 <div class="field"><label>Customer Name</label><input id="orderCustomerName" value="${esc(o.customerName||'')}"></div>
 <div class="field"><label>Mobile Number</label><input id="orderCustomerPhone" value="${esc(orderPhone(o))}"></div>
 <div class="field"><label>Division</label><input id="orderDivision" value="${esc(o.division||'')}"></div>
 <div class="field"><label>District</label><input id="orderDistrict" value="${esc(o.district||'')}"></div>
 <div class="field"><label>Upazila / Thana</label><input id="orderUpazila" value="${esc(o.upazila||'')}"></div>
 <div class="field"><label>Area / Village</label><input id="orderArea" value="${esc(o.area||'')}"></div>
 <div class="field full"><label>House / Road / Detailed Address</label><input id="orderAddressEdit" value="${esc(o.addressDetail||o.address||'')}"></div>
 <div class="field full"><label>Customer Note / Special Instructions</label><textarea id="orderCustomerNote" rows="3">${esc(o.customerNote||o.orderNote||o.note||'')}</textarea></div>
 <div class="full"><button class="btn primary" onclick="saveOrderCustomer('${o.id}')">Save Customer Details & Note</button></div>
 </div><div class="head"><h3>Courier & Payment Verification</h3></div>
 <div class="formgrid" style="padding:12px;background:#f6f9fe;border-radius:12px">
 <div class="field"><label>Courier / Delivery Company</label><select id="orderCourier">${["","Steadfast","Pathao","Other"].map(x=>`<option value="${x}" ${x===(o.courierName||"")?"selected":""}>${x||"Select courier"}</option>`).join("")}${o.courierName&&!['Steadfast','Pathao','Other'].includes(o.courierName)?`<option selected value="${esc(o.courierName)}">${esc(o.courierName)}</option>`:""}</select></div>
 <div class="field"><label>Courier Tracking / Consignment ID</label><input id="orderTracking" value="${esc(o.trackingId||'')}" placeholder="Courier ID"></div>
 <div class="field"><label>Payment Method</label><select id="orderPayMethod">${["Cash","bKash","Nagad","Bank","COD","Other"].map(x=>`<option value="${x}" ${x===(o.verifiedPaymentMethod||"COD")?"selected":""}>${x}</option>`).join("")}</select></div>
 <div class="field"><label>Payment Transaction ID / Reference</label><input id="orderTxn" value="${esc(o.paymentTransactionId||'')}" placeholder="Transaction / settlement reference"></div>
 <div class="field"><label>Verified Amount Received (৳)</label><input type="number" id="orderReceived" min="0" step="0.01" value="${Number(o.verifiedAmount||0)}"></div>
 <div class="field"><label>Remaining Due (৳)</label><input id="orderDuePreview" readonly value="${Math.max(0,total-Number(o.verifiedAmount||0)).toFixed(2)}"></div><div class="field"><label>Payment Check</label><select id="orderPaymentVerified"><option value="no" ${o.paymentVerified!==true?"selected":""}>Not Verified</option><option value="yes" ${o.paymentVerified===true?"selected":""}>Verified by Admin</option></select></div>
 <div class="full"><p class="hint">Partial payment can be verified. Completed requires full verified payment.</p></div>
 <div class="full"><button class="btn primary" onclick="saveOrderSettlement('${o.id}')">Save Delivery & Payment Details</button><p class="hint">Only mark Verified after checking your actual payment account / courier settlement. No automatic gateway verification is connected.</p></div>
 </div><div class="head"><h3>Change Status</h3></div><div class="actions">
 ${["Pending","Confirmed","Processing","Shipped","Delivered","Completed","Cancelled","Returned"].map(x=>`<button class="btn ${x===st?"primary":""}" onclick="changeOrderStatus('${o.id}','${x}')">${x}</button>`).join("")}
 </div><p class="hint">Confirmed করলে stock একবার deduct হবে। Cancelled/Returned করলে আগে deduct হওয়া stock একবার restore হবে।</p>`;
 renderOnlineInvoice(o);
 const amountInput=$("orderReceived");if(amountInput)amountInput.oninput=()=>{$("orderDuePreview").value=Math.max(0,total-Number(amountInput.value||0)).toFixed(2)};
}
async function changeStockForOrder(tx,o,direction){
 const lines=orderItems(o),refs=new Map();
 for(const line of lines){
  const found=line.productId?products.find(x=>x.id===line.productId):products.find(x=>(line.code&&x.code===line.code)||x.name===line.name);
  if(!found)throw new Error("Product পাওয়া যায়নি: "+line.name);
  refs.set(found.id,doc(db,"products",found.id));line._resolvedProductId=found.id;
 }
 // Every transaction read must finish before the first write.
 const snapshots=new Map();
 for(const [id,ref] of refs){const snap=await tx.get(ref);if(!snap.exists())throw new Error("Product পাওয়া যায়নি: "+id);snapshots.set(id,snap.data())}
 const changes=new Map();
 for(const line of lines){
  const id=line._resolvedProductId,p=snapshots.get(id);
  let vs=changes.get(id);if(!vs){vs=(p.variants&&p.variants.length?p.variants:[{sku:p.code||"",size:"",color:"",stock:Number(p.stock||0)}]).map(v=>({...v}));changes.set(id,vs)}
  let idx=vs.findIndex(v=>(!line.variantSku||(v.sku||"")===line.variantSku)&&(!line.size||(v.size||"")===line.size)&&(!line.color||(v.color||"")===line.color));if(idx<0)idx=0;
  const next=Number(vs[idx].stock||0)+direction*line.qty;
  if(next<0)throw new Error(`${line.name} এর stock পর্যাপ্ত নেই।`);
  vs[idx].stock=next;
 }
 for(const [id,vs] of changes)tx.update(refs.get(id),{variants:vs,stock:vs.reduce((sum,v)=>sum+Number(v.stock||0),0),updatedAt:serverTimestamp()});
}
window.saveOrderCustomer=async(id)=>{
 const o=orders.find(x=>x.id===id);if(!o)return;
 const customerName=$("orderCustomerName").value.trim(),phone=$("orderCustomerPhone").value.trim(),division=$("orderDivision").value.trim(),district=$("orderDistrict").value.trim(),upazila=$("orderUpazila").value.trim(),area=$("orderArea").value.trim(),addressDetail=$("orderAddressEdit").value.trim(),customerNote=$("orderCustomerNote").value.trim();
 if(!customerName||!phone){alert("Customer name and mobile are required.");return}
 const fullAddress=[addressDetail,area,upazila,district,division].filter(Boolean).join(", ");
 try{await updateDoc(doc(db,"orders",id),{customerName,phone,division,district,upazila,area,addressDetail,address:fullAddress,customerNote,updatedAt:serverTimestamp()});
 selectedOrder={...o,customerName,phone,division,district,upazila,area,addressDetail,address:fullAddress,customerNote};renderOrderDetail(selectedOrder);alert("Customer details saved.")}
 catch(e){alert("Save failed: "+(e.message||e.code))}
};
window.saveOrderSettlement=async(id)=>{
 const o=orders.find(x=>x.id===id);if(!o)return;
 const courierName=$("orderCourier").value.trim(),trackingId=$("orderTracking").value.trim(),verifiedPaymentMethod=$("orderPayMethod").value,paymentTransactionId=$("orderTxn").value.trim();
 const verifiedAmount=Number($("orderReceived").value),paymentVerified=$("orderPaymentVerified").value==="yes";
 if(!Number.isFinite(verifiedAmount)||verifiedAmount<0){alert("সঠিক Payment Amount দিন।");return}
 if(verifiedAmount>Number(o.total||0)+0.001){alert("Received Amount মোট টাকার বেশি হতে পারে না।");return}
 if(paymentVerified&&!confirm("ব্যাংক/বিকাশ/নগদ/কুরিয়ার থেকে টাকা বাস্তবে পেয়েছেন ও যাচাই করেছেন?"))return;
 try{
  await updateDoc(doc(db,"orders",id),{courierName,trackingId,verifiedPaymentMethod,paymentTransactionId,verifiedAmount,paymentVerified,amountDue:Math.max(0,Number(o.total||0)-verifiedAmount),paymentVerifiedAt:paymentVerified?serverTimestamp():null,updatedAt:serverTimestamp()});
  selectedOrder={...o,courierName,trackingId,verifiedPaymentMethod,paymentTransactionId,verifiedAmount,paymentVerified,amountDue:Math.max(0,Number(o.total||0)-verifiedAmount)};renderOrderDetail(selectedOrder);alert("Delivery / Payment details saved.");
 }catch(e){alert("Save failed: "+(e.message||e.code))}
};
window.changeOrderStatus=async(id,newStatus)=>{
 const o=orders.find(x=>x.id===id);if(!o)return;
 const old=o.status||"Pending";if(old===newStatus){alert("এই অর্ডার ইতিমধ্যে " + newStatus + " অবস্থায় আছে।");return;}
 if(newStatus==="Completed"){
  if(o.paymentVerified!==true||Number(o.verifiedAmount||0)+0.001<Number(o.total||0)){alert("Completed করার আগে সম্পূর্ণ টাকা Received ও Verified করে Save করুন।");return}
  if(!o.trackingId?.trim()){alert("Completed করার আগে Courier Tracking ID Save করুন।");return}
  if(old!=="Delivered"){alert("আগে Delivered status দিন, তারপর Completed করুন।");return}
 }
 if(old==="Completed" && ["Cancelled","Returned"].includes(newStatus)){alert("Completed order ফেরত এলে আলাদা refund/return ledger প্রয়োজন। আপাতত সরাসরি status বদলানো বন্ধ রাখা হয়েছে।");return}
 if(!confirm(`${orderCode(o)}: ${old} → ${newStatus} করবেন?`))return;
 try{
  const ref=doc(db,"orders",id);
  await runTransaction(db,async tx=>{
    const snap=await tx.get(ref);if(!snap.exists())throw new Error("Order পাওয়া যায়নি।");
    const live={id:snap.id,...snap.data()},deducted=live.stockDeducted===true,restored=live.stockRestored===true;
    if(newStatus==="Completed" && (live.status!=="Delivered"||live.paymentVerified!==true||Number(live.verifiedAmount||0)+0.001<Number(live.total||0)||!live.trackingId?.trim()))throw new Error("Delivery/Payment verification incomplete");
    if(live.status==="Completed" && ["Cancelled","Returned"].includes(newStatus))throw new Error("Completed sale requires separate return/refund workflow");
    let patch={status:newStatus,updatedAt:serverTimestamp()};
    if(newStatus==="Confirmed"&&!deducted){await changeStockForOrder(tx,live,-1);patch.stockDeducted=true;patch.stockRestored=false;patch.stockDeductedAt=serverTimestamp()}
    if((newStatus==="Cancelled"||newStatus==="Returned")&&deducted&&!restored){await changeStockForOrder(tx,live,1);patch.stockRestored=true;patch.stockRestoredAt=serverTimestamp()}
    tx.update(ref,patch);
  });
  // Stock movement log is optional: do not report a committed order as failed if log permissions are missing.
  try { await addDoc(collection(db,"stockMovements"),{orderId:id,orderCode:orderCode(o),reason:"Online Order: "+old+" → "+newStatus,createdAt:serverTimestamp()}); } catch(logError) { console.warn("Optional stock movement log failed:", logError); }
  selectedOrder={...o,status:newStatus};renderOrderDetail(selectedOrder);
  alert("অর্ডারের Status সফলভাবে " + newStatus + " করা হয়েছে।");
 }catch(e){console.error("Order status transaction failed:",e);alert("Status change হয়নি: "+(e.message||e.code||"Unknown error")+"\n\nProducts-এর Stock, Firebase permissions এবং Console পরীক্ষা করুন।") }
};
function renderOnlineInvoice(o){
 const its=orderItems(o),sub=Number(o.subtotal??its.reduce((a,x)=>a+x.lineTotal,0)),dis=Number(o.discount||0),del=Number(o.deliveryCharge||o.delivery||0),total=Number(o.total||Math.max(0,sub-dis+del));
 const rows=its.map((x,i)=>`<tr><td>${i+1}</td><td><b>${esc(x.name)}</b><br><small>${esc([x.size,x.color,x.variantSku].filter(Boolean).join(" / "))}</small></td><td>${x.qty}</td><td>${money(x.price)}</td><td>${money(x.lineTotal)}</td></tr>`).join("");
 $("orderInvoicePrint").innerHTML=`<div class="memo-head"><img class="memo-logo" src="assets/images/logo.png"><div class="memo-brand"><h1>MEHEDI XPRESS</h1><p><b>Sports • Fashion • Custom Print</b></p><p>খেলাধুলার সামগ্রী, ফ্যাশন ও কাস্টম প্রিন্টিং সেবা</p><p>দক্ষিণ বাঙ্গরা বাজার বাসস্ট্যান্ডের উত্তর পাশে, বাঙ্গরা বাজার থানা, মুরাদনগর, কুমিল্লা</p><p>Contact / WhatsApp: +8801612961523</p></div><div class="memo-meta"><b>ONLINE INVOICE</b><br>Order ID: ${esc(orderCode(o))}<br>Status: ${esc(o.status||"Pending")}<br>Payment: ${esc(orderPayment(o))}<br>Courier: ${esc(o.courierName||"—")}<br>Tracking: ${esc(o.trackingId||"—")}<br>Verified Received: ${money(o.paymentVerified?o.verifiedAmount:0)}<br>Due: ${money(Math.max(0,total-Number(o.paymentVerified?o.verifiedAmount:0)))}</div></div>
 <div class="memo-customer"><div><b>Customer:</b> ${esc(o.customerName||"—")}</div><div><b>Mobile:</b> ${esc(orderPhone(o)||"—")}</div><div style="grid-column:1/-1"><b>Address:</b> ${esc(orderAddress(o)||"—")}</div><div style="grid-column:1/-1"><b>Customer Note:</b> ${esc(o.customerNote||o.orderNote||o.note||"—")}</div></div>
 <table><thead><tr><th>#</th><th>Product / Variant</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table>
 <div class="memo-summary"><div class="totalrow"><span>Subtotal</span><b>${money(sub)}</b></div><div class="totalrow"><span>Discount</span><b>- ${money(dis)}</b></div><div class="totalrow"><span>Delivery</span><b>+ ${money(del)}</b></div><div class="totalrow grand"><span>Grand Total</span><span>${money(total)}</span></div><div class="totalrow"><span>Verified Paid</span><b>${money(o.paymentVerified?o.verifiedAmount:0)}</b></div><div class="totalrow"><span>Due</span><b>${money(Math.max(0,total-Number(o.paymentVerified?o.verifiedAmount:0)))}</b></div></div>
 <div class="memo-foot"><div>____________________<br>Customer Signature</div><div>____________________<br>Authorized Signature<br>Mehedi Xpress</div></div><div class="memo-note">আপনার অর্ডারের জন্য ধন্যবাদ। • Cash on Delivery nationwide</div>`;
}
function printOrderInvoice(size){
 document.body.classList.remove("print-a4","print-a5");document.body.classList.add(size==="A5"?"print-a5":"print-a4");
 let style=document.getElementById("dynamicPrintPage");if(!style){style=document.createElement("style");style.id="dynamicPrintPage";document.head.appendChild(style)}
 style.textContent=size==="A5"?"@page { size: A5 portrait; margin: 8mm; }":"@page { size: A4 portrait; margin: 8mm; }";setTimeout(()=>window.print(),80);
}
$("orderPrintA4").onclick=()=>printOrderInvoice("A4");$("orderPrintA5").onclick=()=>printOrderInvoice("A5");


function renderReviews(){$("reviewRows").innerHTML=reviews.map(r=>`<tr><td>${esc(r.name)}</td><td>${esc(products.find(p=>p.id===r.productId)?.name||r.productId)}</td><td>${"★".repeat(Number(r.rating||0))}</td><td>${esc(r.comment)}</td><td><button class="btn danger" onclick="removeReview('${r.id}')">Delete</button></td></tr>`).join("")}
window.removeReview=id=>confirm("Review মুছবেন?")&&deleteDoc(doc(db,"reviews",id));

function addVariantRow(v={}){
 const tr=document.createElement("tr");
 tr.innerHTML=`<td><input class="vSku" value="${esc(v.sku||"")}" placeholder="SKU"></td><td><input class="vSize" value="${esc(v.size||"")}" placeholder="M/L/XL"></td><td><input class="vColor" value="${esc(v.color||"")}" placeholder="Color"></td><td><input class="vStock" type="number" min="0" value="${Number(v.stock||0)}"></td><td><button type="button" class="btn danger vRemove">×</button></td>`;
 tr.querySelector(".vRemove").onclick=()=>{tr.remove();updateVariantTotal()};
 tr.querySelector(".vStock").oninput=updateVariantTotal;
 $("variantRows").appendChild(tr); updateVariantTotal();
}
function getVariants(){
 return [...$("variantRows").querySelectorAll("tr")].map(tr=>({
  sku:tr.querySelector(".vSku").value.trim(),
  size:tr.querySelector(".vSize").value.trim(),
  color:tr.querySelector(".vColor").value.trim(),
  stock:Math.max(0,Number(tr.querySelector(".vStock").value||0))
 }));
}
function updateVariantTotal(){const n=getVariants().reduce((a,v)=>a+v.stock,0);$("variantTotal").textContent=n;updatePriceCalc()}
$("addVariant").onclick=()=>addVariantRow();

function updatePriceCalc(){
 const cost=Number($("pCostPrice")?.value||0),reg=Number($("pRegularPrice")?.value||0);
 const raw=$("pOfferPrice")?.value, sell=raw!==""?Number(raw||0):reg;
 const disc=reg>0&&sell<reg?((reg-sell)/reg*100):0, profit=sell-cost, markup=cost>0?(profit/cost*100):0;
 const box=$("priceCalc"); if(box) box.textContent=`Discount: ${disc.toFixed(1)}% • Profit/Piece: ${money(profit)} • Markup: ${markup.toFixed(1)}%`;
}
["pCostPrice","pRegularPrice","pOfferPrice"].forEach(id=>{const e=$(id);if(e)e.addEventListener("input",updatePriceCalc)});

function resetProductForm(){
 $("productForm").reset();$("editId").value="";existingImages=[];$("preview").innerHTML="";$("variantRows").innerHTML="";
 $("pCostPrice").value="0";$("pLowStockAt").value="5";$("pStatus").value="active";addVariantRow({stock:0});updatePriceCalc();
}
$("newProduct").onclick=()=>{resetProductForm();$("productEditor").style.display="block";$("productEditor").scrollIntoView({behavior:"smooth",block:"start"})};
$("cancelProduct").onclick=()=>{$("productEditor").style.display="none";resetProductForm()};

function renderPreview(){
 $("preview").innerHTML=existingImages.map((x,i)=>`<div style="position:relative"><img src="${esc(imageUrl(x))}"><button type="button" data-i="${i}" style="position:absolute;right:2px;top:2px;border:0;border-radius:50%;cursor:pointer">×</button></div>`).join("");
 $("preview").querySelectorAll("button[data-i]").forEach(b=>b.onclick=()=>{existingImages.splice(Number(b.dataset.i),1);renderPreview()});
}
async function fileToCompressedDataURL(file){
 return new Promise((resolve,reject)=>{
  const reader=new FileReader();
  reader.onerror=reject;
  reader.onload=()=>{const im=new Image();im.onerror=reject;im.onload=()=>{
   const max=900,scale=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement("canvas");
   c.width=Math.round(im.width*scale);c.height=Math.round(im.height*scale);
   c.getContext("2d").drawImage(im,0,0,c.width,c.height);
   resolve(c.toDataURL("image/jpeg",.72));
  };im.src=reader.result};reader.readAsDataURL(file);
 });
}
$("pImages").onchange=async e=>{
 const files=[...e.target.files].slice(0,Math.max(0,5-existingImages.length));
 for(const f of files){if(f.size>8*1024*1024){alert(f.name+" অনেক বড়। 8MB-এর কম ছবি দিন।");continue}try{existingImages.push(await fileToCompressedDataURL(f))}catch(_){alert("ছবি পড়া যায়নি: "+f.name)}}
 renderPreview();e.target.value="";
};

window.editProduct=id=>{
 const p=products.find(x=>x.id===id);if(!p)return;
 $("editId").value=p.id;$("pName").value=p.name||"";$("pCode").value=p.code||p.sku||"";$("pCategory").value=p.category||categories[0]||"";
 $("pCostPrice").value=Number(p.costPrice||0);$("pRegularPrice").value=Number(p.regularPrice??p.price??0);
 $("pOfferPrice").value=(p.offerPrice===null||p.offerPrice===undefined)?"":Number(p.offerPrice);
 $("pLowStockAt").value=Number(p.lowStockAt??5);$("pStatus").value=p.active===false?"disabled":"active";$("pDetails").value=p.details||p.description||"";
 existingImages=(p.images||[]).map(imageUrl).filter(Boolean).slice(0,5);renderPreview();$("variantRows").innerHTML="";
 const vs=(p.variants&&p.variants.length)?p.variants:[{sku:p.code||"",size:"",color:"",stock:Number(p.stock||0)}];vs.forEach(addVariantRow);
 updatePriceCalc();$("productEditor").style.display="block";$("productEditor").scrollIntoView({behavior:"smooth",block:"start"});
};

window.removeProduct=async id=>{
 const p=products.find(x=>x.id===id);if(!confirm(`"${p?.name||"Product"}" মুছে ফেলবেন?`))return;
 try{await deleteDoc(doc(db,"products",id));alert("Product মুছে ফেলা হয়েছে।")}catch(e){alert("Delete হয়নি: "+(e.code||e.message))}
};

$("productForm").onsubmit=async e=>{
 e.preventDefault();
 const btn=e.submitter; if(btn){btn.disabled=true;btn.textContent="Saving..."}
 try{
  const id=$("editId").value,old=products.find(x=>x.id===id);
  const variants=getVariants(),totalStock=variants.reduce((a,v)=>a+Number(v.stock||0),0);
  const reg=Number($("pRegularPrice").value||0),raw=$("pOfferPrice").value.trim(),offer=raw===""?null:Number(raw),sell=offer??reg,cost=Number($("pCostPrice").value||0);
  if(!$("pName").value.trim()||!$("pCode").value.trim()){alert("Product Name এবং Code দিন।");return}
  if(sell<0||reg<0||cost<0){alert("Price সঠিকভাবে দিন।");return}
  const data={
   name:$("pName").value.trim(),code:$("pCode").value.trim(),sku:$("pCode").value.trim(),category:$("pCategory").value,
   costPrice:cost,regularPrice:reg,offerPrice:offer,price:sell,
   discountPercent:reg>0&&sell<reg?Number((((reg-sell)/reg)*100).toFixed(2)):0,
   profitPerPiece:Number((sell-cost).toFixed(2)),markupPercent:cost>0?Number((((sell-cost)/cost)*100).toFixed(2)):0,
   lowStockAt:Math.max(0,Number($("pLowStockAt").value||5)),stock:totalStock,variants,details:$("pDetails").value.trim(),
   images:existingImages.slice(0,5),active:$("pStatus").value==="active",status:$("pStatus").value,updatedAt:serverTimestamp()
  };
  let pid=id;
  if(id) await updateDoc(doc(db,"products",id),data);
  else {const r=await addDoc(collection(db,"products"),{...data,createdAt:serverTimestamp()});pid=r.id}
  const before=Number(old?.stock||0);
  if(!old||before!==totalStock){
   try{await addDoc(collection(db,"stockMovements"),{productId:pid,productName:data.name,before:old?before:0,after:totalStock,change:totalStock-(old?before:0),reason:old?"Admin stock edit":"Opening stock",createdAt:serverTimestamp()})}catch(err){console.warn("Stock movement log failed",err)}
  }
  $("productEditor").style.display="none";resetProductForm();alert(id?"Product update হয়েছে।":"Product add হয়েছে।");
 }catch(err){console.error(err);alert("Save হয়নি: "+(err.code||err.message))}
 finally{if(btn){btn.disabled=false;btn.textContent="Save Product"}}
};



const bdAddressPOS={
"চট্টগ্রাম":["কুমিল্লা","চট্টগ্রাম","কক্সবাজার","ফেনী","নোয়াখালী","লক্ষ্মীপুর","চাঁদপুর","ব্রাহ্মণবাড়িয়া","খাগড়াছড়ি","রাঙ্গামাটি","বান্দরবান"],
"ঢাকা":["ঢাকা","গাজীপুর","নারায়ণগঞ্জ","নরসিংদী","মানিকগঞ্জ","মুন্সিগঞ্জ","টাঙ্গাইল","কিশোরগঞ্জ","ফরিদপুর","গোপালগঞ্জ","মাদারীপুর","রাজবাড়ী","শরীয়তপুর"],
"রাজশাহী":["রাজশাহী","বগুড়া","জয়পুরহাট","নওগাঁ","নাটোর","চাঁপাইনবাবগঞ্জ","পাবনা","সিরাজগঞ্জ"],
"খুলনা":["খুলনা","বাগেরহাট","সাতক্ষীরা","যশোর","ঝিনাইদহ","মাগুরা","নড়াইল","কুষ্টিয়া","চুয়াডাঙ্গা","মেহেরপুর"],
"বরিশাল":["বরিশাল","ভোলা","ঝালকাঠি","পটুয়াখালী","পিরোজপুর","বরগুনা"],
"সিলেট":["সিলেট","মৌলভীবাজার","হবিগঞ্জ","সুনামগঞ্জ"],
"রংপুর":["রংপুর","দিনাজপুর","গাইবান্ধা","কুড়িগ্রাম","লালমনিরহাট","নীলফামারী","পঞ্চগড়","ঠাকুরগাঁও"],
"ময়মনসিংহ":["ময়মনসিংহ","জামালপুর","নেত্রকোনা","শেরপুর"]
};
const cumillaUpazilasPOS=["মুরাদনগর","বরুড়া","কুমিল্লা আদর্শ সদর","কুমিল্লা সদর দক্ষিণ","চান্দিনা","দাউদকান্দি","দেবিদ্বার","হোমনা","লাকসাম","মনোহরগঞ্জ","মেঘনা","নাঙ্গলকোট","তিতাস","বুড়িচং","ব্রাহ্মণপাড়া","চৌদ্দগ্রাম","লালমাই"];
function initPosAddress(){
 const division=$("posDivision"),district=$("posDistrict"),upazila=$("posUpazila"),manual=$("posUpazilaManual");
 if(!division||!district||!upazila)return;
 const fill=(element,placeholder,items)=>element.replaceChildren(new Option(placeholder,""),...items.map(name=>new Option(name,name)));
 fill(division,"বিভাগ নির্বাচন করুন",Object.keys(bdAddressPOS));
 const districtChanged=()=>{
   const list=district.value==="কুমিল্লা"?cumillaUpazilasPOS:[];
   fill(upazila,"উপজেলা / থানা নির্বাচন করুন",list);
   if(manual){const useManual=!!district.value&&!list.length;manual.hidden=!useManual;manual.required=useManual;manual.value="";upazila.hidden=useManual;upazila.required=!useManual;}
   if(district.value){$("posDelivery").value=district.value==="কুমিল্লা"?80:150;calcPos()}
 };
 division.onchange=()=>{fill(district,"জেলা নির্বাচন করুন",bdAddressPOS[division.value]||[]);districtChanged()};
 district.onchange=districtChanged;
 division.onchange();
}
function validBdMobile(v){return /^01[3-9][0-9]{8}$/.test(String(v||"").trim())}
function digitsOnlyInput(el){el?.addEventListener("input",()=>{el.value=el.value.replace(/\D/g,"").slice(0,11);el.classList.toggle("field-error",el.value.length>0&&!validBdMobile(el.value))})}
digitsOnlyInput($("posCustomerMobile"));digitsOnlyInput($("posCustomerWhatsApp"));
initPosAddress();

let posCart=[],lastMemo=null;
function salePrice(p){return Number(p.offerPrice??p.price??p.regularPrice??0)}
function productVariants(p){return (p.variants&&p.variants.length)?p.variants:[{sku:p.code||"",size:"",color:"",stock:Number(p.stock||0)}]}
function renderPosProducts(){
 const box=$("posProductList");if(!box)return;
 const q=$("posSearch").value.trim().toLowerCase();
 const list=products.filter(p=>p.active!==false&&Number(p.stock||0)>0&&(!q||[p.name,p.code,p.category].join(" ").toLowerCase().includes(q)));
 box.innerHTML=list.length?list.map(p=>`<div class="pos-item"><div><b>${esc(p.name)}</b><div class="hint">${esc(p.code||"")} • ${esc(p.category||"")} • Stock ${Number(p.stock||0)} • ${money(salePrice(p))}</div></div><button class="btn primary" onclick="posAddProduct('${p.id}')">Add</button></div>`).join(""):'<p class="hint">কোনো product পাওয়া যায়নি।</p>';
}
$("posSearch").oninput=renderPosProducts;

window.posAddProduct=id=>{
 const p=products.find(x=>x.id===id);if(!p)return;
 const vs=productVariants(p).filter(v=>Number(v.stock||0)>0);
 let vi=0;
 if(vs.length>1){
   const text=vs.map((v,i)=>`${i+1}. ${[v.size,v.color,v.sku].filter(Boolean).join(" / ")||"Default"} — Stock ${v.stock}`).join("\n");
   const pick=prompt("Variant নির্বাচন করুন:\n"+text+"\n\nনাম্বার লিখুন:","1"); if(pick===null)return;
   vi=Math.max(0,Math.min(vs.length-1,Number(pick)-1||0));
 }
 const v=vs[vi]||{sku:p.code||"",size:"",color:"",stock:Number(p.stock||0)};
 const key=p.id+"|"+(v.sku||"")+"|"+(v.size||"")+"|"+(v.color||"");
 const ex=posCart.find(x=>x.key===key);
 if(ex){if(ex.qty>=Number(v.stock||0)){alert("এই Variant-এর পর্যাপ্ত stock নেই।");return}ex.qty++}
 else posCart.push({key,productId:p.id,name:p.name,code:p.code||"",variantSku:v.sku||"",size:v.size||"",color:v.color||"",available:Number(v.stock||0),qty:1,price:salePrice(p),cost:Number(p.costPrice||0)});
 renderPosCart();
};
function renderPosCart(){
 const box=$("posCart");if(!box)return;
 box.innerHTML=posCart.length?posCart.map((x,i)=>`<div class="pos-cart-row"><div><b>${esc(x.name)}</b><div class="hint">${esc([x.size,x.color,x.variantSku].filter(Boolean).join(" / "))}</div></div><input type="number" min="1" max="${x.available}" value="${x.qty}" onchange="posQty(${i},this.value)"><input type="number" min="0" value="${x.price}" onchange="posPrice(${i},this.value)"><b class="lineTotal">${money(x.qty*x.price)}</b><button class="btn danger removeLine" onclick="posRemove(${i})">×</button></div>`).join(""):'<p class="hint">Product থেকে Add করুন।</p>';
 calcPos();
}
window.posQty=(i,v)=>{posCart[i].qty=Math.max(1,Math.min(posCart[i].available,Number(v||1)));renderPosCart()};
window.posPrice=(i,v)=>{posCart[i].price=Math.max(0,Number(v||0));renderPosCart()};
window.posRemove=i=>{posCart.splice(i,1);renderPosCart()};
function calcPos(){
 const sub=posCart.reduce((a,x)=>a+x.qty*x.price,0),dis=Math.max(0,Number($("posDiscount")?.value||0)),del=Math.max(0,Number($("posDelivery")?.value||0)),grand=Math.max(0,sub-dis+del),paid=Math.max(0,Number($("posPaid")?.value||0)),due=Math.max(0,grand-paid);
 $("posSubtotal").textContent=money(sub);$("posDiscountShow").textContent="- "+money(dis);$("posDeliveryShow").textContent="+ "+money(del);$("posGrand").textContent=money(grand);$("posDue").textContent=money(due);
 return{sub,dis,del,grand,paid,due};
}
["posDiscount","posDelivery","posPaid"].forEach(id=>$(id).oninput=calcPos);


/* Phase 3: read-only customer directory based on existing Firebase data. */
function mxPhone(v){return String(v||"").replace(/\D/g,"").replace(/^880(?=1[3-9])/,"0")}
function mxCustomerKey(o){const mobile=mxPhone(o.mobile||o.phone||o.customerMobile||o.customerPhone);return mobile?"p:"+mobile:(o.customerId?"id:"+o.customerId:(o.userId?"u:"+o.userId:"unknown:"+o.id))}
function mxCustomerIndex(){
 const records=new Map();
 function add(o,kind){
  const key=mxCustomerKey(o);let c=records.get(key);
  if(!c){c={key,name:"",mobile:"",customerId:"",division:"",district:"",upazila:"",area:"",address:"",online:[],offline:[],docs:[]};records.set(key,c)}
  const name=o.customerName||o.name||"",mobile=o.customerMobile||o.phone||o.mobile||"";
  c.name=c.name||name;c.mobile=c.mobile||mobile;c.customerId=c.customerId||o.customerId||"";
  for(const field of ["division","district","upazila","area"]){c[field]=c[field]||o[field]||""}
  c.address=c.address||o.customerAddress||o.fullAddress||o.address||"";
  if(kind==="online")c.online.push(o);else if(kind==="offline")c.offline.push(o);else c.docs.push(o);
 }
 mxCustomerDocs.forEach(o=>add(o,"record"));orders.forEach(o=>add(o,"online"));offlineSales.forEach(o=>add(o,"offline"));
 return [...records.values()].sort((a,b)=>(b.online.length+b.offline.length)-(a.online.length+a.offline.length));
}
function renderMxCustomers(){
 const host=$("mxCustomerRows");if(!host)return;
 const query=($("mxCustomerSearch")?.value||"").trim().toLowerCase(),source=$("mxCustomerSource")?.value||"all";
 const list=mxCustomerIndex().filter(c=>{
  if(source==="online"&&!c.online.length)return false;if(source==="offline"&&!c.offline.length)return false;
  const text=[c.name,c.mobile,c.customerId,...c.online.map(o=>[o.id,orderCode(o)].join(" ")),...c.offline.map(s=>[s.id,s.saleId].join(" "))].join(" ").toLowerCase();
  return !query||text.includes(query);
 });
 $("mxCustomerCount").textContent=`${list.length}টি Customer Record / Group পাওয়া গেছে`;
 host.innerHTML=list.length?list.map((c,i)=>`<tr><td><b>${esc(c.name||"নাম নেই")}</b><br><small>${esc(c.customerId||"ID নেই")}</small></td><td>${esc(c.mobile||"—")}</td><td>${esc([c.area,c.upazila,c.district,c.division].filter(Boolean).join(", ")||c.address||"—")}</td><td>${c.online.length}</td><td>${c.offline.length}</td><td><button class="btn" data-mx-customer="${i}">View History</button></td></tr>`).join(""):'<tr><td colspan="6">কোনো Customer পাওয়া যায়নি।</td></tr>';
 host.querySelectorAll("[data-mx-customer]").forEach(b=>b.onclick=()=>showMxCustomer(list[Number(b.dataset.mxCustomer)]));
}
function showMxCustomer(c){
 if(!c)return;const box=$("mxCustomerDetails");box.style.display="block";
 const online=c.online.map(o=>`<tr><td>${esc(orderCode(o))}</td><td>${money(o.total)}</td><td>${esc(o.status||"Pending")}</td><td><button class="btn" data-mx-order="${esc(o.id)}">Open Order</button></td></tr>`).join("");
 const offline=c.offline.map(s=>`<tr><td>${esc(s.saleId||s.id)}</td><td>${money(s.total)}</td><td>${esc(s.paymentStatus||"—")}</td><td>Offline POS</td></tr>`).join("");
 box.innerHTML=`<h3>${esc(c.name||"Customer")} — ${esc(c.customerId||"No Customer ID")}</h3><p><b>Mobile:</b> ${esc(c.mobile||"—")}<br><b>Address:</b> ${esc([c.address,c.area,c.upazila,c.district,c.division].filter(Boolean).join(", ")||"—")}</p><div class="tablewrap"><table><thead><tr><th>Order / Memo ID</th><th>Total</th><th>Status</th><th>Action</th></tr></thead><tbody>${online+offline||'<tr><td colspan="4">No orders</td></tr>'}</tbody></table></div>`;
 box.querySelectorAll("[data-mx-order]").forEach(b=>b.onclick=()=>window.viewOrder(b.dataset.mxOrder));box.scrollIntoView({behavior:"smooth",block:"nearest"});
}
$("mxCustomerSearch").addEventListener("input",renderMxCustomers);
$("mxCustomerSource").addEventListener("change",renderMxCustomers);

function nextCustomerId(){return "MXC-"+Date.now().toString().slice(-8)}
function nextSaleId(){const d=new Date(),ds=d.toISOString().slice(0,10).replaceAll("-","");return "MXS-"+ds+"-"+Date.now().toString().slice(-6)}
async function findCustomerByMobile(mobile){
 const snap=await getDocs(collection(db,"customers"));
 const norm=mobile.replace(/\D/g,"");
 return snap.docs.map(d=>({id:d.id,...d.data()})).find(c=>String(c.mobile||"").replace(/\D/g,"")===norm)||null;
}
$("completeSale").onclick=async()=>{
 if(!posCart.length){alert("Cart-এ Product যোগ করুন।");return}
 const name=$("posCustomerName").value.trim(),mobile=$("posCustomerMobile").value.trim(),wa=$("posCustomerWhatsApp").value.trim();
 const division=$("posDivision").value,district=$("posDistrict").value,upazila=($("posUpazilaManual")?.hidden===false?$("posUpazilaManual").value.trim():$("posUpazila").value),area=$("posArea").value.trim();
 if(!name){alert("Customer Name দিন।");return}
 if(!validBdMobile(mobile)){alert("সঠিক ১১ সংখ্যার বাংলাদেশি Mobile Number দিন। যেমন: 01XXXXXXXXX");$("posCustomerMobile").focus();return}
 if(wa&&!validBdMobile(wa)){alert("WhatsApp Number দিলে সঠিক ১১ সংখ্যার বাংলাদেশি নম্বর দিন।");$("posCustomerWhatsApp").focus();return}
 if(!division||!district||!upazila||!area){alert("বিভাগ, জেলা, উপজেলা/থানা এবং এলাকা নির্বাচন/লিখুন।");return}
 const t=calcPos(),btn=$("completeSale");btn.disabled=true;btn.textContent="Processing...";
 try{
   let customer=await findCustomerByMobile(mobile);
   const customerId=$("posCustomerId").value.trim()||customer?.customerId||nextCustomerId();
   const customerData={customerId,name,mobile,whatsapp:wa,division,district,upazila,area,address:$("posCustomerAddress").value.trim(),updatedAt:serverTimestamp()};
   let customerDocId=customer?.id;
   if(customerDocId) await updateDoc(doc(db,"customers",customerDocId),customerData);
   else {const cr=await addDoc(collection(db,"customers"),{...customerData,source:"offline-pos",createdAt:serverTimestamp()});customerDocId=cr.id}

   const saleId=nextSaleId(),lines=posCart.map(x=>({...x,lineTotal:Number((x.qty*x.price).toFixed(2)),costTotal:Number((x.qty*x.cost).toFixed(2))}));
   const saleRef=doc(collection(db,"sales"));
   await runTransaction(db,async tx=>{
     // Firestore requires every read to finish before the first write.
     const productRefs=new Map();
     for(const line of lines){
       if(!productRefs.has(line.productId))productRefs.set(line.productId,doc(db,"products",line.productId));
     }
     const snapshots=new Map();
     for(const [id,pref] of productRefs){
       const snap=await tx.get(pref);
       if(!snap.exists())throw new Error("Product পাওয়া যায়নি: "+id);
       snapshots.set(id,snap.data());
     }
     const changes=new Map();
     for(const line of lines){
       const pd=snapshots.get(line.productId);
       let vs=changes.get(line.productId);
       if(!vs){vs=productVariants(pd).map(v=>({...v}));changes.set(line.productId,vs)}
       const idx=vs.findIndex(v=>(v.sku||"")===(line.variantSku||"")&&(v.size||"")===(line.size||"")&&(v.color||"")===(line.color||""));
       if(idx<0)throw new Error("Variant পাওয়া যায়নি: "+line.name);
       if(Number(vs[idx].stock||0)<line.qty)throw new Error("Stock কম: "+line.name);
       vs[idx].stock=Number(vs[idx].stock||0)-line.qty;
     }
     for(const [id,vs] of changes){
       tx.update(productRefs.get(id),{variants:vs,stock:vs.reduce((sum,v)=>sum+Number(v.stock||0),0),updatedAt:serverTimestamp()});
     }
     tx.set(saleRef,{saleId,type:"offline",customerDocId,customerId,customerName:name,customerMobile:mobile,customerWhatsApp:customerData.whatsapp,division,district,upazila,area,customerAddress:customerData.address,items:lines,subtotal:t.sub,discount:t.dis,deliveryCharge:t.del,total:t.grand,paid:t.paid,due:t.due,paymentMethod:$("posPayment").value,paymentStatus:t.due<=0?"Paid":t.paid>0?"Partial":"Due",status:"Completed",totalCost:lines.reduce((sum,x)=>sum+x.costTotal,0),grossProfit:Number((t.sub-t.dis-lines.reduce((sum,x)=>sum+x.costTotal,0)).toFixed(2)),createdAt:serverTimestamp()});
   });
   for(const line of lines){try{await addDoc(collection(db,"stockMovements"),{productId:line.productId,productName:line.name,change:-line.qty,reason:"Offline POS Sale",linkedSaleId:saleId,createdAt:serverTimestamp()})}catch(e){}}
   lastMemo={saleId,date:new Date(),customerId,name,mobile,whatsapp:customerData.whatsapp,division,district,upazila,area,address:customerData.address,items:lines,...t,paymentMethod:$("posPayment").value,paymentStatus:t.due<=0?"Paid":t.paid>0?"Partial":"Due"};
   renderMemo(lastMemo);posCart=[];renderPosCart();["posCustomerName","posCustomerMobile","posCustomerWhatsApp","posCustomerId","posArea","posCustomerAddress"].forEach(id=>$(id).value="");initPosAddress();$("posDiscount").value=0;$("posDelivery").value=0;$("posPaid").value=0;
   document.querySelector('[data-p="pos"]').classList.remove("active");document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));$("cashmemo").classList.add("active");$("title").textContent="Cash Memo / Invoice";
 }catch(e){console.error(e);alert("Sale complete হয়নি: "+(e.message||e.code))}
 finally{btn.disabled=false;btn.textContent="Complete Sale & Generate Cash Memo"}
};
function renderMemo(m){
 const rows=m.items.map((x,i)=>`<tr><td>${i+1}</td><td><b>${esc(x.name)}</b><br><small>${esc([x.size,x.color,x.variantSku].filter(Boolean).join(" / "))}</small></td><td>${x.qty}</td><td>${money(x.price)}</td><td>${money(x.lineTotal)}</td></tr>`).join("");
 $("memoPrint").innerHTML=`<div class="memo-head"><img class="memo-logo" src="assets/images/logo.png" alt="Mehedi Xpress"><div class="memo-brand"><h1>MEHEDI XPRESS</h1><p><b>Sports • Fashion • Custom Print</b></p><p>খেলাধুলার সামগ্রী, ফ্যাশন ও কাস্টম প্রিন্টিং সেবা</p><p>দক্ষিণ বাঙ্গরা বাজার বাসস্ট্যান্ডের উত্তর পাশে, বাঙ্গরা বাজার থানা, মুরাদনগর, কুমিল্লা</p><p>Contact / WhatsApp: +8801612961523</p></div><div class="memo-meta"><b>CASH MEMO / INVOICE</b><br>Sale ID: ${esc(m.saleId)}<br>Date: ${m.date.toLocaleString("en-BD")}<br>Sale Type: Offline / Shop</div></div>
 <div class="memo-customer"><div><b>Customer:</b> ${esc(m.name)}</div><div><b>Customer ID:</b> ${esc(m.customerId)}</div><div><b>Mobile:</b> ${esc(m.mobile)}</div><div><b>WhatsApp:</b> ${esc(m.whatsapp||"—")}</div><div style="grid-column:1/-1"><b>Address:</b> ${esc([m.area,m.upazila,m.district,m.division,m.address].filter(Boolean).join(", ")||"—")}</div></div>
 <table><thead><tr><th>#</th><th>Product / Variant</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table>
 <div class="memo-summary"><div class="totalrow"><span>Subtotal</span><b>${money(m.sub)}</b></div><div class="totalrow"><span>Discount</span><b>- ${money(m.dis)}</b></div><div class="totalrow"><span>Delivery Charge</span><b>+ ${money(m.del)}</b></div><div class="totalrow grand"><span>Grand Total</span><span>${money(m.grand)}</span></div><div class="totalrow"><span>Paid</span><b>${money(m.paid)}</b></div><div class="totalrow"><span>Due</span><b>${money(m.due)}</b></div><div class="totalrow"><span>Payment</span><b>${esc(m.paymentMethod)} • ${esc(m.paymentStatus)}</b></div></div>
 <div class="memo-foot"><div>____________________<br>Customer Signature</div><div>____________________<br>Authorized Signature<br>Mehedi Xpress</div></div><div class="memo-note">আমাদের সাথে কেনাকাটা করার জন্য ধন্যবাদ। • Cash on Delivery nationwide</div>`;
}
function printMemoAs(size){
 document.body.classList.remove("print-a4","print-a5");
 document.body.classList.add(size==="A5"?"print-a5":"print-a4");
 let style=document.getElementById("dynamicPrintPage");
 if(!style){style=document.createElement("style");style.id="dynamicPrintPage";document.head.appendChild(style)}
 style.textContent=size==="A5"?"@page { size: A5 portrait; margin: 8mm; }":"@page { size: A4 portrait; margin: 8mm; }";
 setTimeout(()=>window.print(),80);
}
$("printA4").onclick=()=>printMemoAs("A4");
$("printA5").onclick=()=>printMemoAs("A5");
window.addEventListener("afterprint",()=>document.body.classList.remove("print-a4","print-a5"));
$("backToPos").onclick=()=>{document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));$("pos").classList.add("active");document.querySelectorAll("[data-p]").forEach(x=>x.classList.toggle("active",x.dataset.p==="pos"));$("title").textContent="🧾 Offline Sale / POS"};
const originalRenderProducts=renderProducts;
renderProducts=function(){originalRenderProducts();renderPosProducts()};

renderCats();
</script></body></html>
