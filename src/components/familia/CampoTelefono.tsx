"use client";
import { useState } from "react";
import { interfaz as m } from "@/mensajes/es-CL";
import s from "@/components/interfaz/interfaz.module.css";

// Prefijo «+56 9» fijo dentro del campo; la persona escribe solo los 8 dígitos (6.16).
// «Otro país» cambia a un número internacional completo.
export function CampoTelefono({
  modoInicial = "chile",
  valorInicial = "",
}: {
  modoInicial?: "chile" | "otro";
  valorInicial?: string;
}) {
  const [modo, cambiarModo] = useState(modoInicial);
  const [valor, escribir] = useState(valorInicial);
  const chile = modo === "chile";
  return (
    <div className={s.campo}>
      <span id="rotulo-telefono">{m.telefono}</span>
      <input type="hidden" name="tel_modo" value={modo} />
      <span className={`${s.entradaCampo} ${s.telefono}`}>
        {chile && <span>{m.prefijo}</span>}
        <input
          name="tel_valor"
          aria-labelledby="rotulo-telefono"
          aria-describedby="ayuda-telefono"
          inputMode={chile ? "numeric" : "tel"}
          autoComplete="tel-national"
          maxLength={chile ? 8 : 20}
          placeholder={chile ? "1234 5678" : "+1 415 555 2671"}
          value={valor}
          onChange={(e) =>
            escribir(chile ? e.target.value.replace(/\D/g, "") : e.target.value)
          }
        />
      </span>
      <p className={s.suave} id="ayuda-telefono">
        {m.telefonoAyuda}
      </p>
      <button
        type="button"
        className={`${s.boton} ${s.texto}`}
        onClick={() => {
          escribir("");
          cambiarModo(chile ? "otro" : "chile");
        }}
      >
        {chile ? m.otroPais : m.chile}
      </button>
    </div>
  );
}
