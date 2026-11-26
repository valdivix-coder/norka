import { type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Marca } from "@/components/marca/Marca";
import { AnilloAvance } from "@/components/AnilloAvance";
import {
  CampoTelefono,
  FilaDeslizable,
  Hoja,
  Opciones,
  Tema,
} from "@/components/Controles";
import { Comentarios, Reacciones } from "@/components/Conversacion";
import {
  Accion,
  Cabecera,
  CambioCasa,
  LineaTomas,
  Navegacion,
  TarjetaActividad,
  TarjetaSeViene,
  TarjetaToma,
  TiraEstadia,
} from "@/components/MuestrasInteractivas";
import {
  Avatar,
  BarraAvance,
  BotonesContacto,
  BotonesEntrada,
  FilaTarea,
  PastillaCasa,
  TarjetaAmbito,
} from "@/components/Piezas";
import {
  EncabezadoPantalla,
  MedallaLogro,
  PastillaConstancia,
} from "@/components/Indicadores";
import { ejemplos, muestra as m, mensajes } from "@/mensajes/es-CL";
import "./muestra.css";

export const metadata = {
  title: ejemplos.tituloMuestra + " · " + mensajes.marca,
};

function TarjetaMarca() {
  return (
    <section id="marca">
      <h2>{m.marca} · 3.5</h2>
      <div className="matriz">
        {(["noche", "lima", "claro", "una-tinta"] as const).map((fondo, j) =>
          (
            [
              "logotipo",
              "isotipo",
              "isotipo-reducido",
              "conjunto-vertical",
            ] as const
          ).map((pieza, i) => (
            <figure key={fondo + pieza} data-fondo={fondo}>
              <div className="area-marca">
                <div data-forma={pieza}>
                  <Marca fondo={fondo} pieza={pieza} />
                </div>
              </div>
              <figcaption>
                {m.piezas[i]} · {m.fondos[j]}
              </figcaption>
            </figure>
          )),
        )}
      </div>
    </section>
  );
}
function MarcaDelTema({ pieza }: { pieza: "logotipo" | "isotipo" }) {
  return (
    <>
      <span className="solo-oscuro">
        <Marca fondo="noche" pieza={pieza} />
      </span>
      <span className="solo-claro">
        <Marca fondo="claro" pieza={pieza} />
      </span>
    </>
  );
}

function Ficha({ numero, children }: { numero: number; children: ReactNode }) {
  return (
    <section id={`m${numero}`}>
      <h2>{`7.${numero} · ${m.secciones[numero - 1]}`}</h2>
      {children}
    </section>
  );
}

