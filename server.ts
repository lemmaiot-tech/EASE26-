import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import dotenv from "dotenv";
import cors from "cors";

// vite import is handled dynamically in startServer to avoid production dependency issues

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: process.env.VERCEL === '1' ? 1 : 10, // Limit connections on Vercel to avoid hitting Neon limits
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit to handle large base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));

let isDatabaseSetup = false;

// --- Database Setup ---
const setupDatabase = async () => {
  if (isDatabaseSetup) return;
  
  try {
    const client = await pool.connect();
    
    // Combine all table creations and migrations into one block to reduce round trips
    await client.query(`
      CREATE TABLE IF NOT EXISTS wedding_settings (
        id VARCHAR(50) PRIMARY KEY,
        groom_name TEXT NOT NULL,
        bride_name TEXT NOT NULL,
        wedding_date TIMESTAMPTZ NOT NULL,
        engagement_time TEXT,
        engagement_date TEXT,
        bride_family_name TEXT,
        groom_family_name TEXT,
        church_service_time TEXT,
        venue_name TEXT,
        venue_address TEXT,
        venue_map_url TEXT,
        reception_details TEXT,
        hashtag TEXT,
        rsvp_deadline TEXT,
        rsvp_phones TEXT[],
        hero_image_url TEXT,
        background_image_url TEXT,
        details_image_url TEXT,
        music_url TEXT,
        wallet_address TEXT,
        bank_details TEXT,
        footer_note TEXT,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS gallery (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS rsvps (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        attending TEXT NOT NULL,
        guests INTEGER NOT NULL,
        message TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        uid TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        role TEXT DEFAULT 'admin'
      );

      -- Migrations: Add missing columns if table already existed
      ALTER TABLE wedding_settings ADD COLUMN IF NOT EXISTS engagement_date TEXT;
      ALTER TABLE wedding_settings ADD COLUMN IF NOT EXISTS bride_family_name TEXT;
      ALTER TABLE wedding_settings ADD COLUMN IF NOT EXISTS groom_family_name TEXT;
      ALTER TABLE wedding_settings ADD COLUMN IF NOT EXISTS venue_map_url TEXT;
      ALTER TABLE wedding_settings ADD COLUMN IF NOT EXISTS footer_note TEXT;
      ALTER TABLE wedding_settings ADD COLUMN IF NOT EXISTS wallet_address TEXT;
      ALTER TABLE wedding_settings ADD COLUMN IF NOT EXISTS bank_details TEXT;
    `);

    client.release();
    isDatabaseSetup = true;
    console.log("Database tables verified/created");
  } catch (err) {
    console.error("Error setting up database:", err);
  }
};

// --- API Routes ---

// Start database setup
const setupPromise = setupDatabase();

// Middleware to ensure DB is ready before handling requests
app.use(async (req, res, next) => {
  try {
    await setupPromise;
    next();
  } catch (err) {
    console.error("Database initialization failed during request:", err);
    res.status(500).json({ error: "Database initialization failed" });
  }
});

// Health check
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "ok", time: result.rows[0].now, env: process.env.NODE_ENV });
  } catch (err) {
    console.error("Health check failed:", err);
    res.status(500).json({ status: "error", error: (err as Error).message });
  }
});

