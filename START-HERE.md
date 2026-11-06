# UniFit admin — local school project

1. Open this whole `unifit-admin` folder in VS Code.
2. Open Terminal → New Terminal.
3. Run `python server.py` (Python 3 is required).
4. On first start, enter your team's admin username and a password with at least 12 characters. Confirm it. Password typing is hidden.
5. Open http://localhost:8000/login.html then click **Admin Log in**.

Use this server URL for all pages, including checkout. Live Server and double-clicking HTML do not run the backend.

Features: private admin login, one-hour session, logout, order search and filters, unread order notifications, order details, status changes, cancellation with reason, and customer messages at `/contact.html`. Dashboard refreshes every 15 seconds. Completed and cancelled orders are closed.

New checkouts are saved to the server before the cart is cleared. Existing browser-only orders are not migrated. Customer messages have a read action; email replies are not implemented. The original My Orders page is a static template and does not reflect admin changes yet.

The `private.sqlite3` database contains password hashes, orders, and messages. It stays outside the public folder. Do not share that file or upload it to GitHub. Back it up privately. Admin sessions end on server restart. There are no built-in/default admin credentials.

This server runs only on this computer for a school demonstration. Public deployment needs HTTPS, real customer accounts and order ownership checks, trusted product prices calculated on the server, payment verification, spam controls, and a production server. Current checkout totals and references are customer submitted, not verified payments. Do not use real payment/customer data for the demonstration.

Your original source folder was left unchanged. The edited copy is inside `public`.