export default function Muestra() {
  return (
    <main className="muestra">
      <header className="principal-muestra">
        <small>{m.guia}</small>
        <h1>{m.titulo}</h1>
        <Tema />
      </header>
      <details>
        <summary>{ejemplos.indice}</summary>
        <nav aria-label={m.titulo} className="indice">
          {m.secciones.map((nombre, i) => (
            <Link
              key={nombre}
              href={`#m${i + 1}`}
            >{`7.${i + 1} · ${nombre}`}</Link>
          ))}
        </nav>
      </details>
      <Ficha numero={1}>
        <div className="opciones">
          <Hoja titulo={m.resolver}>
            <p>{m.tarea}</p>
          </Hoja>
          <Accion titulo={m.hecho} resultado={m.hecha} clase="hecho" />
        </div>
      </Ficha>
      <Ficha numero={2}>
        <div className="tarjeta lista">
          <FilaTarea
            titulo={m.cuota}
            detalle={m.plazo}
            accion={
              <Hoja titulo={m.pagar}>
                <p>{m.cuota}</p>
              </Hoja>
            }
          />
        </div>
      </Ficha>
      <Ficha numero={3}>
        <FilaDeslizable />
      </Ficha>
      <Ficha numero={4}>
        <div className="opciones">
          <AnilloAvance
            tamano="grande"
            nombre={m.familia}
            alDia={7}
            proximas={3}
            vencidas={2}
            destino="#m2"
          />
          <AnilloAvance
            tamano="mediano"
            nombre={m.persona}
            alDia={3}
            proximas={1}
            vencidas={0}
            persona={1}
            destino="#m2"
          />
        </div>
      </Ficha>
      <Ficha numero={5}>
        <TarjetaSeViene />
      </Ficha>
      <Ficha numero={6}>
        <TarjetaToma />
      </Ficha>
      <Ficha numero={7}>
        <div className="ambitos">
          <TarjetaAmbito
            tipo="colegio"
            titulo={m.colegio}
            cuenta={4}
            total={6}
            detalle={m.reunion}
          />
          <TarjetaAmbito
            tipo="salud"
            titulo={m.salud}
            cuenta={2}
            total={3}
            detalle={m.dentista}
          />
        </div>
      </Ficha>
      <Ficha numero={8}>
        <BarraAvance
          nombre={m.ana}
          actual={700000}
          total={900000}
          leyenda={m.pagado}
        />
      </Ficha>
      <Ficha numero={9}>
        <div className="opciones">
          <Avatar nombre={m.persona} />
          <Avatar nombre={m.ana} color={2} />
        </div>
      </Ficha>
      <Ficha numero={10}>
        <Opciones opciones={m.opciones} />
      </Ficha>
      <Ficha numero={11}>
        <Hoja titulo={m.proxima}>
          <Opciones opciones={m.plazos} />
          <p>{m.recordatorio}</p>
        </Hoja>
      </Ficha>
      <Ficha numero={12}>
        <Accion titulo={m.verAviso} resultado={m.hecha} />
      </Ficha>
      <Ficha numero={13}>
        <Navegacion />
      </Ficha>
      <Ficha numero={14}>
        <EncabezadoPantalla contexto={m.contexto} titulo={m.persona} />
      </Ficha>
      <Ficha numero={15}>
        <LineaTomas />
      </Ficha>
      <Ficha numero={16}>
        <Cabecera
          logotipo={<MarcaDelTema pieza="logotipo" />}
          isotipo={<MarcaDelTema pieza="isotipo" />}
        />
      </Ficha>
      <Ficha numero={17}>
        <TarjetaActividad />
      </Ficha>
      <Ficha numero={18}>
        <Reacciones />
      </Ficha>
      <Ficha numero={19}>
        <Hoja titulo={mensajes.comentar}>
          <Comentarios />
        </Hoja>
      </Ficha>
      <Ficha numero={20}>
        <MedallaLogro nombre={m.logro} familiar nueva />
      </Ficha>
      <Ficha numero={21}>
        <PastillaConstancia semanas={4} />
      </Ficha>
      <Ficha numero={22}>
        <BotonesContacto
          pedir={
            <Hoja titulo={m.pedir}>
              <CampoTelefono />
            </Hoja>
          }
        />
      </Ficha>
      <Ficha numero={23}>
        <CampoTelefono />
      </Ficha>
      <Ficha numero={24}>
        <>
          <p>{ejemplos.entradaDemo}</p>
          <BotonesEntrada
            configurados={[
              {
                nombre: "Google",
                iconoOficial: (
                  <Image
                    src="/proveedores/google.svg"
                    width={40}
                    height={40}
                    alt=""
                  />
                ),
              },
            ]}
          />
        </>
      </Ficha>
      <Ficha numero={25}>
        <PastillaCasa casas={[m.casaAna, m.casaPablo]} casa={m.casaAna} />
      </Ficha>
      <Ficha numero={26}>
        <TiraEstadia />
      </Ficha>
      <Ficha numero={27}>
        <CambioCasa />
      </Ficha>
      <Ficha numero={28}>
        <Comentarios inicial={ejemplos.notaPausa} />
      </Ficha>
      <TarjetaMarca />
    </main>
  );
}
