import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gamesRootDir = path.resolve(__dirname, '../../uploads/games');

/**
 * Safely extracts and validates a game ZIP archive.
 * Protects against Zip Slip (path traversal) attacks and ensures index.html is present.
 *
 * @param {string} zipFilePath Absolute path to the uploaded ZIP file
 * @param {string} gameId Unique identifier for the game directory
 * @returns {Promise<{ relativeGameUrl: string, extractedPath: string }>}
 */
export const extractAndValidateGameZip = async (zipFilePath, gameId) => {
  const targetDir = path.resolve(gamesRootDir, gameId.toString());

  // Ensure clean target directory
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
  fs.mkdirSync(targetDir, { recursive: true });

  try {
    const zip = new AdmZip(zipFilePath);
    const zipEntries = zip.getEntries();

    if (!zipEntries || zipEntries.length === 0) {
      throw new Error('The uploaded ZIP archive is empty');
    }

    let hasIndexHtml = false;
    let indexHtmlRelativePath = '';

    // Step 1: Validate all entries against Zip Slip before extraction
    for (const entry of zipEntries) {
      const entryName = entry.entryName;
      const normalizedPath = path.normalize(entryName).replace(/^(\.\.[\/\\])+/, '');
      const destinationPath = path.resolve(targetDir, normalizedPath);

      // Verify that the destination path is inside targetDir
      if (!destinationPath.startsWith(targetDir)) {
        throw new Error(`Security Violation: Illegal path in ZIP archive (${entryName})`);
      }

      // Check for index.html
      const entryBase = path.basename(entryName).toLowerCase();
      if (entryBase === 'index.html' && !entry.isDirectory) {
        if (!hasIndexHtml || entryName.split('/').length < indexHtmlRelativePath.split('/').length) {
          hasIndexHtml = true;
          indexHtmlRelativePath = normalizedPath;
        }
      }
    }

    if (!hasIndexHtml) {
      throw new Error('Game archive must contain an "index.html" entry point file');
    }

    // Step 2: Extract verified entries safely
    for (const entry of zipEntries) {
      const normalizedPath = path.normalize(entry.entryName).replace(/^(\.\.[\/\\])+/, '');
      const destPath = path.resolve(targetDir, normalizedPath);

      if (entry.isDirectory) {
        fs.mkdirSync(destPath, { recursive: true });
      } else {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        const content = entry.getData();
        fs.writeFileSync(destPath, content);
      }
    }

    // Remove temporary uploaded ZIP file
    if (fs.existsSync(zipFilePath)) {
      fs.unlinkSync(zipFilePath);
    }

    // Format relative URL for browser consumption
    // Replace windows backslashes with forward slashes for URLs
    const formattedRelPath = indexHtmlRelativePath.replace(/\\/g, '/');
    const relativeGameUrl = `/uploads/games/${gameId}/${formattedRelPath}`;

    return {
      relativeGameUrl,
      extractedPath: targetDir,
    };
  } catch (error) {
    // Clean up extracted directory on error
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }
    // Clean up temporary ZIP
    if (fs.existsSync(zipFilePath)) {
      fs.unlinkSync(zipFilePath);
    }
    throw error;
  }
};

/**
 * Remove game directory and its assets
 */
export const deleteGameFiles = (gameId) => {
  const targetDir = path.resolve(gamesRootDir, gameId.toString());
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
};

/**
 * Remove thumbnail file
 */
export const deleteThumbnailFile = (thumbnailPath) => {
  if (!thumbnailPath) return;
  const filename = path.basename(thumbnailPath);
  const fullPath = path.resolve(__dirname, '../../uploads/thumbnails', filename);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};
