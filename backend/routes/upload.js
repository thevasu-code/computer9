const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '')),
});
const upload = multer({ storage });

// POST /upload - upload and optimize image
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const minWidth = 400;
    const minHeight = 400;
    const outputPath = filePath.replace(/(\.[\w]+)$/i, '-opt$1');
    await sharp(filePath)
      .resize({ width: minWidth, height: minHeight, fit: 'inside' })
      .toFile(outputPath);
    fs.unlinkSync(filePath); // Remove original
    res.json({ url: '/uploads/' + path.basename(outputPath) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
