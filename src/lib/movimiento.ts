// Guía 9.1. Física compartida: el dedo mueve; el resorte actúa al soltar.
export function movimientoReducido() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
export function valorToken(nombre: string) {
  return parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(nombre),
  );
}
export function volverConResorte(
  elemento: HTMLElement,
  desplazamiento: number,
  fin?: () => void,
  eje: "X" | "Y" = "Y",
) {
  if (movimientoReducido()) {
    elemento.style.transform = "";
    fin?.();
    return () => {};
  }
  let x = desplazamiento,
    velocidad = 0,
    anterior = performance.now(),
    cuadro = 0;
  const inicio = anterior;
  const k = valorToken("--resorte-rigidez"),
    c = valorToken("--resorte-amortiguacion"),
    masa = valorToken("--resorte-masa");
  function paso(ahora: number) {
    const dt = Math.min((ahora - anterior) / 1000, 1 / 60);
    anterior = ahora;
    velocidad += ((-k * x - c * velocidad) / masa) * dt;
    x += velocidad * dt;
    elemento.style.transform = `translate${eje}(${x}px)`;
    if (
      (Math.abs(x) < 0.5 && Math.abs(velocidad) < 0.5) ||
      ahora - inicio >= valorToken("--mov-pantalla")
    ) {
      elemento.style.transform = "";
      fin?.();
    } else cuadro = requestAnimationFrame(paso);
  }
  cuadro = requestAnimationFrame(paso);
  return () => cancelAnimationFrame(cuadro);
}
