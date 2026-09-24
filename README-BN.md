# Mehedi Xpress V4

## কী আছে
Customer store, Firebase customer account, নিজের order history, category/search/sort, variant size/color/stock, selected-cart checkout, Admin Dashboard, Products, Categories, Orders, Inventory, POS/Offline Sale, Purchase/Stock-In, Expenses, Reports/CSV, Settings এবং stock movement history।

## 1. Firebase
`firebase-config.example.js` কপি করে `firebase-config.js` করুন। আপনার Firebase Web App config বসান। `ADMIN_UID`-তে আপনার Firebase admin UID বসান।

Authentication → Email/Password enable রাখুন। Firestore Rules tab-এ `firestore.rules` publish করুন।

## 2. ছবি upload
V4-এ Firestore-এর ভেতরে Base64 ছবি রাখা হয় না। Cloudinary hosted upload ব্যবহার করা হয়েছে।
Cloudinary → Settings → Upload → Upload Presets → একটি restricted `Unsigned` preset তৈরি করুন।
Allowed format JPG/PNG/WebP এবং file-size limit দিন। তারপর `firebase-config.js`-এ `cloudName` ও `uploadPreset` বসান।
Admin Product-এ মোবাইল/PC থেকে ১–৫টি file select করলে hosted upload হবে; Firestore-এ permanent URL রাখা হবে।

## 3. Product variant format
প্রতি variant এক লাইনে:
`SKU | Size | Color | Cost | Sell | Stock`
উদাহরণ:
`ARG-26-M-BLK | M | Black | 300 | 500 | 10`

## 4. Stock নিয়ম
Online: Pending → Confirmed হলে Firestore transaction-এ stock reserve/deduct। Confirmed/Processing → Cancelled হলে একবার stock return। Delivered হলে sale-time cost snapshot দিয়ে gross profit।
POS sale করলে stock সঙ্গে সঙ্গে কমে।
Purchase করলে stock বাড়ে এবং weighted-average cost update হয়।
প্রতিটি change `stockMovements`-এ record হয়।

## 5. গুরুত্বপূর্ণ নিরাপত্তা সীমা
Customer অন্য customer-এর order পড়তে পারে না এবং admin collections লিখতে পারে না।
তবে এই static V4 checkout-এর product price/total browser payload থেকে নেয়। তাই এটিকে সম্পূর্ণ tamper-proof payment/order backend বলা যাবে না। Production-grade server-side price validation, checkout-time atomic reservation, payment gateway, Steadfast API এবং stronger idempotency-এর জন্য trusted backend দরকার।

## 6. Manual payment
bKash/Nagad transaction ID দিলেই Paid হয় না; Pending Verification হিসেবে order save হয়। Automatic verification এই static build-এ নেই।

## 7. Test order
Admin login → Category → Product + image + variants → Customer register/login → Cart → Checkout → Admin Orders → Pending → Confirmed → Processing → Shipped → Delivered।
তারপর Inventory ও Reports মিলিয়ে দেখুন।
