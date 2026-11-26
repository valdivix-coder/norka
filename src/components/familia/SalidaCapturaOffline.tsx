"use client";
import {useEffect} from "react";
import {escucharSalidaCaptura} from "@/data/captura-offline-web";
export function SalidaCapturaOffline(){useEffect(()=>escucharSalidaCaptura(),[]);return null;}
