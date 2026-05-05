import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { XMLParser } from "fast-xml-parser";
import dotenv from "dotenv";

dotenv.config();

const parser = new XMLParser();

const CPAGRIP_USER_ID = process.env.CPAGRIP_USER_ID || '1152355';
const CPAGRIP_KEY = process.env.CPAGRIP_KEY || '129a0adeefd68d21748d250386079204';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin lazily or here if we have the service account
// In AI Studio, we might not have a service account file directly accessible as a file,
// but we'll try to use default credentials or project ID.
// For now, let's assume we use the Firebase SDK on the client for DB and a simple API for postback.
// Actually, for CPAGrip postback, we NEED backend processing to update balances securely.

// We need to handle the case where firebase-applet-config.json exists
let db: any;
try {
  // Try to initialize Firebase Admin if we can. 
  // If not, we'll have to rely on a different approach or warn the user.
  // AI Studio provides GEMINI_API_KEY, but not necessarily a Firebase Service Account JSON.
  // However, it's a Cloud Run container, so if it's in the same project, 
  // Default Credentials might work.
  initializeApp({
    // projectID: process.env.FIREBASE_PROJECT_ID // Usually available in env or config
  });
  db = getFirestore();
} catch (e) {
  console.warn("Firebase Admin failed to initialize. Postbacks will not work.", e);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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
      console.error("Proxy error:", error);
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

      // CPAGrip RSS structure: rss -> channel -> item (or depending on version, sometimes it's different)
      // Actually, based on their PHP example, it's $xml->offers->offer
      // Let's check the structure carefully. Their sample says: $xml = simplexml_load_string($output); foreach($xml->offers->offer as $offeritem)
      // fast-xml-parser usually gives { offers: { offer: [...] } }
      
      const offers = jsonObj?.offers?.offer || [];
      const normalizedOffers = Array.isArray(offers) ? offers : [offers];

      res.json(normalizedOffers.filter(o => o && o.title).map(o => ({
        id: o.offerid,
        title: o.title,
        description: o.description || "",
        payout: parseFloat(o.payout) || 0,
        link: (o.offerlink || "").replace('www.cpagrip.com', 'filetrkr.com'), // Using custom domain as suggested
        image: o.offerphoto || "",
        type: o.offer_type || "",
        countries: o.countries || ""
      })));
    } catch (error) {
      console.error("Offer feed error:", error);
      res.status(500).json({ error: "Failed to fetch offers" });
    }
  });

  // CPAGrip Postback URL: /api/postback
  // Standard POST variables: tracking_id, payout, password
  // Optional GET fallback for custom URL configurations
  app.all("/api/postback", async (req, res) => {
    const tracking_id = (req.body.tracking_id || req.query.tracking_id || req.query.user_id) as string;
    const amount = (req.body.payout || req.query.payout || req.body.amount || req.query.amount) as string;
    const password = (req.body.password || req.query.password) as string;

    // Verify password if configured in environment
    if (process.env.CPAGRIP_POSTBACK_PASSWORD && password !== process.env.CPAGRIP_POSTBACK_PASSWORD) {
      console.warn("Unauthorized postback attempt with invalid password");
      return res.status(401).send("Unauthorized");
    }

    if (!tracking_id || !amount) {
      return res.status(400).send("Missing parameters");
    }

    // User gets 50% of what CPAGrip pays
    const rawPayout = parseFloat(amount);
    const userPayout = rawPayout * 0.5;

    if (isNaN(rawPayout)) {
      return res.status(400).send("Invalid amount");
    }

    try {
      if (!db) throw new Error("Database not initialized");

      const user_id = tracking_id;
      const balanceRef = db.collection("balances").doc(user_id);
      const userRef = db.collection("users").doc(user_id);

      await db.runTransaction(async (t: any) => {
        const balanceDoc = await t.get(balanceRef);
        const userDoc = await t.get(userRef);

        if (!balanceDoc.exists) {
          t.set(balanceRef, {
            current: userPayout,
            totalEarned: userPayout,
            offersCompleted: 1,
            updatedAt: FieldValue.serverTimestamp(),
          });
        } else {
          const data = balanceDoc.data();
          t.update(balanceRef, {
            current: (data.current || 0) + userPayout,
            totalEarned: (data.totalEarned || 0) + userPayout,
            offersCompleted: (data.offersCompleted || 0) + 1,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }

        // Create transaction record
        const transRef = db.collection("transactions").doc();
        t.set(transRef, {
          userId: user_id,
          amount: userPayout,
          type: "offer",
          description: "CPAGrip Offer Payout",
          timestamp: FieldValue.serverTimestamp(),
        });

        // Referral commission (10% of user reward)
        if (userDoc.exists) {
          const userData = userDoc.data();
          if (userData.referredBy) {
            const referrerId = userData.referredBy;
            const referralAmount = userPayout * 0.1;
            const referrerBalanceRef = db.collection("balances").doc(referrerId);

            const referrerBalanceDoc = await t.get(referrerBalanceRef);
            if (referrerBalanceDoc.exists) {
              const rData = referrerBalanceDoc.data();
              t.update(referrerBalanceRef, {
                current: (rData.current || 0) + referralAmount,
                totalEarned: (rData.totalEarned || 0) + referralAmount,
                updatedAt: FieldValue.serverTimestamp(),
              });
            } else {
              t.set(referrerBalanceRef, {
                current: referralAmount,
                totalEarned: referralAmount,
                offersCompleted: 0,
                updatedAt: FieldValue.serverTimestamp(),
              });
            }

            const refTransRef = db.collection("transactions").doc();
            t.set(refTransRef, {
              userId: referrerId,
              amount: referralAmount,
              type: "referral",
              description: `Referral commission from ${user_id}`,
              timestamp: FieldValue.serverTimestamp(),
              metadata: { sourceUserId: user_id }
            });
          }
        }
      });

      res.send("OK");
    } catch (error) {
      console.error("Postback error:", error);
      res.status(500).send("Internal Error");
    }
  });

  // Admin stats API
  app.get("/api/admin/stats", async (req, res) => {
    // In a real app, verify admin session here
    try {
      if (!db) throw new Error("Database not initialized");
      
      const transactions = await db.collection("transactions").get();
      const withdrawals = await db.collection("withdrawals").get();
      
      let totalRevenue = 0; // CPAGrip revenue (sum of offer payouts)
      let totalPaidToUsers = 0; // Approved withdrawals
      
      transactions.docs.forEach((doc: any) => {
        const data = doc.data();
        if (data.type === "offer") totalRevenue += data.amount;
      });
      
      withdrawals.docs.forEach((doc: any) => {
        const data = doc.data();
        if (data.status === "paid") totalPaidToUsers += data.amount;
      });

      res.json({
        totalRevenue: totalRevenue.toFixed(2),
        totalPaidToUsers: totalPaidToUsers.toFixed(2),
        netMargin: (totalRevenue - totalPaidToUsers).toFixed(2),
      });
    } catch (error) {
      res.status(500).send("Stats Error");
    }
  });

  // Vite middleware for development
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
