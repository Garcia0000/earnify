import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { XMLParser } from "fast-xml-parser";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool, { initDb } from "./src/lib/mysql.ts";

dotenv.config();

// Debugging process errors in production
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

const parser = new XMLParser();
const AUTH_SECRET = process.env.JWT_SECRET || "super-secret-key";

const CPAGRIP_USER_ID = process.env.CPAGRIP_USER || '1152355';
const CPAGRIP_KEY = process.env.CPAGRIP_KEY || '129a0adeefd68d21748d250386079204';
const CPAGRIP_POSTBACK_PASSWORD = process.env.CPAGRIP_POSTBACK_PASSWORD || '';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  try {
    await initDb();
  } catch (error) {
    console.error('CRITICAL: Database initialization failed. Server will start but DB features may break.', error);
  }
  
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, AUTH_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      req.user = user;
      next();
    });
  };

  // --- AUTH ROUTES ---
  app.post("/api/auth/register", async (req, res) => {
    const { email, password, referralCode } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing fields" });

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = Math.random().toString(36).substring(2, 15);
      const personalReferralCode = Math.random().toString(36).substring(2, 9).toUpperCase();

      await pool.query(
        "INSERT INTO users (id, email, password, referral_code, referred_by) VALUES (?, ?, ?, ?, ?)",
        [userId, email, hashedPassword, personalReferralCode, referralCode || null]
      );

      const token = jwt.sign({ id: userId, email }, AUTH_SECRET);
      res.json({ token, user: { id: userId, email, referralCode: personalReferralCode } });
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: "Email already exists" });
      console.error(error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const [rows]: any = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
      const user = rows[0];

      if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user.id, email: user.email }, AUTH_SECRET);
        res.json({ token, user: { id: user.id, email: user.email, referralCode: user.referral_code } });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // --- USER DATA ROUTES ---
  app.get("/api/user/profile", authenticateToken, async (req: any, res) => {
    try {
      const [rows]: any = await pool.query("SELECT id, email, balance, total_earned, referral_code, referred_by, created_at FROM users WHERE id = ?", [req.user.id]);
      if (rows.length === 0) return res.status(404).json({ error: "User not found" });
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.get("/api/user/transactions", authenticateToken, async (req: any, res) => {
    try {
      const [rows]: any = await pool.query("SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC", [req.user.id]);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.get("/api/user/withdrawals", authenticateToken, async (req: any, res) => {
    try {
      const [rows]: any = await pool.query("SELECT * FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC", [req.user.id]);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch withdrawals" });
    }
  });

  app.post("/api/user/withdraw", authenticateToken, async (req: any, res) => {
    const { amount, method, details } = req.body;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const [userRows]: any = await connection.query("SELECT balance FROM users WHERE id = ? FOR UPDATE", [req.user.id]);
      const currentBalance = parseFloat(userRows[0].balance);

      if (currentBalance < amount) {
        throw new Error("Insufficient balance");
      }

      await connection.query("UPDATE users SET balance = balance - ? WHERE id = ?", [amount, req.user.id]);
      await connection.query(
        "INSERT INTO withdrawals (user_id, amount, method, details, status) VALUES (?, ?, ?, ?, 'pending')",
        [req.user.id, amount, method, details]
      );

      await connection.commit();
      res.json({ success: true });
    } catch (error: any) {
      await connection.rollback();
      res.status(400).json({ error: error.message });
    } finally {
      connection.release();
    }
  });

  // --- CPAGRIP PROXY & OFFERS ---
  app.get("/s_include.php", async (req, res) => {
    const id = req.query.id;
    const tracking_id = req.query.tracking_id;
    const visitor_ip = req.headers["cf-connecting-ip"] || req.ip;
    const ref = Buffer.from((req.headers["referer"] as string) || "").toString("base64");
    const user_agent = Buffer.from((req.headers["user-agent"] as string) || "").toString("base64");
    
    const url = `http://www.cpagrip.com/script_include_proxy.php?custom_domain=&id=${id}&visitor_ip=${visitor_ip}&pubid=1152355&ref=${ref}&user_agent=${user_agent}&tracking_id=${tracking_id}`;
    
    try {
      const response = await fetch(url);
      const text = await response.text();
      res.send(text);
    } catch (error) {
      res.status(500).send("Error proxying request");
    }
  });

  app.get("/api/offers", async (req, res) => {
    const tracking_id = req.query.tracking_id || "";
    const visitor_ip = req.headers["cf-connecting-ip"] || req.ip;
    const user_agent = req.headers["user-agent"] || "";
    const limit = req.query.limit || 20;

    const feedUrl = `https://www.cpagrip.com/common/offer_feed_rss.php?user_id=${CPAGRIP_USER_ID}&key=${CPAGRIP_KEY}&limit=${limit}&ip=${visitor_ip}&ua=${encodeURIComponent(user_agent as string)}&tracking_id=${encodeURIComponent(tracking_id as string)}`;

    try {
      const response = await fetch(feedUrl);
      const xmlData = await response.text();
      const jsonObj = parser.parse(xmlData);
      
      const offers = jsonObj?.offers?.offer || [];
      const normalizedOffers = Array.isArray(offers) ? offers : [offers];

      res.json(normalizedOffers.filter(o => o && o.title).map(o => ({
        id: o.offerid,
        title: o.title,
        description: o.description || "",
        payout: parseFloat(o.payout) || 0,
        link: (o.offerlink || "").replace('www.cpagrip.com', 'filetrkr.com'),
        image: o.offerphoto || "",
        type: o.offer_type || "",
        countries: o.countries || ""
      })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch offers" });
    }
  });

  // --- CPAGRIP POSTBACK ---
  app.all("/api/postback", async (req, res) => {
    const tracking_id = (req.body.tracking_id || req.query.tracking_id || req.query.user_id) as string;
    const amount = (req.body.payout || req.query.payout || req.body.amount || req.query.amount) as string;
    const password = (req.body.password || req.query.password) as string;

    if (CPAGRIP_POSTBACK_PASSWORD && password !== CPAGRIP_POSTBACK_PASSWORD) {
      return res.status(401).send("Unauthorized");
    }

    if (!tracking_id || !amount) return res.status(400).send("Missing parameters");

    const rawPayout = parseFloat(amount);
    const userPayout = rawPayout * 0.5;
    const referralCommission = userPayout * 0.1;

    if (isNaN(rawPayout)) return res.status(400).send("Invalid amount");

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Get user and their referrer
      const [userRows]: any = await connection.query("SELECT id, referred_by FROM users WHERE id = ?", [tracking_id]);
      if (userRows.length === 0) throw new Error("User not found");
      const user = userRows[0];

      // Update user balance
      await connection.query(
        "UPDATE users SET balance = balance + ?, total_earned = total_earned + ? WHERE id = ?",
        [userPayout, userPayout, user.id]
      );

      // Log transaction
      await connection.query(
        "INSERT INTO transactions (user_id, amount_cpagrip, amount_user, amount_referral, type, tracking_id) VALUES (?, ?, ?, ?, 'offer', ?)",
        [user.id, rawPayout, userPayout, 0, tracking_id]
      );

      // Handle referral
      if (user.referred_by) {
        const [refRows]: any = await connection.query("SELECT id FROM users WHERE referral_code = ?", [user.referred_by]);
        if (refRows.length > 0) {
          const referrerId = refRows[0].id;
          await connection.query(
            "UPDATE users SET balance = balance + ?, total_earned = total_earned + ? WHERE id = ?",
            [referralCommission, referralCommission, referrerId]
          );
          await connection.query(
            "INSERT INTO transactions (user_id, amount_user, type, tracking_id) VALUES (?, ?, 'referral', ?)",
            [referrerId, referralCommission, `ref_${tracking_id}`]
          );
        }
      }

      await connection.commit();
      res.send("OK");
    } catch (error) {
      await connection.rollback();
      console.error(error);
      res.status(500).send("Internal Error");
    } finally {
      connection.release();
    }
  });

  // --- ADMIN ROUTES ---
  app.get("/api/admin/stats", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.email !== 'fernandook2016@gmail.com') return res.status(403).send("Forbidden");
      
      const [transRows]: any = await pool.query("SELECT SUM(amount_cpagrip) as totalRevenue FROM transactions WHERE type = 'offer'");
      const [paidRows]: any = await pool.query("SELECT SUM(amount) as totalPaid FROM withdrawals WHERE status = 'paid'");
      
      const totalRevenue = parseFloat(transRows[0].totalRevenue || 0);
      const totalPaidToUsers = parseFloat(paidRows[0].totalPaid || 0);

      res.json({
        totalRevenue: totalRevenue.toFixed(2),
        totalPaidToUsers: totalPaidToUsers.toFixed(2),
        netMargin: (totalRevenue - totalPaidToUsers).toFixed(2),
      });
    } catch (error) {
      res.status(500).send("Stats Error");
    }
  });

  app.get("/api/admin/withdrawals", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.email !== 'fernandook2016@gmail.com') return res.status(403).send("Forbidden");
      const [rows]: any = await pool.query("SELECT * FROM withdrawals ORDER BY created_at DESC");
      res.json(rows);
    } catch (error) {
      res.status(500).send("Error");
    }
  });

  app.get("/api/admin/users", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.email !== 'fernandook2016@gmail.com') return res.status(403).send("Forbidden");
      const [rows]: any = await pool.query("SELECT id, email, balance, referral_code, created_at FROM users");
      res.json(rows);
    } catch (error) {
      res.status(500).send("Error");
    }
  });

  app.post("/api/admin/withdrawals/:id/status", authenticateToken, async (req: any, res) => {
    const { status } = req.body;
    try {
      if (req.user.email !== 'fernandook2016@gmail.com') return res.status(403).send("Forbidden");
      await pool.query("UPDATE withdrawals SET status = ? WHERE id = ?", [status, req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).send("Error");
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
