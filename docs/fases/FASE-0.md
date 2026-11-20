# Fase 0 — Descubrimiento y diseño de norka

20 de noviembre de 2026 · Chile

## 1. Lo que entendí

norka reúne lo que una familia tiene que hacer, quién lo lleva y cuándo toca.
La familia captura por texto o voz, revisa lo guardado y decide qué propuestas acepta.
La app recuerda plazos, prepara sugerencias y muestra el avance y la carga acordada con buen trato.
La primera versión es web instalable, en español de Chile, para familias de una o varias casas.
Los pagos se registran a mano y los tratamientos repiten las indicaciones que ingresó la familia.

## 2. Preguntas al propietario

1. **¿Apruebas la lista de palabras de pausa de la sección 6.19 tal como está o quieres cambiar alguna?**

   A. Aprobarla tal como está. B. Indicar qué palabras agregar o sacar.

   Recomiendo A. La pausa invita a releer y la persona conserva la decisión de enviar.

2. **¿Cómo seguimos con el nombre público mientras se verifica en INAPI?**

   A. Mantener norka y verificar marca y nombre de tienda antes de la beta pública, con `usanorka.cl` como primera opción de dominio. B. Mantener norka y esperar tu decisión sobre el dominio después de esas verificaciones.

   Recomiendo A. Los dos dominios exactos están inscritos y el registro público no mostró una inscripción para la primera alternativa al consultarla.

3. **¿Qué fecha debe recordar norka para el Día del Niño?**

   A. El segundo domingo de agosto, como dice 6.9. B. El tercer miércoles de octubre, fecha que señala el decreto.

   Recomiendo A. Coincide con la celebración observada en agosto de 2026 y conserva la regla escrita en 6.9.

4. **¿Qué autorizas para los avisos programados si Vercel Hobby no puede ejecutarlos con la frecuencia exigida?**

   A. Evaluar en la tarea 4.3 un proceso cada minuto con Supabase Cron en el plan gratuito y medirlo antes de aprobarlo. B. Detener la tarea 4.3 hasta que definas otra opción de costo cero.

   Recomiendo A. Supabase ya forma parte del proyecto y permite probar el intervalo definido en 9.2.

5. **¿Qué puede incluir la descarga de datos en la tarea 10.2?**

   A. Excluir todos los comentarios, notas de cambio, aportes y datos de otras personas. B. Entregar una lista explícita de campos permitidos y corregir las secciones que se contradicen antes de construir la descarga.

   Recomiendo A. Las secciones 6.19 y 15.38 prohíben exportarlos, mientras la sección 11 dice que los comentarios y las reacciones entran en la exportación y que se pueden descargar datos de la familia.

6. **¿Qué ruta apruebas para preparar el empaquetado de prueba de la tarea 10.4?**

   A. Contenedor nativo con adaptadores para entrada, avisos y voz según lo que requiera cada plataforma. B. Interfaz nativa que reutilice las reglas de norka.

   Recomiendo A para el empaquetado de prueba. Reutiliza la interfaz web y permite medir temprano qué funciones requieren trabajo propio de cada plataforma. Los requisitos de cuentas y compilación están en el apartado 7.

7. **¿Debe sonar «hecho» al marcar una tarea?**

   A. Sí, según la tabla de sonidos de la guía 9.4 y el prompt maestro 10.3 y 10.4. B. Solo señal visual y vibración al marcar tareas, según la guía 9.1.

   Recomiendo A. La tabla específica de sonidos asigna «hecho» a tareas, tomas y pagos y permite apagarlo desde Perfil.

## 3. Verificación del nombre «norka»

Consultas del 20 de noviembre de 2026.

