import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import twilio from "twilio";
import admin from "firebase-admin";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
try {
  const serviceAccountPath = path.join(__dirname, "service-account.json");
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin initialized successfully.");
  } else {
    console.warn("service-account.json not found. Firebase Admin not initialized.");
  }
} catch (error) {
  console.error("Failed to initialize Firebase Admin:", error);
}

const db = admin.apps.length ? admin.firestore() : null;

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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", firebase: !!db });
  });

  // 1. User buys a plan
  app.post("/api/orders", async (req, res) => {
    try {
      const { name, email, phone, address, plan, paymentMethod, walletAddress } = req.body;
      const orderId = Math.random().toString(36).substring(2, 10);
      const qrId = Math.random().toString(36).substring(2, 10); // Generate a QR code ID for this order
      
      const order = { 
        id: orderId, name, email, phone, address, plan, qrId, 
        paymentMethod: paymentMethod || "card",
        walletAddress: walletAddress || null,
        status: "pending",
        createdAt: db ? admin.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
      };
      
      const qrData = {
        id: qrId,
        registered: false,
        ownerName: null,
        ownerPhone: null,
        vehicleNumber: null,
        createdAt: db ? admin.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
      };

      if (db) {
        await db.collection("orders").doc(orderId).set(order);
        await db.collection("qrs").doc(qrId).set(qrData);
      } else {
        console.warn("Firebase not initialized. Order not saved to DB.");
      }

      res.json({ success: true, orderId, qrId });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // 2. Check QR status (when someone scans it)
  app.get("/api/qr/:id", async (req, res) => {
    try {
      if (!db) return res.status(500).json({ error: "Database not connected" });
      
      const doc = await db.collection("qrs").doc(req.params.id).get();
      if (!doc.exists) {
        return res.status(404).json({ error: "QR Code not found" });
      }
      
      const qr = doc.data() as any;
      // Don't send the owner's phone number to the client for privacy
      const safeQr = {
        id: qr.id,
        registered: qr.registered,
        ownerName: qr.ownerName,
        vehicleNumber: qr.vehicleNumber,
      };
      res.json(safeQr);
    } catch (error) {
      console.error("Error fetching QR:", error);
      res.status(500).json({ error: "Failed to fetch QR code" });
    }
  });

  // 3. Register QR code (owner scans it for the first time)
  app.post("/api/qr/:id/register", async (req, res) => {
    try {
      if (!db) return res.status(500).json({ error: "Database not connected" });

      const { ownerName, ownerPhone, vehicleNumber } = req.body;
      const docRef = db.collection("qrs").doc(req.params.id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        return res.status(404).json({ error: "QR Code not found" });
      }
      
      const qr = doc.data() as any;
      if (qr.registered) {
        return res.status(400).json({ error: "QR Code is already registered" });
      }

      await docRef.update({
        registered: true,
        ownerName,
        ownerPhone,
        vehicleNumber,
        registeredAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      res.json({ success: true, qr: { ...qr, registered: true, ownerName, ownerPhone, vehicleNumber } });
    } catch (error) {
      console.error("Error registering QR:", error);
      res.status(500).json({ error: "Failed to register QR code" });
    }
  });

  // 4. Initiate masked call (someone scans a registered QR)
  app.post("/api/qr/:id/call", async (req, res) => {
    try {
      if (!db) return res.status(500).json({ error: "Database not connected" });

      const { callerPhone } = req.body;
      const doc = await db.collection("qrs").doc(req.params.id).get();
      
      if (!doc.exists) {
        return res.status(404).json({ error: "Invalid or unregistered QR Code" });
      }

      const qr = doc.data() as any;
      if (!qr.registered) {
        return res.status(404).json({ error: "Invalid or unregistered QR Code" });
      }

      // Exotel Integration (Best for Masked Calling in India)
      const exotelSid = process.env.EXOTEL_ACCOUNT_SID;
      const exotelKey = process.env.EXOTEL_API_KEY;
      const exotelToken = process.env.EXOTEL_API_TOKEN;
      const exotelCallerId = process.env.EXOTEL_VIRTUAL_NUMBER;

      if (!exotelSid || !exotelKey || !exotelToken || !exotelCallerId || exotelSid === "your_exotel_account_sid") {
        console.log(`[MOCK EXOTEL] Bridging call between ${callerPhone} and ${qr.ownerPhone}`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return res.json({ success: true, message: "Call initiated successfully. Your phone will ring shortly. (Mock Mode - Add Exotel credentials for real calls)" });
      }

      // Format numbers (Exotel expects numbers without '+' usually, or standard E.164. Let's strip non-digits)
      const formatPhone = (p: string) => {
        const num = p.replace(/\D/g, '');
        // If it's a 10 digit Indian number, prefix with 0 as per Exotel standard
        return num.length === 10 ? `0${num}` : num;
      };

      const fromNumber = formatPhone(callerPhone);
      const toNumber = formatPhone(qr.ownerPhone);

      console.log(`[EXOTEL] Initiating call from ${fromNumber} to ${toNumber}`);

      const authHeader = "Basic " + Buffer.from(`${exotelKey}:${exotelToken}`).toString("base64");
      const exotelUrl = `https://api.exotel.com/v1/Accounts/${exotelSid}/Calls/connect.json`;

      const formData = new URLSearchParams();
      formData.append("From", fromNumber);
      formData.append("To", toNumber);
      formData.append("CallerId", exotelCallerId);

      const response = await fetch(exotelUrl, {
        method: "POST",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString()
      });

      const data = await response.json();

      if (response.ok && data.Call) {
        res.json({ success: true, message: "Call initiated successfully. Your phone will ring shortly." });
      } else {
        console.error("[EXOTEL ERROR]", data);
        res.status(500).json({ error: "Failed to initiate call. Provider error." });
      }
    } catch (error: any) {
      console.error("[CALL ERROR]", error);
      res.status(500).json({ error: "Failed to initiate call. Please try again later." });
    }
  });

  // 5. TwiML Bridge Endpoint (Twilio webhook)
  app.post("/api/twiml/bridge/:id", async (req, res) => {
    try {
      const twiml = new twilio.twiml.VoiceResponse();
      
      if (!db) {
        twiml.say("System error. Database not connected.");
        res.type('text/xml');
        return res.send(twiml.toString());
      }

      const doc = await db.collection("qrs").doc(req.params.id).get();
      const qr = doc.exists ? doc.data() as any : null;
      
      if (qr && qr.registered) {
        twiml.say("Connecting you to the vehicle owner. Please wait.");
        twiml.dial({ callerId: process.env.TWILIO_PHONE_NUMBER }, qr.ownerPhone);
      } else {
        twiml.say("Sorry, this vehicle is not registered or the QR code is invalid.");
      }
      
      res.type('text/xml');
      res.send(twiml.toString());
    } catch (error) {
      console.error("TwiML Error:", error);
      const twiml = new twilio.twiml.VoiceResponse();
      twiml.say("An error occurred while connecting your call.");
      res.type('text/xml');
      res.send(twiml.toString());
    }
  });

  // Admin route to see all QRs
  app.get("/api/admin/qrs", async (req, res) => {
    try {
      if (!db) return res.json([]);
      const snapshot = await db.collection("qrs").orderBy("createdAt", "desc").get();
      const qrs = snapshot.docs.map(doc => doc.data());
      res.json(qrs);
    } catch (error) {
      console.error("Error fetching admin QRs:", error);
      res.status(500).json({ error: "Failed to fetch QRs" });
    }
  });

  // Admin route to see all Orders
  app.get("/api/admin/orders", async (req, res) => {
    try {
      if (!db) return res.json([]);
      const snapshot = await db.collection("orders").orderBy("createdAt", "desc").get();
      const orders = snapshot.docs.map(doc => doc.data());
      res.json(orders);
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
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
    const distPath = path.join(__dirname, "dist");
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
