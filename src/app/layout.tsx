import "./tokens.css";
import "./fuentes.css";
import { SalidaCapturaOffline } from "@/components/familia/SalidaCapturaOffline";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-CL">
      <body><SalidaCapturaOffline/>{children}</body>
    </html>
  );
}
