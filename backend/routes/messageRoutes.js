const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { protect } = require("../middleware/authMiddleware");
const { sendMessage, allMessages } = require("../controllers/messageControllers");

// -------- Ensure uploads folder exists --------
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📂 Created uploads folder");
}

// -------- Multer storage setup --------
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir); // backend/uploads absolute path
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// -------- Upload endpoint --------
router.post("/upload", protect, upload.single("file"), (req, res) => {
  console.log("📥 Upload request received");

  if (!req.file) {
    console.log("❌ No file uploaded");
    return res.status(400).json({ message: "No file uploaded" });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  console.log("✅ File saved:", fileUrl);

  res.json({
    fileUrl,
    fileName: req.file.originalname,
    fileType: req.file.mimetype,
    fileSize: req.file.size,
  });
});

// -------- Message routes --------
router.post("/", protect, sendMessage); // text/file message
router.get("/:chatId", protect, allMessages); // fetch messages

module.exports = router;
