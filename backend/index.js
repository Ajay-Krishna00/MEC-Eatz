import cors from "cors";
import "dotenv/config";
import express from "express";
import { supabase } from "./supabase.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// ---------------------------------------------------------------------------
// Auth middleware
//
// The mobile client sends the Supabase access token as `Authorization: Bearer
// <token>`. We verify it with Supabase (stateless — no session store needed,
// which is what makes this reliable on Render's free tier) and attach the
// authenticated user to the request.
// ---------------------------------------------------------------------------
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    req.userId = data.user.id;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
}

// Gate staff-only endpoints behind `role = 'staff'`.
async function requireStaff(req, res, next) {
  const { data, error } = await supabase
    .from("Users")
    .select("role")
    .eq("id", req.userId)
    .single();
  if (error || data?.role !== "staff") {
    return res.status(403).json({ success: false, message: "Staff access only" });
  }
  next();
}

// ===========================================================================
// Auth
// ===========================================================================
app.post("/api/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!email || !password) {
      return res.json({ success: false, message: "Email and password required" });
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    const { error: dbError } = await supabase
      .from("Users")
      .insert({ id: data.user.id, name: username, email, balance: 0, role: "student" });
    if (dbError) throw dbError;

    res.json({ success: true });
  } catch (error) {
    console.error("Signup failed:", error.message);
    res.json({ success: false, message: error.message || "Signup failed" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const { data: user, error: profileError } = await supabase
      .from("Users")
      .select("id, name, email, balance, role")
      .eq("id", data.user.id)
      .single();
    if (profileError) throw profileError;

    // The access token is what the client stores and sends back on every
    // authenticated request.
    res.json({ success: true, user, token: data.session.access_token });
  } catch (error) {
    console.error("Login failed:", error.message);
    res.json({ success: false, message: "Invalid email or password" });
  }
});

app.post("/api/logout", requireAuth, async (req, res) => {
  // Token auth is stateless; the client just drops the token. Nothing to do
  // server-side, but we keep the endpoint for symmetry.
  res.json({ success: true });
});

// Current user + live wallet balance.
app.get("/api/me", requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Users")
      .select("id, name, email, balance, role")
      .eq("id", req.userId)
      .single();
    if (error) throw error;
    res.json({ success: true, user: data });
  } catch (error) {
    console.error("Fetch profile failed:", error.message);
    res.json({ success: false, message: "Could not load profile" });
  }
});

// ===========================================================================
// Menu
// ===========================================================================
app.get("/api/items", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Items")
      .select("id, name, price, available, description")
      .order("name");
    if (error) throw error;
    res.json({ success: true, items: data });
  } catch (error) {
    console.error("Fetch items failed:", error.message);
    res.json({ success: false, message: "Items not found" });
  }
});

// ===========================================================================
// Wallet
// ===========================================================================
app.get("/api/wallet", requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Users")
      .select("balance")
      .eq("id", req.userId)
      .single();
    if (error) throw error;
    res.json({ success: true, balance: data.balance });
  } catch (error) {
    console.error("Fetch wallet failed:", error.message);
    res.json({ success: false, message: "Could not load wallet" });
  }
});

// Credit the prepaid wallet (called after a successful digital/UPI payment).
app.post("/api/wallet/topup", requireAuth, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.json({ success: false, message: "Enter a valid amount" });
    }

    const { data, error } = await supabase.rpc("wallet_topup", {
      p_user_id: req.userId,
      p_amount: amount,
    });
    if (error) throw error;

    res.json({ success: true, balance: data.balance });
  } catch (error) {
    console.error("Top-up failed:", error.message);
    res.json({ success: false, message: error.message || "Top-up failed" });
  }
});

// ===========================================================================
// Orders (paid from the prepaid wallet, atomically)
// ===========================================================================
app.post("/api/orders", requireAuth, async (req, res) => {
  try {
    const { items } = req.body; // [{ item_id, quantity }]
    if (!Array.isArray(items) || items.length === 0) {
      return res.json({ success: false, message: "Cart is empty" });
    }

    const { data, error } = await supabase.rpc("place_order", {
      p_user_id: req.userId,
      p_items: items,
    });
    if (error) throw error;

    res.json({
      success: true,
      orderId: data.order_id,
      total: data.total,
      pickupCode: data.pickup_code,
      balance: data.balance,
    });
  } catch (error) {
    console.error("Place order failed:", error.message);
    res.json({ success: false, message: error.message || "Could not place order" });
  }
});

// Per-user ledger: top-ups and orders, newest first.
app.get("/api/orders", requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Transaction_History")
      .select("id, type, price, status, pickup_code, created_at")
      .eq("user_id", req.userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ success: true, transactions: data });
  } catch (error) {
    console.error("Fetch history failed:", error.message);
    res.json({ success: false, message: "Fetching transactions failed" });
  }
});

// Single order with its line items (ownership enforced).
app.get("/api/orders/:orderId", requireAuth, async (req, res) => {
  try {
    const { orderId } = req.params;

    const { data: order, error: orderError } = await supabase
      .from("Transaction_History")
      .select("id, type, price, status, pickup_code, created_at, user_id")
      .eq("id", orderId)
      .single();
    if (orderError) throw orderError;
    if (order.user_id !== req.userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { data: lineItems, error: itemsError } = await supabase
      .from("Transaction_Items")
      .select("quantity, price, Items(name, description)")
      .eq("transaction_id", orderId);
    if (itemsError) throw itemsError;

    res.json({ success: true, order, items: lineItems });
  } catch (error) {
    console.error("Fetch order failed:", error.message);
    res.json({ success: false, message: "Fetching order failed" });
  }
});

// ===========================================================================
// Staff — QR pickup verification & real-time sales analytics
// ===========================================================================
app.post("/api/staff/verify-pickup", requireAuth, requireStaff, async (req, res) => {
  try {
    const code = String(req.body.pickupCode || "").trim();
    if (!code) return res.json({ success: false, message: "Pickup code required" });

    const { data, error } = await supabase.rpc("verify_pickup", { p_code: code });
    if (error) throw error;

    res.json({ success: true, order: data });
  } catch (error) {
    console.error("Verify pickup failed:", error.message);
    res.json({ success: false, message: error.message || "Verification failed" });
  }
});

app.get("/api/staff/analytics", requireAuth, requireStaff, async (req, res) => {
  try {
    const { data, error } = await supabase.rpc("staff_analytics");
    if (error) throw error;
    res.json({ success: true, analytics: data });
  } catch (error) {
    console.error("Analytics failed:", error.message);
    res.json({ success: false, message: "Could not load analytics" });
  }
});

app.get("/", (req, res) => res.json({ service: "MEC Eatz API", status: "ok" }));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
