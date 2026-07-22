import fs from 'fs';
import path from 'path';

// Generate minimal valid PNG buffers for Chrome Extension icons
function createMinimalPNG(size) {
  // Simple 1x1 or sized RGBA PNG representation for extension placeholder
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${Math.floor(size * 0.25)}" fill="url(#grad)" />
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4F8CFF" />
        <stop offset="100%" stop-color="#8B5CF6" />
      </linearGradient>
    </defs>
    <text x="50%" y="55%" font-size="${Math.floor(size * 0.55)}" font-weight="bold" fill="#FFFFFF" text-anchor="middle" dominant-baseline="central">💡</text>
  </svg>`;
  return svg;
}

const iconsDir = path.join(process.cwd(), 'chrome-extension', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Write SVG icons (Chrome supports SVG icons or fallback PNG)
[16, 48, 128].forEach(size => {
  const svgContent = createMinimalPNG(size);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.svg`), svgContent);
});

console.log('Icons generated successfully.');
