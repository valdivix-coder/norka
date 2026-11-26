"use client";
import { useRef, useState } from "react";
import { mensajes, muestra as m } from "@/mensajes/es-CL";
import { palabrasDePausa } from "@/mensajes/palabras-de-pausa";

export function SelectorReacciones({
  admiteRisa,
  elegir,
}: {
  admiteRisa: boolean;
  elegir: (nombre: string) => void;
}) {
  return (
    <div className="reacciones">
      {mensajes.reacciones
        .slice(0, admiteRisa ? 5 : 4)
        .map(({ nombre, emoji }) => (
          <button
            key={nombre}
            aria-label={m.apoyo(nombre)}
            onClick={() => elegir(nombre)}
          >
            {emoji}
          </button>
        ))}
    </div>
  );
}

export function Reacciones({ admiteRisa = true }: { admiteRisa?: boolean }) {
  const [elegida, elegir] = useState("");
  return (
    <>
      <SelectorReacciones
        admiteRisa={admiteRisa}
        elegir={(nombre) => elegir(nombre === elegida ? "" : nombre)}
      />
      <small role="status">{elegida}</small>
    </>
  );
}

function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}
function requierePausa(texto: string) {
  const letras = texto.match(/\p{L}/gu) ?? [];
  if (
    letras.length > 12 &&
    letras.filter((letra) => /\p{Lu}/u.test(letra)).length / letras.length > 0.7
  )
    return true;
  const limpio = normalizar(texto);
  return palabrasDePausa.some((palabra) =>
    new RegExp(
      `(?:^|[^\\p{L}\\p{N}])${normalizar(palabra)}(?:$|[^\\p{L}\\p{N}])`,
      "u",
    ).test(limpio),
  );
}

export function Pausa({
  revisar,
  enviar,
}: {
  revisar: () => void;
  enviar: () => void;
}) {
  return (
    <aside className="tarjeta">
      <p>{m.pausa}</p>
      <div className="opciones">
        <button className="principal" onClick={revisar}>
          {m.revisar}
        </button>
        <button onClick={enviar}>{m.enviarIgual}</button>
      </div>
    </aside>
  );
}

export function Comentarios({ inicial = "" }: { inicial?: string }) {
  const [texto, cambiar] = useState(inicial);
  const [lista, guardar] = useState<string[]>([]);
  const [pausa, preguntar] = useState(false);
  const [primera, mostrar] = useState(true);
  const campo = useRef<HTMLInputElement>(null);
  function enviar() {
    if (texto.trim()) guardar([...lista, texto]);
    cambiar("");
    preguntar(false);
    campo.current?.focus();
  }
  return (
    <div>
      {lista.map((valor, i) => (
        <p className="burbuja" key={i}>
          {valor}
        </p>
      ))}
      {primera && (
        <p>
          {m.bienvenida}{" "}
          <button onClick={() => mostrar(false)}>{m.entendido}</button>
        </p>
      )}
      {pausa && (
        <Pausa
          revisar={() => {
            preguntar(false);
            campo.current?.focus();
          }}
          enviar={enviar}
        />
      )}
      <form
        className="comentario"
        onSubmit={(e) => {
          e.preventDefault();
          if (requierePausa(texto)) preguntar(true);
          else enviar();
        }}
      >
        <input
          aria-label={m.escribir}
          placeholder={m.escribir}
          ref={campo}
          maxLength={500}
          value={texto}
          onChange={(e) => {
            cambiar(e.target.value);
            preguntar(false);
          }}
        />
        {texto.trim() && <button className="hecho">{m.enviar}</button>}
      </form>
    </div>
  );
}
