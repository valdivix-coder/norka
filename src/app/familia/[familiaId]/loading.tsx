"use client";
import { useLayoutEffect } from "react";
import { Cargando } from "@/components/interfaz/Elementos";
import { pantallaCargando } from "@/lib/transicion";
export default function Loading() {
  useLayoutEffect(()=>pantallaCargando(),[]);
  return <Cargando/>;
}
