# Auditoría independiente V7.0 · 26-nov-2026

**PUNTO DE PARADA: no integrar V7.1 del encargo ni iniciar A/B.** El paquete del ingeniero se recibió íntegro en el commit 78a37c6; no se duplicó ni editó. El prompt V6 tiene el mismo blob que 3030411 (865b9191dbeff277e47a6730d5d48c6a3accc086); corpus oficial conserva blob 8a1add2d3bda79cd82db2bfc9166a501aaec5ca6.

## Evidencia reproducida
Run https://github.com/valdivix-coder/norka/actions/runs/45913820767, revisión 4150a959. Node 24 y dependencias del repositorio; seis bloques extraídos a RUNNER_TEMP; npx --yes tsx para cuatro pruebas y un contraejemplo. Único ajuste al código de pruebas original: ruta absoluta del corpus en la copia temporal. npm ci aprobado. No se suministraron secretos ni se llamó a Gemini.

- Calendario/recurrencia/montos 69/69.
- Traducción y mutaciones 72/72, detectadas 20/22.
- Oficial 50/50 y desarrollo 50/50 sin cambio de campos comparados, 4 y 1 diferencias de confianza respectivamente. La prueba excluye títulos y confianza y suministra evidencia escrita a mano: no mide precisión del modelo.
- Contrato 50/50 referencias válidas; orden local evidencia,tiempo,tipo,titulo,persona_a_cargo,ambito,plazo_fecha,plazo_hora,recurrencia,dirigida_a,confianza,motivo_nota. Esquema individual JSON serializado 2028 caracteres; instrucción 9225 caracteres, 9488 bytes UTF-8; sufijos lote 148, individual 31 caracteres. SHA-256 instrucción: 1bcb748700648b715ad73abd584943c9d87b1aeb3f5e3cb1a82aac66ad9b2564. NO VERIFICADO: tokens reales, esquema de lote en bytes, orden en solicitud efectiva o salida del proveedor, límite de salida.
- Contraejemplo adicional (no oficial): resolverTiempo("2026-11-26", ["mañana a las 09:30"], null) devuelve {"fecha":"2026-11-27","hora":"09:00","clase":"inequivoca"}. Aserción esperada 09:30 falla. La función norm elimina ':' antes del regex de hora. Se demuestra pérdida de minutos aunque la evidencia sea correcta. Puede empeorar una salida bruta correcta. No es una invención de Gemini medida ni una regresión A/B individual medida. Es fallo determinista de diseño que exige detenerse.

## Hallazgos de inspección, además del fallo reproducido
| Severidad | Fuente | Riesgo y propuesta |
|---|---|---|
| Alta, confirmado | CAMBIOS-V7 anexo A, norm/resolverTiempo | Preservar separadores de hora y probar HH:MM, medianoche, AM/PM, minutos inválidos. No corregir por defecto un valor explícito correcto. |
| Alta, riesgo | PROMPT-OPERATIVO-V7 reglas 7 y 9 vs V6 y §6.2 | Prohibición de herencia sin posesivo contradice el ejemplo obligatorio de cuota escolar (caso 1); conservar herencia contextual inequívoca sin elegir por descarte. Sin tipo, presuponer Mascotas para comida de cualquier persona es clasificación no respaldada; abstenerse si no hay evidencia. |
| Alta, riesgo | CAMBIOS-V7 validarV7 tiempo | Cualquier marcador global o encabezado con ':' activa compartido para todos; un HH:MM puede parecer encabezado. Delimitar alcance y verificar referencias por acción; no autorizar globalmente. |
| Alta, riesgo | CAMBIOS-V7 validarV7 negación/descartes | Una acción negada solo baja confianza, y descartes aportan cobertura sin validar motivo; preservar original y evitar materializar acciones negadas/órdenes al sistema. Probar corrección y descarte espurio. |
| Alta, riesgo | CAMBIOS-V7 recurrenciaDesde | Convierte responsabilidad sin recurrencia a tarea, pese a que §5.1 permite recurrencia opcional; no degradar una responsabilidad sostenida inequívoca. |
| Alta, riesgo | PROMPT-OPERATIVO-V7 regla 3 vs regla 11 / D-10 | Nota copia texto con posibles diagnósticos, aunque título no debe incluirlos. No aplicar a datos reales; título mínimo y revisión de privacidad antes de habilitar. |
| Media, riesgo | CAMBIOS-V7 nombres, HOGAR, cobertura | Mayúsculas no confiables en voz; 'luz/agua' no siempre hogar; coincidencia por subcadena y unión de descartes no garantiza cobertura; usar anclas con límites y distinguir cobertura de intención. |
| Media, riesgo | CAMBIOS-V7 D-14 y D-15 vs operativo regla 9 | Uniforme/cotona escolar y compra de remedios requieren distinguir finalidad y acción, armonizar maestro/operativo/ejemplos. |
| Media, riesgo | CAMBIOS-V7 monto | Números del título se comprueban contra captura global, no acción; montos copiados pueden escapar. Auditar montos por segmento y negación. |
| Media, riesgo | PROMPT-OPERATIVO-V7 / contrato interno | Orden local comprobado; no llega aún a responseJsonSchema porque V7 no está integrada. Probar JSON serializado y finishReason sin proveedor, luego evidencia real. |

## Decisiones D-01 a D-18
Propuestas para una integración futura, **pendientes de aprobación** y configurables; no implementadas: D-01 contrato interno en memoria; D-02 calendario derivado; D-04 mismo día ambiguo, null salvo evidencia; D-05 próximo día con baja; D-06 convención 8–12/1–6/7, no sobreescribir hora explícita; D-07 al tiro/ayer con baja; D-09 corrección únicamente inequívoca, marcar otras; D-12 múltiples beneficiarios, no duplicar y revisar; D-13 declaración sin petición no asigna; D-14 compra escolar específica, distinguir preparar uniforme; D-15 insumo salud con baja sin instrucciones; D-16 cada quince días literal; D-17 salida 1024/4096, medir truncamiento.
Restricciones/decisiones diferibles: D-03 A/B con nombres como V6; tipo opcional solo sintético en ablación, sin ampliar datos reales; D-08 mantener puerta bruta y normalizada y umbrales originales, no cambiar; D-10 no habilitar nota con diagnóstico real, requiere revisión de privacidad y aprobación antes de uso real; D-11 no añadir apodos ni esquema ahora; D-18 solo sintético gratuito, sin facturación ni datos reales. D-06 necesita corrección de implementación antes de integrar; D-09 debe quedar demostrado por contraejemplos, no por confianza baja solamente. No cambiar contrato público.

## Próximo paso y reversión
Solicitar autorización para corregir el prototipo en copia versionada (mantener cinco originales intactos), preservar pruebas originales y añadir regresiones independientes, repetir V7.0 antes de V7.1 del encargo. V6 sigue como única versión operativa; sin cambios de src, evals, RLS, secretos, proveedor, migraciones, facturación ni main. NO VERIFICADO: precisión V7 o A/B individual; no ejecutados. Reversión: retirar/revertir commit 4150a959 del workflow aislado y este registro si se desea; ningún dato ni producción modificados. No cerrar fase 2.
