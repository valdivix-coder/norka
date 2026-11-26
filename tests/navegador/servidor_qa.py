"""REST de prueba local. Datos sintéticos, solo GET, sin conexión a Supabase real."""
import hashlib
import uuid
from threading import Lock
import json
import ssl
import sys
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

FAMILIA = "00000000-0000-4000-8000-000000000001"
CUENTA = "00000000-0000-4000-8000-000000000002"
PERSONA = "00000000-0000-4000-8000-000000000003"
HOGAR = "00000000-0000-4000-8000-000000000004"
TOKEN = "a" * 43
ahora = datetime.now(timezone.utc)
base = dict(familia_id=FAMILIA, cumple_dia=None, cumple_mes=None,
            anio_nacimiento=None, va_al_colegio=False, archivada_en=None, revision=0)
capturas = {}
lock = Lock()
tablas = {
    "tareas": [],
    "sesiones": [{"cuenta_id": CUENTA, "hash_token": hashlib.sha256(TOKEN.encode()).hexdigest(),
                  "creada_en": ahora.isoformat(), "caduca_en": (ahora+timedelta(days=1)).isoformat(),
                  "revocada_en": None}],
    "cuentas": [{"id": CUENTA, "nombre": "Cuenta de prueba", "correo": "qa@example.invalid"}],
    "identidades": [{"cuenta_id": CUENTA, "proveedor": "google", "sub": "solo-pruebas"}],
    "familias": [{"id": FAMILIA, "nombre": "Familia de prueba"}],
    "integrantes": [{"id": "00000000-0000-4000-8000-000000000005", "cuenta_id": CUENTA,
                     "familia_id": FAMILIA, "estado": "activo", "rol_familiar": "padre",
                     "rol_etiqueta": None, "permiso": "administrador", "participacion": "corresponsable",
                     "cuota_objetivo": 100, "color": "persona-1", "icono": "persona",
                     "cumple_dia": None, "cumple_mes": None, "telefono": None, "revision": 0,
                     "cuentas": {"nombre": "Cuenta de prueba"}, "familias": {"nombre": "Familia de prueba"}}],
    "personas_a_cargo": [
        dict(base, id=HOGAR, tipo="hogar", nombre="El hogar", color="ambito-hogar", icono="puerta"),
        dict(base, id=PERSONA, tipo="hija_hijo", nombre="Persona de prueba",
             color="persona-2", icono="persona", cumple_dia=12, cumple_mes=3)
    ],
    "ambitos": [
        {"id": f"00000000-0000-4000-8000-{n+100:012d}", "familia_id": FAMILIA,
         "nombre": nombre, "color": "ambito-"+color, "icono": icono,
         "orden": n, "exige_plazo": False, "revision": 0}
        for n, (nombre,color,icono) in enumerate([
            ("Salud","salud","cruz"), ("Colegio","colegio","birrete"),
            ("Pagos y finanzas","pagos","tarjeta"), ("Crianza diaria","crianza","corazon"),
            ("Hogar","hogar","puerta"), ("Mascotas","mascotas","huella"),
            ("Trámites","tramites","documento"), ("Compras","compras","bolsa")
        ])
    ]
}

class REST(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == "/rest/v1/rpc/editar_resultado_captura":
            d=json.loads(self.rfile.read(int(self.headers["Content-Length"])))
            with lock:
                t=next((x for x in tablas["tareas"] if x["id"]==d["p_tarea"] and x["captura_id"]==d["p_captura"] and x["revision"]==d["p_revision"] and x["estado"]=="pendiente"),None)
                if d["p_familia"]!=FAMILIA or d["p_cuenta"]!=CUENTA or t is None or t.get("capturas",{}).get("autor_id")!=tablas["integrantes"][0]["id"]:
                    self.send_error(409); return
                t["revision"]+=1
                if d["p_descartar"]:t["estado"]="descartada"
                else:t["titulo"]=d["p_titulo"]
                cuerpo=json.dumps(t).encode()
            self.send_response(200)
            self.send_header("Content-Type","application/json")
            self.send_header("Content-Length",str(len(cuerpo)))
            self.end_headers()
            self.wfile.write(cuerpo)
            return
        if self.path != "/rest/v1/rpc/guardar_captura":
            self.send_error(404); return
        d=json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        if d["p_familia"]!=FAMILIA or d["p_cuenta"]!=CUENTA:
            self.send_error(403); return
        with lock:
            cap=d["p_captura"]
            if cap not in capturas:
                tarea=str(uuid.uuid4())
                capturas[cap]=dict(d,tarea_id=tarea)
                tablas["tareas"].append(dict(id=tarea,familia_id=FAMILIA,titulo=d["p_texto"],revision=0,captura_id=cap,estado="pendiente",por_revisar="true",creado_en=datetime.now(timezone.utc).isoformat(),capturas={"autor_id":tablas["integrantes"][0]["id"],"estado":"pendiente"}))
            elif capturas[cap]["p_texto"]!=d["p_texto"]:
                self.send_error(409); return
            cuerpo=json.dumps(dict(captura_id=cap,tarea_id=capturas[cap]["tarea_id"])).encode()
        self.send_response(200)
        self.send_header("Content-Type","application/json")
        self.send_header("Content-Length",str(len(cuerpo)))
        self.end_headers()
        self.wfile.write(cuerpo)

    def do_GET(self):
        u = urlparse(self.path)
        tabla = u.path.removeprefix("/rest/v1/")
        if u.path != "/rest/v1/"+tabla or tabla not in tablas:
            self.send_error(404); return
        filas = tablas[tabla]
        for campo, valores in parse_qs(u.query).items():
            valor = valores[0]
            if valor.startswith("eq."):
                filas = [f for f in filas if str(f.get(campo)) == valor[3:]]
            elif valor == "is.null":
                filas = [f for f in filas if f.get(campo) is None]
        if tabla=="tareas" and parse_qs(u.query).get("order")==["creado_en.desc,id.desc"]:
            filas=sorted(filas,key=lambda f:(f["creado_en"],f["id"]),reverse=True)
        cuerpo = json.dumps(filas, ensure_ascii=False).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(cuerpo)))
        self.end_headers()
        self.wfile.write(cuerpo)

if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1",3193),REST)
    contexto = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    contexto.load_cert_chain(sys.argv[1],sys.argv[2])
    server.socket = contexto.wrap_socket(server.socket,server_side=True)
    server.serve_forever()