// Settings
app.get("/api/settings", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM wedding_settings WHERE id = 'main'");
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Settings not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post("/api/settings", async (req, res) => {
  const s = req.body;
  try {
    const query = `
      INSERT INTO wedding_settings (
        id, groom_name, bride_name, wedding_date, engagement_time, 
        engagement_date, bride_family_name, groom_family_name,
        church_service_time, venue_name, venue_address, venue_map_url,
        reception_details, hashtag, rsvp_deadline, rsvp_phones, 
        hero_image_url, background_image_url, details_image_url, 
        music_url, wallet_address, bank_details, footer_note, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        groom_name = EXCLUDED.groom_name,
        bride_name = EXCLUDED.bride_name,
        wedding_date = EXCLUDED.wedding_date,
        engagement_time = EXCLUDED.engagement_time,
        engagement_date = EXCLUDED.engagement_date,
        bride_family_name = EXCLUDED.bride_family_name,
        groom_family_name = EXCLUDED.groom_family_name,
        church_service_time = EXCLUDED.church_service_time,
        venue_name = EXCLUDED.venue_name,
        venue_address = EXCLUDED.venue_address,
        venue_map_url = EXCLUDED.venue_map_url,
        reception_details = EXCLUDED.reception_details,
        hashtag = EXCLUDED.hashtag,
        rsvp_deadline = EXCLUDED.rsvp_deadline,
        rsvp_phones = EXCLUDED.rsvp_phones,
        hero_image_url = EXCLUDED.hero_image_url,
        background_image_url = EXCLUDED.background_image_url,
        details_image_url = EXCLUDED.details_image_url,
        music_url = EXCLUDED.music_url,
        wallet_address = EXCLUDED.wallet_address,
        bank_details = EXCLUDED.bank_details,
        footer_note = EXCLUDED.footer_note,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const values = [
      'main', s.groom_name, s.bride_name, s.wedding_date, s.engagement_time,
      s.engagement_date, s.bride_family_name, s.groom_family_name,
      s.church_service_time, s.venue_name, s.venue_address, s.venue_map_url,
      s.reception_details, s.hashtag, s.rsvp_deadline, s.rsvp_phones, 
      s.hero_image_url, s.background_image_url, s.details_image_url, 
      s.music_url, s.wallet_address, s.bank_details, s.footer_note
    ];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Gallery
app.get("/api/gallery", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM gallery ORDER BY order_index ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post("/api/gallery", async (req, res) => {
  const { url, order_index } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO gallery (url, order_index) VALUES ($1, $2) RETURNING *",
      [url, order_index]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.delete("/api/gallery/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM gallery WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// RSVPs
app.get("/api/rsvps", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM rsvps ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post("/api/rsvps", async (req, res) => {
  const { name, email, attending, guests, message } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO rsvps (name, email, attending, guests, message) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, email, attending, guests, message]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.delete("/api/rsvps/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM rsvps WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.patch("/api/rsvps/:id", async (req, res) => {
  const { message } = req.body;
  try {
    await pool.query("UPDATE rsvps SET message = $1 WHERE id = $2", [message, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Seed Initial Data
app.post("/api/seed", async (req, res) => {
  try {
    const { settings, gallery, rsvps } = req.body;
    
    // Clear existing
    await pool.query("DELETE FROM rsvps");
    await pool.query("DELETE FROM gallery");
    await pool.query("DELETE FROM wedding_settings");

    // Seed Settings
    await pool.query(`
      INSERT INTO wedding_settings (
        id, groom_name, bride_name, wedding_date, engagement_time, 
        engagement_date, bride_family_name, groom_family_name,
        church_service_time, venue_name, venue_address, venue_map_url,
        reception_details, hashtag, rsvp_deadline, rsvp_phones, 
        hero_image_url, background_image_url, details_image_url, 
        music_url, wallet_address, bank_details, footer_note
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
    `, [
      'main', settings.groom_name, settings.bride_name, settings.wedding_date, settings.engagement_time,
      settings.engagement_date || '', settings.bride_family_name || '', settings.groom_family_name || '',
      settings.church_service_time, settings.venue_name, settings.venue_address, settings.venue_map_url || '',
      settings.reception_details, settings.hashtag, settings.rsvp_deadline, settings.rsvp_phones, 
      settings.hero_image_url, settings.background_image_url, settings.details_image_url, 
      settings.music_url, settings.wallet_address || '', settings.bank_details || '', settings.footer_note || ''
    ]);

    // Seed Gallery
    for (const img of gallery) {
      await pool.query("INSERT INTO gallery (url, order_index) VALUES ($1, $2)", [img.url, img.order]);
    }

    // Seed RSVPs
    for (const rsvp of rsvps) {
      await pool.query(
        "INSERT INTO rsvps (name, email, attending, guests, message) VALUES ($1, $2, $3, $4, $5)",
        [rsvp.name, rsvp.email, rsvp.attending, rsvp.guests, rsvp.message]
      );
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post("/api/login", (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.VITE_ADMIN_PASSWORD || "admin123";
  if (password === adminPassword) {
    res.json({ success: true, token: "dummy-token" });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

// Start server function
async function startServer() {
  await setupDatabase();

  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== "production") {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Only listen if this file is run directly and not in a serverless environment like Vercel
  const isVercel = process.env.VERCEL === '1';
  const isDirectRun = import.meta.url === `file://${process.argv[1]}` || (process.argv[1] && process.argv[1].endsWith('server.ts'));

  if (!isVercel && (isDirectRun || process.env.NODE_ENV === 'development')) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

startServer();

export default app;