- **Marca en Chile.** NO VERIFICADO: disponibilidad registral de «norka». El buscador oficial muestra el formulario en la consulta pública indexada, pero el acceso directo desde este entorno devolvió un mensaje de permiso y no obtuve resultados del formulario. Para comprobarlo, buscar «NORKA» por «Exacta» y «Contenga» en INAPI, revisar coincidencias y similitudes en las clases pertinentes para software descargable y servicios de software (revisar en particular 9 y 42), y guardar denominación, número, titular y estado de cada resultado. [Buscador de INAPI](https://buscadormarcas.inapi.gob.cl/) · [ChileAtiende](https://www.chileatiende.gob.cl/fichas/54578)
- **Dominios.** `norka.cl` figura inscrito con vencimiento publicado el 5 de julio de 2027. `norka.com` figura activo en Verisign. Tres alternativas de dominio para conservar el nombre de producto: `usanorka.cl`, `norkafamilia.cl` y `connorka.cl`. NIC Chile devolvió «Nombre de dominio no existe» para las tres. Volver a consultar justo antes de reservar. [NIC Chile, norka.cl](https://www.nic.cl/registry/Whois.do?d=norka.cl) · [Verisign, norka.com](https://rdap.verisign.com/com/v1/domain/norka.com) · [usanorka.cl](https://www.nic.cl/registry/Whois.do?d=usanorka.cl) · [norkafamilia.cl](https://www.nic.cl/registry/Whois.do?d=norkafamilia.cl) · [connorka.cl](https://www.nic.cl/registry/Whois.do?d=connorka.cl)
- **Google Play.** Hay fichas públicas de «NORKA: Smart Sleep», «Norka Care» y una VPN publicada como «Норка». NO VERIFICADO: disponibilidad del título exacto en Chile. Comprobar el catálogo con región Chile y el nombre en Play Console al preparar la ficha. [Smart Sleep](https://play.google.com/store/apps/details?id=com.baika.NORKA&gl=CL) · [Norka Care](https://play.google.com/store/apps/details?id=com.norkacare_app&gl=CL) · [VPN](https://play.google.com/store/apps/details?id=app.norka.io&gl=CL)
- **App Store.** Encontré la ficha pública «Norka care» en la tienda de Estados Unidos. NO VERIFICADO: si la ficha está disponible en Chile y si App Store Connect admite el título exacto para norka. Buscar desde la tienda chilena y comprobar el título en App Store Connect antes de preparar la publicación. Si un título de tienda necesita distinguirse, tres opciones para someter a verificación son «norka: tareas en familia», «norka: cuidado compartido» y «norka: organización familiar». [Ficha pública de Norka care](https://apps.apple.com/us/app/norka-care/id6753747852) · [App Store Connect](https://appstoreconnect.apple.com/)
- **Empresa.** Encontré «NORKA Chile SpA» en extractos publicados y en su perfil público. NO VERIFICADO: su vigencia societaria y el alcance de cualquier derecho sobre el signo. Comprobar la vigencia con el registro societario que corresponda y el signo con INAPI. [Extracto del Diario Oficial reproducido el 21 de noviembre de 2018](https://dequienes.cl/diario-oficial/2018/11/21/norka-chile-spa-76076532-5-1498033) · [Perfil de la empresa](https://cl.linkedin.com/company/norkachile)

## 4. Marca y guía gráfica

Leí completo el prompt maestro v7 y abrí y leí las **45 páginas** de la guía gráfica de norka, versión **2.0**, del 16 de noviembre de 2026. El PDF abierto coincide con el archivo de GitHub. Las 14 secciones del índice son estas. [Prompt maestro v7](../PROMPT-MAESTRO.md) · [Guía gráfica v2.0](../marca/GUIA-GRAFICA.pdf)

1. Cómo usar esta guía
2. Idea de marca
3. Marca: logotipo «norka» e isotipo «Órbita»
4. Color
5. Tipografía
6. Espacio, retícula y forma
7. Componentes
8. Iconografía e ilustración
9. Movimiento y gestos
10. Pantallas de referencia
11. Voz, textos y buen trato
12. Accesibilidad
13. Tokens para copiar
14. Lista de verificación visual

**Licencias.** Los archivos de licencia de Bricolage Grotesque y Figtree confirman **SIL Open Font License 1.1** para ambas, consultados el 20 de noviembre de 2026. La guía 5 indica alojarlas dentro de la aplicación. [Bricolage Grotesque](https://github.com/google/fonts/blob/main/ofl/bricolagegrotesque/OFL.txt) · [Figtree](https://github.com/google/fonts/blob/main/ofl/figtree/OFL.txt)

El logotipo, el isotipo «Órbita» y el isotipo reducido están en los archivos SVG de la marca. El conjunto vertical se compone según la sección 3 de la guía. [SVG de norka](../marca/svg/)

## 5. Mapa de pantallas

Cada línea indica desde dónde se llega y qué se hace ahí. El mapa incluye hojas y pasos del mismo recorrido. Las referencias de composición son la guía 7, 10, 11 y 12 y el prompt maestro 6 a 8.

**Entrada y primera configuración**

- **Entrada** · Al abrir sin sesión → entrar con un proveedor habilitado.
- **Crear familia** · Después de entrar sin invitación → guardar el nombre de la familia.
- **Mi rol y participación** · Después de crear la familia → elegir rol y participación, con cumpleaños y teléfono opcionales.
- **Agregar personas a cargo** · Desde la configuración inicial o Familia → guardar una persona a cargo.
- **Elegir plantillas** · Desde la configuración inicial, una persona a cargo nueva o Familia → activar responsabilidades.
- **Primer reparto** · Después de activar plantillas en la configuración → elegir titular para cada responsabilidad.
- **Celebraciones iniciales** · Después del reparto → confirmar las fechas clave iniciales.
- **Invitar** · Al final de la configuración o desde Familia como administrador → generar un enlace de invitación.
- **Aceptar invitación** · Desde el enlace recibido → entrar a la familia y revisar las propuestas recibidas.

**Hoy, captura y tareas**

- **Hoy** · Barra inferior o entrada a una familia configurada → abrir Resolver para atender lo que toca.
- **Resolver y cierre del recorrido** · Desde Hoy → actuar sobre la tarea visible y ver lo que se resolvió al final.
- **Capturar por texto** · Botón central de la barra → enviar el texto.
- **Capturar por voz** · Mantener presionado Capturar o usar el micrófono de la hoja → dictar y guardar la transcripción.
- **Resultado de la captura** · Al guardar → revisar lo que se creó, con «Editar» y «Deshacer».
- **Consentimiento de interpretación** · Antes de la primera interpretación → aceptar o rechazar el envío a Gemini.
- **Detalle de tarea** · Desde listas, anillos, Resolver, Avisos o Buscar → marcar «Hecho» o usar la acción directa de la tarea.
- **Edición, cambio de plazo y posponer** · Desde la tarea o su gesto equivalente → guardar el cambio en el mismo lugar.
- **Elegir titular o ejecutor y proponer** · Desde una tarea, responsabilidad, persona o Equilibrio → enviar una propuesta cuando se elige a otro integrante.
- **Detalle de propuesta** · Desde Avisos, una invitación o un aviso al teléfono → responderla o revisar su estado.
- **Detalle de avance** · Al tocar un anillo → abrir las tareas exactas que cuenta.
- **Sugerencias y plan anticipado** · Desde «Se viene», «Ver todas» o Avisos → ejecutar la acción de la regla y confirmar el plan cuando corresponda.
- **«¿Cuándo toca la próxima?»** · Al cerrar una tarea que activa R4 → elegir un plazo o tocar «No hace falta».
- **Ficha de pago, confirmación e historial** · Desde una tarea de pago, Buscar o Presupuesto → copiar datos o abrir el portal. Al volver, confirmar el pago, el monto y quién pagó.

**Familia y cuidado**

- **Familia** · Barra inferior → abrir o agregar una persona a cargo.
- **Ficha de persona a cargo** · Desde Familia, Hoy o Buscar → abrir un ámbito, revisar un tratamiento o consultar su fecha clave.
- **Ámbito y responsabilidades** · Desde la ficha o Familia → abrir o agregar una responsabilidad y revisar sus tareas.
- **Responsabilidad** · Desde un ámbito, Buscar o Equilibrio → editar sus datos o proponer cambios de titular.
- **Administrar ámbitos y plantillas propias** · Desde Familia y el catálogo → agregar o editar los datos correspondientes.
- **Fechas clave** · Desde Familia, la ficha o Buscar → activar una celebración o guardar una fecha.
- **Período escolar y edición de guiones** · Desde Fechas clave o una sugerencia → ingresar fechas o guardar pasos y días de un guion.
- **Consentimiento de tratamientos** · Al crear el primer tratamiento de la familia → decidir si se guardan los datos descritos.
- **Agregar o editar tratamiento** · Desde la ficha o el tratamiento → guardar las indicaciones y el horario ingresados.
- **Tratamiento y tomas** · Desde Hoy, una ficha o un aviso de toma → marcar la toma o tocar «Yo estoy a cargo». La omisión, pausa, término o borrado se gestionan desde su detalle.
- **Activación de varias casas** · Desde Familia → definir casas, integrantes y estadías.
- **Estadías y excepción** · Desde Familia o la ficha, con dos o más casas → guardar el patrón o cambiar uno o varios días.
- **Cambio de casa** · Desde la sugerencia o su aviso → revisar «Lo que viaja» y guardar la nota opcional.
- **Tarjeta de llegada** · Desde Hoy de quien recibe → revisar la lista, la nota y la última toma, y tocar «Entendido».

**Reparto, actividad y cabecera**

- **Equilibrio, Carga** · Barra inferior → revisar el reparto acordado y proponer un cambio si corresponde.
- **Cambiar lo acordado** · Desde Equilibrio → enviar a los corresponsables una propuesta de cambio de proporción.
- **Presupuesto** · Pestaña de Equilibrio para corresponsables → abrir el próximo pago. La hoja de activación o edición permite proponer monto, aportes y reparto por ámbito.
- **Actividad** · Barra inferior → reconocer lo hecho mediante una reacción o un comentario.
- **Detalle de actividad y reacciones** · Desde su tarjeta → ver la actividad o reaccionar con las opciones permitidas. Tocar una pastilla muestra quién reaccionó.
- **Hoja de comentarios** · Desde una tarea o una actividad → enviar un comentario. La revisión previa permite releer o enviar igual. Desde la hoja se puede silenciar la conversación y gestionar los propios comentarios u ocultar uno ajeno para uno mismo.
- **Avisos** · Campana de la cabecera → abrir o responder lo que llegó. Incluye «Para celebrar» para mandar una reacción de apoyo.
- **Buscar** · Lupa de la cabecera → escribir y abrir un resultado de la familia.
- **Perfil propio y de otro integrante** · Avatar de la cabecera u hoja de persona → editar preferencias propias o usar las opciones de contacto del otro integrante.
- **Hoja de persona** · Al tocar un avatar → llamar, abrir WhatsApp, pedir número o proponer algo.
- **Logro obtenido y «Ver todos»** · Al obtener un logro o desde Perfil → reconocer el logro, decidir si compartirlo cuando corresponda o revisar los logros propios.
- **Avisos al teléfono** · Desde Perfil → elegir canales, horarios y silencios. Tras la primera tarea, la pantalla previa permite decidir si habilitar el permiso del teléfono.
- **Formas de entrar** · Desde Perfil → agregar otra forma de entrada o unir cuentas cuando corresponda.
- **Ajustes** · Desde Perfil → administrar las preferencias y recuperar elementos archivados. Las acciones de cuenta y familia incluyen salir, exportar o eliminar según los permisos y la decisión del apartado 2.
- **Página de presentación pública** · Desde su dirección pública en la Fase 10 → conocer norka y acceder a la aplicación. Incluye acceso a los términos y la política de privacidad de la beta.

## 6. Investigación de pagos en Chile

Consultas del 20 de noviembre de 2026. Los precios corresponden a los productos consultados. Cada proveedor requiere su propia habilitación y condiciones comerciales.

- **Khipu, iniciación de pagos por transferencia.** Recauda transferencias y ofrece API. Para integrar, se requiere una cuenta de cobro, validar la cuenta bancaria de abono y configurar la API del comercio. Publica 0,69 % más IVA sobre lo recaudado o 0,0105 UF más IVA por transacción, según modalidad. [Tarifas Khipu Chile](https://www.khipu.com/page/tarifas-instantaneos-chile) · [Guía de habilitación de Khipu](https://s3.amazonaws.com/website.khipu.com/product/Implementation_Kit.pdf)
- **Fintoc, cobro por transferencia.** Ofrece cobro desde bancos chilenos y conciliación. La integración directa usa API y requiere habilitar la cuenta y credenciales de la organización. NO VERIFICADO: precio de transferencia y criterios de alta aplicables a norka. Solicitar el tarifario del producto y las condiciones por escrito. [Transferencias de Fintoc](https://www.fintoc.com/cl/producto/payments/transferencias) · [Documentación de Fintoc](https://docs.fintoc.com/)
- **Flow, pasarela con transferencias.** Ofrece cobros mediante API REST y transferencias por proveedores como Khipu. Requiere alta como comercio, credenciales de integración y configurar el abono. Publica transferencias desde 0,99 % más $100 CLP, más IVA, según el medio y plazo de abono. [API Flow](https://web.flow.cl/es-cl/api-de-integracion/) · [Tarifas](https://web.flow.cl/es-cl/tarifas/) · [Ayuda Flow](https://web.flow.cl/es-cl/ayuda/)
- **Mercado Pago, billetera y pasarela.** Checkout permite cobrar con Cuenta Mercado Pago y otros medios según la modalidad. Para integrar, se requiere una cuenta Mercado Pago o Mercado Libre, crear una aplicación y configurar credenciales. NO VERIFICADO: la comisión aplicable a la modalidad y al plazo de abono que necesitaría norka. Revisar el tarifario chileno del checkout elegido y confirmar el valor con la cuenta de comercio. [Primeros pasos](https://www.mercadopago.cl/developers/es/docs/getting-started) · [Cuenta Mercado Pago en Checkout](https://www.mercadopago.cl/developers/es/docs/checkout-api-payments/integration-configuration/integrate-mp-wallet) · [Checkout Chile](https://www.mercadopago.cl/herramientas-para-vender/check-out)
- **Tenpo, cuenta digital.** Publica transferencias personales sin comisión desde su app, sujetas a sus condiciones de cuenta. NO VERIFICADO: API pública de iniciación desde aplicaciones externas, habilitación y precio de ese acceso. Consultar a Tenpo empresas y pedir documentación para aplicaciones de terceros. [Transferencias Tenpo](https://www.tenpo.cl/productos/transferencias)
- **BancoEstado y enlaces bancarios prellenados.** El banco documenta transferencias desde su sitio privado y transferencias por QR desde Rutpay. NO VERIFICADO: un enlace público documentado que permita a norka abrir BancoEstado, Banco de Chile o Santander con destinatario y monto precargados. Pedir a cada banco la especificación pública del enlace, los requisitos y tarifas para terceros, y probar el recorrido con el banco si entrega documentación. [Transferencias desde BancoEstado](https://nwm.bancoestado.cl/content/bancoestado-public/cl/es/home/home/centro-de-ayuda/transferencias-y-pagos/-que-debo-hacer-para-realizar-una-transferencia-.html) · [Rutpay y QR, septiembre de 2026](https://nwm.bancoestado.cl/content/bancoestado-public/cl/es/home/inicio---bancoestado-corporativo/noticias/sala-de-prensa-2026---bancoestado-corporativo/septiembre---bancoestado-corporativo/bancoestado-lanza-nueva-funcion-en-rutpay-para-transferir-median.html)

En v1 la ficha copia datos, abre el portal guardado y registra la confirmación de la familia, según 6.5 y 9.3. Estas ofertas comerciales quedan como referencia para una fase futura.

## 7. Investigación de proveedores de entrada y tiendas, límites de voz, avisos y sonido, y Día del Niño

Salvo donde se indica la fecha de publicación, las fuentes de este apartado se consultaron el 20 de noviembre de 2026. «NO VERIFICADO» señala una comprobación que sigue abierta.

### Entrada

- **Google.** Configurar cliente OAuth y dirección de regreso autorizada. Usar la «G» y el botón oficial o los recursos oficiales que permiten «Continuar con Google», con su texto, color y espaciado. Google es el proveedor obligatorio de la v1. [Identidad de Google](https://developers.google.com/identity/protocols/oauth2) · [Pautas del botón](https://developers.google.com/identity/branding-guidelines)
- **Apple.** La membresía estándar publicada es **US$99 al año** o precio local cuando corresponde. Para entrada web, Apple documenta un Services ID vinculado a un App ID principal con la capacidad habilitada, dominio, dirección HTTPS de regreso y clave privada. Su guía de Apple JS indica que requiere una app en App Store. NO VERIFICADO: si la cuenta de Simón tiene un App ID y una app que cumplan esos requisitos, y el importe local de la membresía. Verlo en Apple Developer antes de habilitar el botón. Usar su botón o recursos oficiales, con el logotipo, texto localizado y variantes de color aprobadas. [Membresía](https://developer.apple.com/programs/enroll/) · [Configuración web](https://developer.apple.com/help/account/capabilities/configure-sign-in-with-apple-for-the-web/) · [Uso en web y otras plataformas](https://developer.apple.com/sign-in-with-apple/usage-guidelines-for-websites-and-other-platforms/) · [Diseño del botón](https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple)
- **Facebook.** Crear una app en Meta, habilitar Facebook Login, registrar dominio y regreso OAuth, preparar la política de privacidad y la vía de eliminación de datos, y definir los permisos de perfil y correo solicitados. La revisión y la verificación dependen del acceso que pida el caso de uso. NO VERIFICADO: flujo exacto de revisión para la app de Simón, plazo, eventual cobro aplicable y activos de marca localizados vigentes. Confirmarlo en el panel de Meta con el caso de uso creado y obtener de Meta el botón o recurso oficial para «Continuar con Facebook», con su f, colores y espaciado. [Facebook Login](https://developers.facebook.com/docs/facebook-login/web/) · [Botón oficial](https://developers.facebook.com/docs/facebook-login/web/login-button/) · [Meta App Review](https://developers.facebook.com/docs/resp-plat-initiatives/app-review/introduction) · [Configuración en Supabase](https://supabase.com/docs/guides/auth/social-sign-in/auth-facebook)

### Dos rutas para la tarea 10.4

- **A. Contenedor nativo de la web.** Reutiliza la interfaz. Capacitor ofrece un contenedor y acceso a funciones nativas mediante adaptadores. Android también ofrece Trusted Web Activity con Chrome y verificación del dominio mediante Digital Asset Links. Para ambos sistemas hay que probar entrada, trabajo sin conexión, permisos, avisos y apertura del objeto exacto en el paquete. La integración con las acciones de servidor existentes y la disponibilidad del reconocimiento de voz dentro del contenedor son NO VERIFICADO hasta compilar y recorrer un prototipo. Apple evalúa la utilidad y experiencia del paquete en 4.2. [Capacitor](https://capacitorjs.com/docs) · [Trusted Web Activities](https://developer.android.com/develop/ui/views/layout/webapps/guide-trusted-web-activities-version2) · [Apple 4.2](https://developer.apple.com/app-store/review/guidelines/#minimum-functionality)
- **B. Interfaz nativa que reutiliza el núcleo.** Reutiliza las reglas puras en TypeScript y requiere construir pantallas, navegación, almacenamiento local y adaptadores de entrada, voz y avisos para cada plataforma. React Native documenta un entorno Android con Android Studio y un entorno iOS con Xcode y macOS. El trabajo adicional es rehacer la interfaz y comprobar que el comportamiento coincida con la web. [Entorno de React Native](https://reactnative.dev/docs/set-up-your-environment)
- **Cuentas y compilación para ambas rutas.** Para distribución mediante cuentas de tienda, Apple publica US$99 anuales y Play Console US$25 por única vez, con requisitos de verificación de cuenta. El empaquetado local y su firma de prueba tienen requisitos propios. NO VERIFICADO: cuentas ya habilitadas, importe local, acceso a un Mac o entorno de compilación con Xcode y dispositivos de prueba. Confirmar estos recursos con Simón antes de 10.4. [Apple Developer](https://developer.apple.com/programs/enroll/) · [Play Console](https://support.google.com/googleplay/android-developer/answer/6112435) · [Compilación iOS con Capacitor](https://capacitorjs.com/docs/ios)

### Políticas de tiendas

| Tema | App Store | Google Play |
| --- | --- | --- |
| Web envuelta | La regla 4.2 exige una experiencia con utilidad propia y que vaya más allá de un sitio reenvasado. [Apple 4.2](https://developer.apple.com/app-store/review/guidelines/#minimum-functionality) | Exige utilidad y funcionamiento adecuados. Su política de spam restringe vistas web de sitios sin permiso de su propietaria o administrador. [Funcionalidad](https://support.google.com/googleplay/android-developer/answer/9898783) · [Spam](https://support.google.com/googleplay/android-developer/answer/9899034) |
| Entrada con Google | La regla 4.8, salvo sus excepciones, exige una opción equivalente con datos limitados a nombre y correo, posibilidad de mantener privado el correo y sin uso publicitario de interacciones sin consentimiento. Entrar con Apple es la opción documentada pertinente para norka. [Apple 4.8](https://developer.apple.com/app-store/review/guidelines/#login-services) | En la política revisada no encontré una obligación equivalente de ofrecer Apple por usar Google. Confirmar las condiciones aplicables en Play Console antes de una futura presentación. [Política de Google Play](https://support.google.com/googleplay/android-developer/answer/18265346) |
| Avisos | 4.5.4 limita avisos con información personal sensible o confidencial y que los avisos sean requisito para usar la app. Esto obliga a revisar el contenido de avisos de tomas antes de una eventual distribución nativa. [Apple 4.5.4](https://developer.apple.com/app-store/review/guidelines/#apple-sites-and-services) | Android 13 o superior usa permiso de ejecución para avisos nativos no exentos. Solicitarlo en el momento indicado por 6.15. [Permiso de Android](https://developer.android.com/develop/ui/views/notifications/notification-permission) |
| Micrófono | La app nativa debe explicar la finalidad en la solicitud de permiso. La regla 2.5.14 exige consentimiento y señal clara cuando se registra actividad. [Apple 2.5](https://developer.apple.com/app-store/review/guidelines/#software-requirements) · [Uso del micrófono](https://developer.apple.com/documentation/bundleresources/information-property-list/nsmicrophoneusagedescription) | Google Play trata el micrófono como dato sensible y exige permiso y las declaraciones aplicables al uso. [Datos de Google Play](https://support.google.com/googleplay/android-developer/answer/10144311) · [Permisos Android](https://developer.android.com/media/platform/mediarecorder) |
| Datos de menores | La sección 5.1 exige privacidad y aplica requisitos a datos de menores según el caso. Las cuentas de norka son de adultos. Declarar los datos de personas a cargo y revisar el tratamiento de datos sensibles antes de cualquier presentación. [Apple 5.1](https://developer.apple.com/app-store/review/guidelines/#privacy) | Declarar datos y público objetivo. La política Familias aplica si el público objetivo incluye niñas o niños. Revisar la declaración de datos de personas a cargo aunque las cuentas sean de adultos. [Política Familias](https://support.google.com/googleplay/android-developer/answer/9893335) · [Datos de Google Play](https://support.google.com/googleplay/android-developer/answer/10144311) |
| Eliminar cuenta | Si se puede crear una cuenta, debe poder iniciarse su eliminación dentro de la app. [Apple, eliminación](https://developer.apple.com/go/?id=ar-ad-support) | Si se puede crear una cuenta desde la app, debe existir una vía dentro de la app y otra vía web accesible para solicitar que se elimine la cuenta y sus datos asociados. [Google Play, eliminación](https://support.google.com/googleplay/android-developer/answer/13327111) |

### Teléfonos y proceso de avisos

- **Avisos en iPhone.** WebKit documenta Web Push desde iOS/iPadOS 16.4 para apps web añadidas a la pantalla de inicio. La solicitud debe seguir a una acción directa, requiere permiso y está sujeta a la configuración de avisos del sistema y modos de concentración. WebKit exige una notificación visible al enviar un push. NO VERIFICADO para norka: entrega con pantalla bloqueada y app cerrada, demora real, reingreso y apertura del objeto exacto. Probar en un iPhone desde la app web instalada, con permisos concedidos y denegados. [WebKit, febrero de 2023](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/) · [WebKit, avisos visibles](https://webkit.org/blog/16535/meet-declarative-web-push/)
- **Avisos en Android.** Chrome documenta suscripciones Web Push con permiso y un Service Worker. NO VERIFICADO para norka: demora y apertura del objeto exacto con la PWA instalada, pantalla bloqueada, permisos distintos y ahorro de batería. Repetir el mismo recorrido en un Android real. [Suscripciones Web Push, web.dev](https://web.dev/articles/push-notifications-subscribing-a-user)
- **Voz en iOS y Android.** WebKit documenta reconocimiento de voz de Safari con el motor de Siri y Siri habilitado. Chrome documenta reconocimiento mediante Web Speech y autorización del micrófono. NO VERIFICADO: español de Chile, resultado parcial, gesto de soltar y cancelar, comportamiento sin conexión y disponibilidad en cada teléfono, navegador y modo instalado. Probar con y sin permiso, con y sin red y, en iPhone, con Siri desactivado. Si el navegador no ofrece reconocimiento, se aplica la captura por texto de 9.2. [WebKit, Safari 14.1](https://webkit.org/blog/11648/new-webkit-features-in-safari-14-1/) · [Chrome, reconocimiento de voz](https://developer.chrome.com/blog/voice-driven-web-apps-introduction-to-the-web-speech-api)
- **Sonidos.** Chrome documenta restricciones de reproducción automática para Web Audio. Preparar el audio tras un toque, según 10.4. NO VERIFICADO: que los ocho sonidos se escuchen tras el toque y permanezcan en silencio cuando corresponde en un iPhone y un Android reales. Probar altavoz, interruptor de Perfil, modo silencio y volumen del sistema por separado. Los avisos al teléfono usan la configuración de sonido del sistema. [Política de audio de Chrome](https://developer.chrome.com/blog/autoplay)
- **Frecuencia de avisos programados.** Vercel Hobby limita cada tarea programada a una vez al día y precisa la hora con un margen de hasta 59 minutos. Supabase Cron documenta intervalos de un minuto y ejecución por HTTP, una vía por comprobar con el plan gratuito real. NO VERIFICADO: cuotas y continuidad del proyecto específico, intervalo observado de extremo a extremo y cumplimiento de ventanas de tomas en ambos teléfonos. Si se aprueba la vía, medir ejecuciones, latencia y duplicados en 4.3, también en un cambio de hora de `America/Santiago`. [Límites de Vercel](https://vercel.com/docs/schedules/cron-jobs/usage-and-pricing) · [Supabase Cron](https://supabase.com/docs/guides/cron) · [Precios y cuotas de Supabase](https://supabase.com/pricing)

### Día del Niño en Chile

El Decreto 1110 de 1976 señala el **tercer miércoles de octubre**. En 2026, el Museo Nacional de Bellas Artes celebró el Día de la Niñez el **domingo 9 de agosto**, segundo domingo del mes, en línea con la fecha habitual incluida en 6.9. Recomiendo conservar agosto para el recordatorio, sujeto a tu respuesta en el apartado 2. [Decreto 1110, BCN](https://www.bcn.cl/leychile/navegar?idNorma=261625) · [Celebración del MNBA](https://www.mnba.gob.cl/noticias/disfruta-el-dia-de-la-ninez-en-el-bellas-artes) · [Cobertura del 27 de julio de 2026](https://www.biobiochile.cl/noticias/servicios/toma-nota/2026/07/27/dia-del-nino-y-la-nina-cuando-se-celebra-y-por-que-tiene-dos-fechas-en-chile.shtml)

## 8. Riesgos

1. **Privacidad de la familia y buen trato.** Un aviso, una exportación o una tarjeta pueden exponer lo que corresponde ver solo dentro de la familia o a una persona. Reducirlo con aislamiento por familia, revisión de permisos y del texto de avisos, definición de la exportación antes de 10.2 y las pruebas de buen trato de 8.12.
2. **Avisos de tomas tardíos o repetidos.** Medir el intervalo de entrega en 4.3 y probar el relevo de la Fase 6 con dos teléfonos, incluida una doble marca y los avisos a la hora, a los 30 y a los 60 minutos.
3. **Capturas perdidas o interpretadas con datos inventados.** Guardar primero el texto original, verificar recuperación al reconectar y usar las 50 frases para medir inventos y aciertos. Mantener la captura por texto cuando la voz no está disponible.
4. **Colisiones de marca y disponibilidad del nombre.** Resolver la búsqueda de INAPI y comprobar nombre de tienda y dominio antes de la beta pública. Usar los resultados fechados para decidir si se necesita una variante en la ficha o en la dirección.
5. **Empaquetado y entrada sujetos a cuentas y revisión.** Confirmar recursos de compilación y credenciales antes de la tarea correspondiente, mantener Apple y Facebook apagados hasta que se habiliten y probar los adaptadores de cada sistema en el paquete de prueba.

## 9. Confirmación del plan

**Puedo trabajar las fases 1 a 10 en su rama y orden, con aprobación por fase. Hay tareas que todavía no puedo garantizar tal como están escritas.**

- **1.3 y 9.3.** La guía 9.1 indica marcar «Hecho» sin sonido, mientras la guía 9.4 y el prompt maestro 10.3–10.4 incluyen ese sonido. Se necesita la decisión del apartado 2 antes de implementar ese comportamiento. Para **1.3/9.6**, la escala tipográfica cerrada de la guía 5 omite medidas como los 30 y 22 px del anillo de 7.4 y los 10 px de la cabecera 7.16. El margen a 360 px es 18 px en 6.1 y 20 px en la lista de 14. Se necesita resolver qué especificación rige esos valores antes de la tarea visual correspondiente.
- **1.4, 1.7, 1.8 y migraciones posteriores.** Puedo preparar migraciones, consultas antes y después y vuelta atrás. La confirmación de aplicarlas corresponde a Simón según 9.2. Para **1.5** se requieren las credenciales de Google y la prueba en el teléfono. Apple y Facebook quedan sujetos al apartado 7.
- **2.6 y 2.9.** La evaluación real necesita acceso a Gemini desde el servidor y una cuota útil de costo cero. Las mediciones en el teléfono las hace Simón. La puerta de la fase depende de resultados medidos.
- **3.7, 5.5 y 6.3.** La composición de la guía 10.2 ubica tratamientos antes de los ámbitos en la ficha; el orden de interacción de 6.4 los enumera después. La guía 10.8 ubica una fila Ajustes en Familia; el prompt maestro 8 sitúa Ajustes dentro de Perfil. Se requiere aclarar el orden y la entrada antes de implementarlos.
- **4.3 y 6.4.** Vercel Hobby por sí solo no cumple el máximo de cinco minutos de 9.2.16. El candidato de costo cero necesita la aprobación del apartado 2 y una prueba. La recepción en dispositivos es una verificación adicional.
- **5.2 a 5.5.** La fecha del Día del Niño se resuelve con la decisión del apartado 2. El listado de 13.5 muestra 5.8 después de 5.9 y 5.10, mientras la regla general pide orden numérico. Antes de llegar a 5.8 hace falta confirmar el orden. La regla R11 también figura en 4.3 y en 5.8; se requiere confirmar el reparto del trabajo antes de programarla.
- **4.7, 6.6, 7.5, 8.11, 8.12 y 9.9.** Puedo preparar pruebas, guiones y planillas. Las puertas requieren recorridos de Simón y, donde corresponde, pruebas con cinco personas o con dos teléfonos.
- **9.2, 9.3 y 9.7.** La cabecera a 60 cuadros por segundo, el comportamiento de sonido en silencio y el rendimiento exigen medición en dispositivos reales. Estos resultados están NO VERIFICADOS hasta ejecutar los recorridos de las secciones 10 y 12.
- **10.2.** La exportación requiere decidir la contradicción del apartado 2 antes de construirla.
- **10.4.** Este entorno es Linux y no tiene Xcode. La compilación y firma local de iOS requieren acceso a macOS con Xcode o a un entorno que lo proporcione, y las cuentas o credenciales que exija el modo de distribución de prueba elegido. Se requiere aprobar la ruta de empaquetado y confirmar recursos compatibles con el presupuesto de la v1. La aceptación en las tiendas queda NO VERIFICADA hasta su revisión futura.

**Evidencia y vuelta atrás.** `pdfinfo` devolvió `Title: norka · Guía gráfica 2.0` y `Pages: 45`. `git hash-object` devolvió `342d249a085fb51dad50836c243a8059bb30465d` para el prompt maestro y `af1133fb4184e7a000d7d5f1a7db16b15a3aa111` para el PDF leído. Se leyó primero `AGENTS.md` y `docs/AHORA.md`, luego el prompt maestro y la guía y, después, `README.md` y `docs/IMPLEMENTATION_STATUS.md`. Esta entrega se revisa en GitHub. La Fase 0 no tiene arnés ni una app que abrir en el teléfono. La vuelta atrás consiste en revertir el cambio documental en `fase-0`. Como evidencia de publicación se entrega el enlace al cambio en GitHub.

**Lista de control de 14.2.** 1 Sí, solo Fase 0. 2 No aplica, el arnés se crea en 1.2. 3 Sí, vocabulario de 5.1 para el producto. 4 a 8 No aplica, sin datos ni pantallas implementados. 9 Sí, el mapa y las preguntas usan trato neutral. 10 y 11 No aplica, sin valores visuales implementados ni datos guardados. 12 Sí, documentos actualizados en la rama. 13 a 15 No aplica, sin acciones, motor ni formularios implementados. 16 Sí, «norka» en minúsculas, sin dibujar la marca. 17 a 19 No aplica, sin cambios a Actividad, mensajes ni movimiento. 20 Sí para la redacción de la entrega, con la verificación en la app reservada a 8.12.

La Fase 0 queda entregada para revisión. La aprobación se registra cuando Simón escribe «apruebo la fase 0».
