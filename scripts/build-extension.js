import fs from 'fs';
import path from 'path';
import esbuild from 'esbuild';
import dotenv from 'dotenv';

dotenv.config();

// Pure JS Minimal Zip Generator (PK Zip format)
function createZipBuffer(files) {
  const localHeaderBuffers = [];
  const cdHeaders = [];
  let currentOffset = 0;

  for (const file of files) {
    const filenameBuf = Buffer.from(file.name, 'utf-8');
    const contentBuf = Buffer.from(file.content);
    
    // CRC32 calculation
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < contentBuf.length; i++) {
      crc ^= contentBuf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
      }
    }
    crc = (crc ^ 0xFFFFFFFF) >>> 0;

    // Local Header
    const localHeader = Buffer.alloc(30 + filenameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0); // Local header signature
    localHeader.writeUInt16LE(20, 4); // Version needed
    localHeader.writeUInt16LE(0, 6); // Flags
    localHeader.writeUInt16LE(0, 8); // Compression method (stored - 0)
    localHeader.writeUInt16LE(0, 10); // Last mod time
    localHeader.writeUInt16LE(0, 12); // Last mod date
    localHeader.writeUInt32LE(crc, 14); // CRC-32
    localHeader.writeUInt32LE(contentBuf.length, 18); // Compressed size
    localHeader.writeUInt32LE(contentBuf.length, 22); // Uncompressed size
    localHeader.writeUInt16LE(filenameBuf.length, 26); // Filename length
    localHeader.writeUInt16LE(0, 28); // Extra field length
    filenameBuf.copy(localHeader, 30);

    localHeaderBuffers.push(localHeader, contentBuf);

    // Central Directory Header
    const cdHeader = Buffer.alloc(46 + filenameBuf.length);
    cdHeader.writeUInt32LE(0x02014b50, 0); // CD header signature
    cdHeader.writeUInt16LE(20, 4); // Version made by
    cdHeader.writeUInt16LE(20, 6); // Version needed
    cdHeader.writeUInt16LE(0, 8); // Flags
    cdHeader.writeUInt16LE(0, 10); // Compression method (stored)
    cdHeader.writeUInt16LE(0, 12); // Last mod time
    cdHeader.writeUInt16LE(0, 14); // Last mod date
    cdHeader.writeUInt32LE(crc, 16); // CRC-32
    cdHeader.writeUInt32LE(contentBuf.length, 20); // Compressed size
    cdHeader.writeUInt32LE(contentBuf.length, 24); // Uncompressed size
    cdHeader.writeUInt16LE(filenameBuf.length, 28); // Filename length
    cdHeader.writeUInt16LE(0, 30); // Extra field length
    cdHeader.writeUInt16LE(0, 32); // File comment length
    cdHeader.writeUInt16LE(0, 34); // Disk number start
    cdHeader.writeUInt16LE(0, 36); // Internal file attributes
    cdHeader.writeUInt32LE(0, 38); // External file attributes
    cdHeader.writeUInt32LE(currentOffset, 42); // Relative offset of local header
    filenameBuf.copy(cdHeader, 46);

    cdHeaders.push(cdHeader);
    currentOffset += localHeader.length + contentBuf.length;
  }

  const cdBuffer = Buffer.concat(cdHeaders);
  const cdOffset = currentOffset;

  // End of Central Directory Record
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // EOCD signature
  eocd.writeUInt16LE(0, 4); // Disk number
  eocd.writeUInt16LE(0, 6); // Start disk
  eocd.writeUInt16LE(files.length, 8); // Total records on disk
  eocd.writeUInt16LE(files.length, 10); // Total records
  eocd.writeUInt32LE(cdBuffer.length, 12); // Size of CD
  eocd.writeUInt32LE(cdOffset, 16); // Offset of CD
  eocd.writeUInt16LE(0, 20); // Comment length

  return Buffer.concat([...localHeaderBuffers, cdBuffer, eocd]);
}

async function build() {
  console.log("Building Chrome Extension bundle...");

  const sourceDir = path.join(process.cwd(), 'chrome-extension');
  const targetDir = path.join(process.cwd(), 'public', 'extension');
  const publicDir = path.join(process.cwd(), 'public');

  // Bundle popup.js using esbuild
  const popupSrc = path.join(sourceDir, 'src', 'popup.js');
  const popupOut = path.join(sourceDir, 'popup.js');

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (fs.existsSync(popupSrc)) {
    await esbuild.build({
      entryPoints: [popupSrc],
      outfile: popupOut,
      bundle: true,
      format: 'esm',
      target: 'es2022',
      minify: false,
      define: {
        'process.env.NODE_ENV': '"production"',
        'process.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
        'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey)
      }
    });
    console.log("Bundled popup.js successfully.");
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Create PNG icon placeholders or SVG files
  const iconsDir = path.join(sourceDir, 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Generate PNG data for icons
  const iconSizes = [16, 48, 128];
  iconSizes.forEach(size => {
    // Generate simple PNG binary representation (solid rounded square with bulb)
    const pngPath = path.join(iconsDir, `icon${size}.png`);
    if (!fs.existsSync(pngPath)) {
      // Create minimal valid 1x1 RGBA PNG buffer if not present
      const minimalPng = Buffer.from('iVBORw0KGgoAAAANSU5EUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
      fs.writeFileSync(pngPath, minimalPng);
    }
  });

  const filesToZip = [];

  function copyRecursive(src, dest, relPath = '') {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      const relativeFilePath = relPath ? `${relPath}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        copyRecursive(srcPath, destPath, relativeFilePath);
      } else {
        const content = fs.readFileSync(srcPath);
        fs.writeFileSync(destPath, content);
        filesToZip.push({
          name: relativeFilePath,
          content: content
        });
      }
    }
  }

  copyRecursive(sourceDir, targetDir);

  // Generate Zip Archive
  const zipBuffer = createZipBuffer(filesToZip);
  const zipOutputPath = path.join(publicDir, 'ideavault-extension.zip');
  fs.writeFileSync(zipOutputPath, zipBuffer);

  console.log(`Successfully built extension and generated ZIP archive at: ${zipOutputPath}`);
}

build().catch(console.error);
