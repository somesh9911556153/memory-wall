import express from "express";
import multer from "multer";
import mysql from "mysql2";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

/* Setup paths */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* App setup */
const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* MySQL connection */
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // change if needed
  password: "9911556153", // change if needed
  database: "memory_wall"
});
db.connect(err => {
  if (err) {
    console.error("MySQL connection error:", err);
    process.exit(1);
  }
  console.log("Connected to MySQL");
});

/* Multer setup */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

/* Routes */

// Get all posts
app.get("/api/posts", (req, res) => {
  db.query("SELECT * FROM posts ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ error: "DB fetch error" });
    res.json(results);
  });
});

// Add a post
app.post("/api/posts", upload.single("file"), (req, res) => {
  const { name, message } = req.body;
  let file_url = null;
  let file_type = null;

  if (req.file) {
    file_url = `/uploads/${req.file.filename}`;
    file_type = req.file.mimetype.startsWith("image") ? "image" : "video";
  }

  db.query(
    "INSERT INTO posts (name, message, file_url, file_type) VALUES (?, ?, ?, ?)",
    [name || null, message, file_url, file_type],
    (err) => {
      if (err) return res.status(500).json({ error: "Insert failed" });
      res.json({ message: "Post created" });
    }
  );
});

// Like a post
app.post("/api/posts/:id/like", (req, res) => {
  const { id } = req.params;
  db.query(
    "UPDATE posts SET likes = IFNULL(likes,0) + 1 WHERE id = ?",
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to like" });
      res.json({ message: "Liked" });
    }
  );
});

// Delete a post
app.delete("/api/posts/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT file_url FROM posts WHERE id = ?", [id], (err, rows) => {
    if (err) return res.status(500).json({ error: "Find failed" });
    if (!rows.length) return res.status(404).json({ error: "Not found" });

    const filePath = rows[0].file_url
      ? path.join(__dirname, rows[0].file_url)
      : null;
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    db.query("DELETE FROM posts WHERE id = ?", [id], (err2) => {
      if (err2) return res.status(500).json({ error: "Delete failed" });
      res.json({ message: "Deleted" });
    });
  });
});

/* Start server */
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
