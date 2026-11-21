import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { palabrasProhibidas } from "../../src/mensajes/palabras-prohibidas.ts";
import { mensajes } from "../../src/mensajes/es-CL.ts";

it.each(["logotipo.svg", "isotipo-orbita.svg", "isotipo-reducido.svg"])(
  "conserva intacto el archivo de marca %s",
  (archivo) => {
    expect(readFileSync(`src/components/marca/${archivo}`)).toEqual(
      readFileSync(`docs/marca/svg/${archivo}`),
    );
  },
);
it("conserva el orden y las cinco reacciones de apoyo de 7.18", () => {
  expect(mensajes.reacciones.map((r) => r.nombre)).toEqual([
    "Bien",
    "Gracias",
    "Fuerza",
    "Celebro",
    "Me hizo reír",
  ]);
});
it("revisa el vocabulario de interfaz con las palabras completas de 6.19", () => {
  const fuente = readFileSync(
    "src/mensajes/es-CL.ts",
    "utf8",
  ).toLocaleLowerCase("es-CL");
  for (const palabra of palabrasProhibidas) {
    expect(fuente).not.toMatch(
      new RegExp(`(?:^|[^\\p{L}])${palabra}(?:$|[^\\p{L}])`, "u"),
    );
  }
});
