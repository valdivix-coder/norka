// Sección 3.6. Inkscape convierte el SVG de tienda en PNG conservando las máscaras.
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = fileURLToPath(new URL("../", import.meta.url));
function isotipo(archivo) {
  return readFileSync(join(raiz, "src/components/marca", archivo), "utf8")
    .replaceAll("TRAZO", "#A594FF")
    .replaceAll("PUNTO", "#C8F135");
}

const icono = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs><radialGradient id="luz" cx="0%" cy="0%" r="100%">
    <stop stop-color="#6A4BFF" stop-opacity=".55"/><stop offset="1" stop-color="#6A4BFF" stop-opacity="0"/>
  </radialGradient></defs>
  <rect width="1024" height="1024" fill="#0B0A1A"/><rect width="1024" height="1024" fill="url(#luz)"/>
  <svg x="18%" y="18%" width="64%" height="64%">${isotipo("isotipo-orbita.svg")}</svg>
</svg>`;

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
  <rect width="96" height="96" fill="#0B0A1A"/>${isotipo("isotipo-reducido.svg")}
</svg>\n`;
const temporal = mkdtempSync(join(tmpdir(), "norka-iconos-"));
try {
  const origen = join(temporal, "tienda.svg");
  const destino = join(temporal, "tienda.png");
  writeFileSync(origen, icono);
  execFileSync("inkscape", [origen, "--export-filename=" + destino]);
  writeFileSync(join(raiz, "public/icono-tienda.png"), readFileSync(destino));
  writeFileSync(join(raiz, "src/app/icon.svg"), favicon);
} finally {
  rmSync(temporal, { recursive: true, force: true });
}
