# Desarrollo 2 · corpus desarrollo-v7-1-catalogo (10 frases, catálogo propio) · NO es aceptación

Run https://github.com/valdivix-coder/norka/actions/runs/45923853986 · commit `efad13f` (instrucción `9aeb220e…`, la congelada; validador previo al último ajuste de alcance contradictorio) · artefacto 15165492608 (ZIP SHA-256 `69b75e08b06cbd8886e06cb695f32db512437bedfca062119ccdb22affe93717`). Lite fijo, sin respaldos, 10/10 válidas por brazo, 20 STOP, 0 fallos.

| Métrica (n = 10) | V6 | 7.1 |
|---|---:|---:|
| Principal / estricta bruta | 3 / 3 | 8 / 8 |
| Principal / estricta normalizada | 3 / 3 | 8 / 8 |
| Discrepancias por acción bruta / normalizada | 6 / 2 | 0 / 0 |
| Tasa Por revisar | 6/11 | 4/11 |
| Entrada / salida por solicitud | 2.784 / 89 | 3.042 / 112 |
| Mediana / p95 ms | 814 / 3.002 | 880,5 / 938 |

V6 usa ámbitos del catálogo estándar ausentes en este catálogo (Pagos y finanzas, Colegio, Trámites; anulados por su validador) y asigna El hogar a «comprar verduras» sin casa nombrada. 7.1 falla 3 (declara `alcance: ninguno` con fragmento «a las diez» tras una acción fechada; motivó el ajuste final del validador, que aplica la regla de herencia cuando hay fragmento literal) y 8 (petición al autor: nota correcta, pero borra persona y ámbito que la regla 2 manda conservar). Sin regresiones 7.1 frente a V6 en esta muestra.
