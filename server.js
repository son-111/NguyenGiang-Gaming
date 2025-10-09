// ======================================================
// 🚀 NguyenGiang Gaming - Server Express + Supabase
// ======================================================

import express from "express";
import cors from "cors";


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("./"));
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// ⚙️ Config Supabase
const SUPABASE_URL = "https://sblbnucttjbynhjhtsej.supabase.co/rest/v1";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNibGJudWN0dGpieW5oamh0c2VqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTk1NTE1MiwiZXhwIjoyMDc1NTMxMTUyfQ.MgfB0g6O_kkGxIsMoib0f9nH9NOo3MMHdqVlJ397MDk"; // service_role key của bạn

// ======================================================
// 📥 API LẤY DỮ LIỆU
// ======================================================
app.get("/api/data", async (req, res) => {
  try {
    const resp = await fetch(`${SUPABASE_URL}/store?id=eq.main&select=*`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });

    const data = await resp.json();

    if (data.length > 0) {
      res.json(data[0].json);
    } else {
      res.json({ status: "ONLINE", items: {}, texts: {} });
    }
  } catch (err) {
    console.error("❌ Lỗi đọc Supabase:", err);
    res.status(500).json({ error: "Không thể đọc dữ liệu" });
  }
});

// ======================================================
// 💾 API GHI DỮ LIỆU
// ======================================================
app.post("/api/data", async (req, res) => {
  try {
    // Lấy dữ liệu cũ
    const respOld = await fetch(`${SUPABASE_URL}/store?id=eq.main&select=*`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    const oldDataArr = await respOld.json();

    let current = { status: "ONLINE", items: {}, texts: {} };
    if (oldDataArr.length > 0) {
      current = oldDataArr[0].json;
    }

    // Gộp dữ liệu mới
    const merged = {
      status: req.body.status ?? current.status,
      items: { ...current.items, ...(req.body.items || {}) },
      texts: { ...current.texts, ...(req.body.texts || {}) },
    };

    // Ghi lại vào Supabase
    await fetch(`${SUPABASE_URL}/store`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify([{ id: "main", json: merged }]),
    });

    console.log("✅ Đã lưu vào Supabase:", merged);
    res.json(merged);
  } catch (err) {
    console.error("❌ Không thể ghi Supabase:", err);
    res.status(500).json({ error: "Không thể ghi dữ liệu" });
  }
});

// ======================================================
// 🧾 API DEBUG
// ======================================================
app.get("/api/debug", async (req, res) => {
  try {
    const resp = await fetch(`${SUPABASE_URL}/store?id=eq.main&select=*`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    const data = await resp.json();
    res.type("application/json").send(data.length > 0 ? data[0].json : "{}");
  } catch (err) {
    console.error("❌ Debug lỗi:", err);
    res.status(500).send("{}");
  }
});

// ======================================================
// 🚀 START SERVER
// ======================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Server chạy tại: http://localhost:${PORT}`)
);
