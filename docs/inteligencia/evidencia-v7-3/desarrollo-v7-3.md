# Desarrollo V7.3 · comparación de sistemas V6, 7.2 y 7.3 (22 frases nuevas) · NO es aceptación

Run https://github.com/valdivix-coder/norka/actions/runs/45994191002 · commit `84bef54` · artefacto 15194768714 (ZIP SHA-256 `34fa416cb303c1925c4b3ceabb0e954c917da51fbfef88f9993b8c5385df3cdd`). `gemini-3.5-flash-lite`, sin respaldos, temperatura 0, semilla 20261129, orden permutado por caso, 22/22 válidas por brazo, 66 STOP, 0 fallos, 0 alertas, sin D-19 (modo desarrollo). Corpus `evals/desarrollo-v7-3.json`, no ciego (lo escribió el diseñador).

Precisión principal/estricta (n = 22):
- V6: bruta 13/13 (59,1 %), normalizada 13/13.
- 7.2: bruta 13/13, normalizada 14/14 (63,6 %).
- 7.3: bruta 19/19 (86,4 %), normalizada 21/21 (95,5 %).

Hogar por acción (TP/FP/FN, capa normalizada): V6 12/7/0; 7.2 12/7/0; 7.3 12/0/0 (también 12/0/0 en bruta).
Ablación del validador sobre la misma salida bruta: brazo 7.2 → validador 7.2 14, validador 7.3 19; brazo 7.3 → 21 con ambos (la mejora de 7.3 en este brazo viene del modelo).
Costo por solicitud: entrada V6 2.791, 7.2 3.073 (+10,1 %), 7.3 2.957 (+6,0 %); salida 97 / 177 / 134; mediana 806,5 / 1.043 / 894,5 ms (7.3 +10,9 %); p95 1.045 / 1.275 / 991.
Por revisar (elementos): V6 2/30, 7.2 7/30, 7.3 10/30. En 7.3 son, sobre todo, compras sin beneficiario (persona null, lo que §6.2 manda revisar), «el jueves» dicho un jueves (D-04) y un pago sin persona.
Capa aplicable: 1 hora perdida en 7.2 y 7.3 (caso D-04 de mismo día: la propuesta vigente descarta la hora sin fecha).

Por caso (auditoría propia, una pasada):
- 7.3 acierta y V6 falla: 1, 3, 5, 8, 13, 20 (V6 asigna El hogar a compras sin ancla), 9 (V6 asigna +7 el mismo día), 12 (V6 asigna El hogar a «comprar pan»).
- Correcciones del validador 7.3: 9 (fecha de mismo día → null, hora conservada) y 12 (hereda el sábado para «a las cinco»).
- Fallo común a los tres: 15 («pagar el bono» tras «llevar a Matías al pediatra»: todos null; la etiqueta referida es discutible).
- Sin regresiones de 7.3 frente a V6 ni frente a 7.2. Ningún monto alterado (19 conserva «30 lucas»).
- H2 (calendario) no se cumple en bruto: 7.3 sigue poniendo +7 en «el jueves» dicho un jueves; lo corrige el validador.
