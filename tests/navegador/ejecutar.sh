#!/usr/bin/env bash
set -euo pipefail
# Solo REST de prueba local. Nunca se utilizan credenciales ni URL de producción.
export SUPABASE_URL=https://127.0.0.1:3193 SUPABASE_PUBLISHABLE_KEY=qa-local SUPABASE_SECRET_KEY=qa-local
export NORKA_URL=http://127.0.0.1:3191
export NORKA_QA_OUT="${NORKA_QA_OUT:-/tmp/norka-evidencia}"
: "${NORKA_AXE:?Configura NORKA_AXE con axe-core local}"
test -f "$NORKA_AXE"
PYTHON="${NORKA_PYTHON:-python3}"
"$PYTHON" -c 'import playwright'
mkdir -p "$NORKA_QA_OUT"
tmp="$(mktemp -d)"
rest="" app=""
cleanup() {
  if [ -n "$app" ]; then kill "$app" 2>/dev/null || true; fi
  if [ -n "$rest" ]; then kill "$rest" 2>/dev/null || true; fi
  rm -rf "$tmp"
}
trap cleanup EXIT
openssl req -x509 -newkey rsa:2048 -nodes -keyout "$tmp/key.pem" -out "$tmp/cert.pem" -subj /CN=localhost -addext 'subjectAltName=DNS:localhost,IP:127.0.0.1' -days 1 >/dev/null 2>&1
"$PYTHON" tests/navegador/servidor_qa.py "$tmp/cert.pem" "$tmp/key.pem" > "$tmp/rest.log" 2>&1 &
rest=$!
export NODE_EXTRA_CA_CERTS="$tmp/cert.pem"
npm run build
node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3191 > "$tmp/next.log" 2>&1 &
app=$!
for i in $(seq 1 30); do if curl -fsS "$NORKA_URL/" >/dev/null 2>&1; then break; fi; sleep 1; done
curl -fsS "$NORKA_URL/" >/dev/null
"$PYTHON" tests/navegador/recorrido-autenticado.py
"$PYTHON" tests/navegador/catalogo.py

"$PYTHON" tests/navegador/captura.py
