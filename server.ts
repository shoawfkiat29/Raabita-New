import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import twilio from "twilio";
import admin from "firebase-admin";
import fs from "fs";
import { getFirestore } from "firebase-admin/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 SAFE FIREBASE INIT
let db: any = null;

try {
  const serviceAccountPath = path.join(__dirname, "service-account.json");

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountPath, "utf8")
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    db = getFirestore();

    console.log("✅ Firebase initialized");
  } else {
    console.warn("⚠️ service-account.json not found");
  }
} catch (error) {
  console.error("🔥 Firebase init failed:", error);
  db = null;
}

// 🔥 TWILIO
let twilioClient: twilio.Twilio | null = null;
function getTwilio() {
  if (!twilioClient) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;

    if (sid && token && sid !== "your_twilio_account_sid") {
      twilioClient = twilio(sid, token);
    }
  }
  return twilioClient;
}

// 🚀 START SERVER
async function startServer() {
  try {
    const app = express();
    const PORT = process.env.PORT || 5000;

    console.log("🚀 Starting server...");
    console.log("PORT:", PORT);

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // HEALTH CHECK
    app.get("/api/health", (req, res) => {
      res.json({ status: "ok", firebase: !!db });
    });

    // CREATE ORDER
    app.post("/api/orders", async (req, res) => {
      try {
        const { name, email, phone, address, plan } = req.body;

        const orderId = Math.random().toString(36).substring(2, 10);
        const qrId = Math.random().toString(36).substring(2, 10);

        const order = {
          id: orderId,
          name,
          email,
          phone,
          address,
          plan,
          qrId,
          status: "pending",
          createdAt: db
            ? new Date()
            : new Date().toISOString(),
        };

        const qrData = {
          id: qrId,
          registered: false,
          createdAt: db
            ? new Date()
            : new Date().toISOString(),
        };

        if (db) {
          await db.collection("orders").doc(orderId).set(order);
          await db.collection("qrs").doc(qrId).set(qrData);
        } else {
          console.warn("Firebase not initialized. Order not saved.");
        }

        res.json({ success: true, orderId, qrId });
      } catch (err) {
        console.error("Order error:", err);
        res.status(500).json({ error: "Order failed" });
      }
    });

    // QR CHECK
    app.get("/api/qr/:id", async (req, res) => {
      try {
        if (!db) return res.status(500).json({ error: "DB not connected" });

        const doc = await db.collection("qrs").doc(req.params.id).get();

        if (!doc.exists) {
          return res.status(404).json({ error: "QR not found" });
        }

        const qr = doc.data();
        res.json(qr);
      } catch (err) {
        res.status(500).json({ error: "Fetch failed" });
      }
    });

    // REGISTER QR
    app.post("/api/qr/:id/register", async (req, res) => {
      try {
        if (!db) return res.status(500).json({ error: "DB not connected" });

        const { ownerName, ownerPhone } = req.body;

        const ref = db.collection("qrs").doc(req.params.id);
        const doc = await ref.get();

        if (!doc.exists) {
          return res.status(404).json({ error: "QR not found" });
        }

        await ref.update({
          registered: true,
          ownerName,
          ownerPhone,
        });

        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: "Register failed" });
      }
    });

    // CALL (MOCK / EXOTEL)
    app.post("/api/qr/:id/call", async (req, res) => {
      try {
        if (!db) return res.status(500).json({ error: "DB not connected" });

        const { callerPhone } = req.body;

        const doc = await db.collection("qrs").doc(req.params.id).get();

        if (!doc.exists) {
          return res.status(404).json({ error: "Invalid QR" });
        }

        const qr: any = doc.data();

        console.log(`[CALL] ${callerPhone} → ${qr.ownerPhone}`);

        res.json({
          success: true,
          message: "Call simulated (add Exotel for real calls)",
        });
      } catch (err) {
        res.status(500).json({ error: "Call failed" });
      }
    });

    // STATIC / VITE
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(__dirname, "dist");
      app.use(express.static(distPath));

      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    // 🔥 START LISTENING
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("🔥 SERVER CRASH:", err);
  }
}

startServer();
