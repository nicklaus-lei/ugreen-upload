const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// 上传目录：容器里用 /data/uploads，对应 NAS 映射目录
const uploadDir = "/data/uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const ts = Date.now();
    cb(null, `${base}_${ts}${ext}`);
  },
});

const upload = multer({ storage });

app.post("/upload", upload.single("file"), (req, res) => {
  res.json({
    ok: true,
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`,
  });
});

app.get("/health", (req, res) => res.send("ok"));

app.listen(8080, () => {
  console.log("Server running on 8080");
});
