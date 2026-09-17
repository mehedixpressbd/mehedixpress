MEHEDI XPRESS ADMIN V3 FIX
Replace on GitHub:
- admin.html
- admin.js

Keep the current V2 index.html, app.js, styles.css, firebase-config.js and Firestore rules.

What this fixes/adds:
- Separate Stock Management screen
- Separate Purchase / Stock In
- Separate Offline / POS Sale
- Separate Online Orders
- Payment Verification
- Category management
- Accounts & Receipt History
- Courier screen
- Bengali / English admin toggle
- Direct 1–5 image selection from phone/computer with preview; no URL field
- Product cost/sell/profit/stock table
- Printable sales receipt and purchase voucher

Image note:
This free implementation compresses images in the browser and stores them with the product document. It is suitable only for small images and initial use; a dedicated image storage service is the scalable production approach.
