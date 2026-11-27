// Convierte artefactos sintéticos de DESARROLLO (salida de evals) en fixtures compactos para el laboratorio
// y para replay de validadores. Uso en CI: node scripts/exportar-fixtures-laboratorio.mjs <dir> <run> <artefacto> <nombre>
// No llama a ningún proveedor. Rechaza el corpus oficial. Conserva las capas tal como fueron producidas.
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
const [dir, run, artefacto, nombre] = process.argv.slice(2);
const CORPUS = { "desarrollo-v7-1": "evals/desarrollo-v7-1.json", "desarrollo-v7-1-catalogo": "evals/desarrollo-v7-1-catalogo.json", "desarrollo-v7-2": "evals/desarrollo-v7-2.json", "desarrollo-v7-2-tipos": "evals/desarrollo-v7-2-tipos.json" };
for (const f of readdirSync(dir)) {
  const bytes = readFileSync(dir + "/" + f); const j = JSON.parse(bytes);
  if (!(j.corpus in CORPUS)) throw new Error("CORPUS_NO_PERMITIDO_EN_REPLAY:" + j.corpus);
  const corpus = JSON.parse(readFileSync(CORPUS[j.corpus], "utf8"));
  const { casos, ...contexto } = corpus;
  const solicitud = (id, v) => (j.solicitudes ?? []).filter(s => s.id === id && s.version === v && !s.repeticion && s.intento?.resultado === "valida").at(-1)?.intento;
  const met = m => m && { principal: m.principal, estricta: m.estricta, porCampo: m.porCampo, omitidas: m.audit?.omitidas, extras: m.audit?.extras };
  const salida = {
    fuente: { tipo: "replay_real_gemini", run, artefacto, nombreArtefacto: nombre, archivo: f, sha256Json: createHash("sha256").update(bytes).digest("hex"), corpus: j.corpus, modo: j.resumen?.modo, modelo: j.resumen?.modelo, semilla: j.resumen?.semilla, versiones: j.resumen?.versiones, huellas: j.resumen?.huellas },
    contexto,
    casos: casos.map(c => ({ id: c.id, grupos: c.grupos ?? [], texto: c.texto, esperado: c.esperado,
      brazos: Object.fromEntries((j.resumen?.versiones ?? []).map(v => { const d = j.detalle.find(x => x.id === c.id && x.version === v); const s = solicitud(c.id, v);
        return [v, d ? { estado: d.estado, causa: d.causa ?? null, brutaInterna: d.brutaInterna ?? null, bruta: d.bruta ?? null, resultado: d.resultado ?? null, ajustes: d.ajustes ?? [], alertas: d.alertas ?? [], metricas: d.metricas ? { bruta: met(d.metricas.bruta), normalizada: met(d.metricas.normalizada) } : null, ms: s?.ms ?? null, tokensEntrada: s?.tokensEntrada ?? null, tokensSalida: s?.tokensSalida ?? null, finishReason: s?.finishReason ?? null } : { estado: "ausente" }]; })) })),
    resumen: Object.fromEntries(Object.entries(j.resumen?.brazos ?? {}).map(([v, b]) => [v, { principalBruta: b.principalBruta, estrictaBruta: b.estrictaBruta, principalNormalizada: b.principalNormalizada, estrictaNormalizada: b.estrictaNormalizada, validas: b.validas, total: b.total, medianaMs: b.medianaMs, consumo: b.consumo, tasaPorRevisar: b.tasaPorRevisar }])),
  };
  mkdirSync("src/laboratorio/fixtures", { recursive: true });
  writeFileSync(`src/laboratorio/fixtures/replay-${run}.json`, JSON.stringify(salida, null, 1) + "\n");
  console.log("FIXTURE", run, j.corpus, salida.fuente.sha256Json, salida.casos.length);
}
