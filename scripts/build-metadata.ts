import fs from 'fs';
import path from 'path';

// Parse branding directly to avoid resolving SVG imports in node
const metadataRaw = fs.readFileSync(path.resolve(process.cwd(), 'src/branding/metadata.ts'), 'utf-8');
const brandingRaw = fs.readFileSync(path.resolve(process.cwd(), 'src/branding/Branding.ts'), 'utf-8');

// Extract values safely
const extractValue = (source: string, key: string) => {
  const match = source.match(new RegExp(`${key}:\\s*["\']([^"\']+)["\']`));
  return match ? match[1] : '';
};

const appName = extractValue(brandingRaw, 'applicationName');
const inst = extractValue(brandingRaw, 'institution');
const committee = extractValue(brandingRaw, 'committee');

const title = appName;
const description = `Official Plagiarism Checking system for ${inst} - ${committee}`;

const htmlPath = path.resolve(process.cwd(), 'index.html');
let html = fs.readFileSync(htmlPath, 'utf-8');

// Replace standard tags
html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
html = html.replace(/<link rel="icon".*?>/, `<link rel="icon" type="image/png" href="/src/branding/assets/favicon.png" />`);

// Replace or add OpenGraph tags
const ogTitle = `<meta property="og:title" content="${title}" />`;
const ogDesc = `<meta property="og:description" content="${description}" />`;
const ogImage = `<meta property="og:image" content="/src/branding/assets/dspg-logo.png" />`;

if (html.includes('og:title')) html = html.replace(/<meta property="og:title".*?>/, ogTitle);
else html = html.replace('</head>', `  ${ogTitle}\n</head>`);

if (html.includes('og:description')) html = html.replace(/<meta property="og:description".*?>/, ogDesc);
else html = html.replace('</head>', `  ${ogDesc}\n</head>`);

if (html.includes('og:image')) html = html.replace(/<meta property="og:image".*?>/, ogImage);
else html = html.replace('</head>', `  ${ogImage}\n</head>`);

// Add theme-color
const themeColor = `<meta name="theme-color" content="#1A2A6C" />`;
if (html.includes('theme-color')) html = html.replace(/<meta name="theme-color".*?>/, themeColor);
else html = html.replace('</head>', `  ${themeColor}\n</head>`);

fs.writeFileSync(htmlPath, html);

// Generate manifest.json
const manifest = {
  name: title,
  short_name: extractValue(brandingRaw, 'shortName') || 'DSPG',
  description: description,
  start_url: '/',
  display: 'standalone',
  background_color: '#ffffff',
  theme_color: '#1A2A6C',
  icons: [
    {
      src: '/src/branding/assets/favicon.png',
      sizes: '192x192',
      type: 'image/png'
    },
    {
      src: '/src/branding/assets/dspg-logo.png',
      sizes: '512x512',
      type: 'image/png'
    }
  ]
};

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}
fs.writeFileSync(path.join(publicDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

// Add manifest to index.html
if (!html.includes('manifest.json')) {
  html = html.replace('</head>', `  <link rel="manifest" href="/manifest.json" />\n</head>`);
  fs.writeFileSync(htmlPath, html);
}

console.log('Metadata built successfully.');
