const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
// 允许跨域
app.use(cors());

// 上传目录：容器里用 /data/uploads，对应 NAS 映射目录
const uploadDir = "/data/uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 解决 multer 1.x 在 Node.js 18+ 环境下处理中文文件名的乱码问题
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // 强制使用 UTF-8 编码读取原始文件名
    const originalname = Buffer.from(file.originalname, "latin1").toString(
      "utf8",
    );
    const ext = path.extname(originalname);
    const base = path.basename(originalname, ext);
    const ts = Date.now();
    cb(null, `${base}_${ts}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 500, // 限制 500MB
  },
});

app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, msg: "没有上传文件" });
  }

  res.json({
    ok: true,
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`,
  });
});

// 错误处理中间件 (必须放在所有路由之后)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ ok: false, msg: "文件太大，上限 500MB" });
    }
    return res.status(400).json({ ok: false, msg: err.message });
  }

  console.error("Server Error:", err);
  res.status(500).json({ ok: false, msg: "服务器内部错误" });
});

app.get("/api/health", (req, res) => res.send("ok"));

app.listen(8080, () => {
  console.log("Server running on 8080");
});
