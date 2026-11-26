import path from "node:path";

// El núcleo solo depende de sí mismo. Zod pertenece a core/contracts (9.1).
const fronteras = {
  meta: {
    type: "problem",
    schema: [],
    messages: {
      frontera: "El núcleo no puede importar {{modulo}}. Usa un puerto de src/core/ports.",
      dinamica: "La dependencia del núcleo debe tener una ruta literal verificable.",
    },
  },
  create(context) {
    const core = path.resolve(context.cwd, "src/core");
    const archivo = context.filename;

    function revisar(nodo) {
      const modulo = nodo.value;
      if (typeof modulo !== "string") {
        context.report({ node: nodo, messageId: "dinamica" });
        return;
      }

      if (modulo === "zod" && archivo.startsWith(path.join(core, "contracts") + path.sep)) {
        return;
      }

      let destino;
      if (modulo.startsWith(".")) {
        destino = path.resolve(path.dirname(archivo), modulo);
      } else if (modulo.startsWith("@/")) {
        destino = path.resolve(context.cwd, "src", modulo.slice(2));
      }

      if (destino === core || destino?.startsWith(core + path.sep)) {
        return;
      }

      context.report({ node: nodo, messageId: "frontera", data: { modulo } });
    }

    return {
      ImportDeclaration(nodo) { revisar(nodo.source); },
      ExportNamedDeclaration(nodo) { if (nodo.source) revisar(nodo.source); },
      ExportAllDeclaration(nodo) { revisar(nodo.source); },
      ImportExpression(nodo) { revisar(nodo.source); },
      TSImportType(nodo) { revisar(nodo.source); },
      TSExternalModuleReference(nodo) { revisar(nodo.expression); },
      CallExpression(nodo) {
        if (nodo.callee.type === "Identifier" && nodo.callee.name === "require") {
          revisar(nodo.arguments[0] ?? nodo);
        }
      },
    };
  },
};

export default fronteras;
