import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload temp directories exist
const tempUploadDir = path.resolve(__dirname, '../../uploads/temp');
const thumbnailsDir = path.resolve(__dirname, '../../uploads/thumbnails');
const gamesDir = path.resolve(__dirname, '../../uploads/games');

[tempUploadDir, thumbnailsDir, gamesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'thumbnail') {
      cb(null, thumbnailsDir);
    } else {
      cb(null, tempUploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'thumbnail') {
    const allowedImageExts = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedImageExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid thumbnail format. Allowed: JPG, PNG, WEBP, SVG'));
    }
  } else if (file.fieldname === 'gameFile') {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.zip') {
      cb(null, true);
    } else {
      cb(new Error('Invalid game file format. Only .ZIP archives are allowed'));
    }
  } else {
    cb(new Error(`Unexpected field: ${file.fieldname}`));
  }
};

export const uploadGameFiles = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max
  },
}).fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'gameFile', maxCount: 1 },
]);
