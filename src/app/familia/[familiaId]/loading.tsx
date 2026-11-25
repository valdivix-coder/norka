"use client";
import { useLayoutEffect } from "react";
import { Cargando } from "@/components/interfaz/Elementos";
import { pantallaLista } from "@/lib/transicion";
export default function Loading() {
  useLayoutEffect(()=>pantallaLista(),[]);
  return <Cargando/>;
}
