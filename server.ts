import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase
let db: any = null;
try {
  const configPath = path.join(__dirname, "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    
    // Initialize Firebase Client SDK
    const firebaseApp = initializeApp(config);
    
    // Get Firestore instance for the specific database ID
    db = getFirestore(firebaseApp, config.firestoreDatabaseId);
    console.log("Firebase initialized successfully with project:", config.projectId, "and database:", config.firestoreDatabaseId);
  } else {
    console.warn("firebase-applet-config.json not found. Firebase not initialized.");
  }
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
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
        createdAt: db ? serverTimestamp() : new Date().toISOString()
      };
      
      const qrData = {
        id: qrId,
        registered: false,
        ownerName: null,
        ownerPhone: null,
        vehicleNumber: null,
        createdAt: db ? serverTimestamp() : new Date().toISOString()
      };
 
      if (db) {
        await setDoc(doc(db, "orders", orderId), order);
        await setDoc(doc(db, "qrs", qrId), qrData);
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
      
      const docSnap = await getDoc(doc(db, "qrs", req.params.id));
      if (!docSnap.exists()) {
        return res.status(404).json({ error: "QR Code not found" });
      }
      
      const qr = docSnap.data() as any;
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
      const docRef = doc(db, "qrs", req.params.id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return res.status(404).json({ error: "QR Code not found" });
      }
      
      const qr = docSnap.data() as any;
      if (qr.registered) {
        return res.status(400).json({ error: "QR Code is already registered" });
      }
 
      await updateDoc(docRef, {
        registered: true,
        ownerName,
        ownerPhone,
        vehicleNumber,
        registeredAt: serverTimestamp()
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
      const docSnap = await getDoc(doc(db, "qrs", req.params.id));
      
      if (!docSnap.exists()) {
        return res.status(404).json({ error: "Invalid or unregistered QR Code" });
      }
 
      const qr = docSnap.data() as any;
      if (!qr.registered) {
        return res.status(404).json({ error: "Invalid or unregistered QR Code" });
      }

      // EnableX Integration for Masked Calling
      const enablexAppId = process.env.ENABLEX_APP_ID;
      const enablexAppKey = process.env.ENABLEX_APP_KEY;
      const enablexVirtualNumber = process.env.ENABLEX_VIRTUAL_NUMBER;

      if (!enablexAppId || !enablexAppKey || !enablexVirtualNumber || enablexAppId === "your_enablex_app_id") {
        console.log(`[MOCK ENABLEX] Bridging call between ${callerPhone} and ${qr.ownerPhone}`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return res.json({ success: true, message: "Call initiated successfully. Your phone will ring shortly. (Mock Mode - Add EnableX credentials for real calls)" });
      }

      // Format numbers (EnableX expects E.164 format or standard country code without '+')
      const formatPhone = (p: string) => {
        const num = p.replace(/\D/g, '');
        // If it's a 10 digit Indian number, prefix with 91
        return num.length === 10 ? `+91${num}` : `+${num}`;
      };

      const fromNumber = formatPhone(callerPhone); // The person scanning
      const toNumber = formatPhone(qr.ownerPhone); // The vehicle owner

      console.log(`[ENABLEX] Initiating call to ${fromNumber} and bridging to ${toNumber}`);

      const authHeader = "Basic " + Buffer.from(`${enablexAppId}:${enablexAppKey}`).toString("base64");
      const enablexUrl = `https://api.enablex.io/voice/v1/calls`;

      const payload = {
        name: "Raabita Masked Call",
        owner_ref: qr.id,
        to: fromNumber,
        from: enablexVirtualNumber,
        action_on_connect: {
          connect: {
            from: enablexVirtualNumber,
            to: toNumber
          }
        }
        // In a real scenario, you would use EnableX webhooks to bridge the call after the first party answers.
        // For simplicity in this API call, we initiate the call to the scanner.
        // To bridge immediately, some APIs support a connect action directly:
        // action_on_connect: { connect: { from: enablexVirtualNumber, to: toNumber } }
      };

      const response = await fetch(enablexUrl, {
        method: "POST",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        res.json({ success: true, message: "Call initiated successfully. Your phone will ring shortly." });
      } else {
        console.error("[ENABLEX ERROR]", data);
        res.status(500).json({ error: "Failed to initiate call. Provider error." });
      }
    } catch (error: any) {
      console.error("[CALL ERROR]", error);
      res.status(500).json({ error: "Failed to initiate call. Please try again later." });
    }
  });

  // Admin route to see all QRs
  app.get("/api/admin/qrs", async (req, res) => {
    try {
      if (!db) return res.json([]);
      const q = query(collection(db, "qrs"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const qrs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
