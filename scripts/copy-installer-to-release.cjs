/**
 * Post-build helper: list Windows installer(s) under release/ (optional copy targets).
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const releaseDir = path.join(root, "release");

if (!fs.existsSync(releaseDir)) {
  console.warn("[copy-installer-to-release] No release/ folder found. Run electron-builder first.");
  process.exit(0);
}

const names = fs.readdirSync(releaseDir);
const installers = names.filter((n) => /\.exe$/i.test(n) || n.endsWith(".msi"));

if (installers.length === 0) {
  console.log("[copy-installer-to-release] No .exe/.msi found in release/ (check electron-builder output).");
} else {
  console.log("[copy-installer-to-release] Built installer(s):");
  installers.forEach((n) => console.log("  ", path.join(releaseDir, n)));
}
