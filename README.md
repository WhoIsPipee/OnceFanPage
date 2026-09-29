# OnceFanPage — SANA / MK2

Página desarrollada para **Gabriela**, fan de **Minatozaki Sana** y ONCE.

**Link: [pendiente](https://oncefanpagesana.netlify.app/)**

Un nuevo diseño de Minatozaki Sana construido desde cero con **Next.js 16.3.5, React 19 y TypeScript**, App Router y una API de servidor. El proyecto también está disponible en el escritorio, en `SANA-MK2`.

## Abrir

Requiere Node.js >=20.9 y npm (se ha probado con Node 24.19).

```powershell
npm.cmd install
npm.cmd run dev
```

Abre http://localhost:3000. También puedes hacer doble clic en `ABRIR-SANA-MK2.cmd`. Mantén esa terminal abierta mientras usas la web; Ctrl+C detiene el servidor. Si el puerto 3000 está ocupado por esta vista previa, úsala o detén ese servidor antes de iniciar otro. El comando de desarrollo puede elegir el siguiente puerto libre y lo muestra en su salida.

Producción local:

```powershell
npm.cmd run build
npm.cmd run start
```

## Qué contiene

- Dirección visual nueva: negro ciruela, rosa eléctrico, tipografía editorial y paneles de cristal.
- Portada con parallax y una secuencia de tres fotografías animadas con GSAP ScrollTrigger. Lenis suaviza el desplazamiento. Respeta `prefers-reduced-motion`.
- Biografía, 14 capítulos de trayectoria entre 2009 y 2026 y versión completa desplegable.
- 12 fotos locales, filtros, visor con teclado, foco contenido y cierre con Escape.
- 6 entrevistas de Sana’s Fridge Interview, episodio de lectura de comentarios, 3 covers y referencias a sus canciones individuales.
- Últimas tres publicaciones guardadas de Instagram con vínculos a publicaciones y comentarios originales.
- Fuentes y créditos en `/creditos`; imágenes y tipografías se sirven localmente.

## Activar Instagram automático

**La conexión real NO está activa sin credenciales autorizadas.** La consulta pública de Instagram respondió HTTP 429. No se utiliza scraping ni se presenta una selección estática como un feed en directo.

La ruta `/api/instagram` implementa Business Discovery de la API oficial de Meta para consultar `m.by__sana`. Necesitas una app de Meta con Instagram API con Facebook Login y acceso autorizado a una cuenta profesional de Instagram vinculada a una página de Facebook. El ID es el de **tu cuenta autorizada**, no el de Sana. El perfil consultado debe ser elegible para Business Discovery. Meta puede exigir revisión de la app y permisos según su modo y tus cuentas; consulta la documentación actual.

1. Copia `.env.example` a `.env.local`.
2. Completa `INSTAGRAM_IG_USER_ID`, `INSTAGRAM_ACCESS_TOKEN` y una versión Graph válida para tu app. Nunca compartas el token en el chat ni uses prefijos `NEXT_PUBLIC_`.
3. Reinicia Next.js. Abre `/api/instagram` y verifica `status: "live"`, una fecha actual y publicaciones de Sana. La interfaz mostrará «Conectado».

El servidor consulta un lote de 25 entradas, ordena por fecha y muestra las 3 más recientes. La caché dura 15 minutos; el navegador revisa el endpoint cada minuto mientras está visible y al volver a la pestaña. Una publicación nueva aparece en la siguiente consulta elegible (aproximadamente 15–16 minutos). Es consulta periódica, no un webhook ni tiempo real. Sin visitantes no hay un proceso de sondeo permanente; la siguiente visita comprueba la fuente. Tokens caducados, permisos insuficientes o límites de Meta producen estado `stale`, nunca `live`. Los fallos tienen una espera de 5 minutos. La última respuesta correcta se conserva en `.cache/instagram.json`; despliegues con disco efímero usarán la memoria de esa instancia.

Las credenciales sólo se usan en el servidor con cabecera Authorization. El endpoint no devuelve tokens ni errores originales de Meta. Cuando la API omite una imagen, la tarjeta conserva el enlace al post. Los comentarios de cuentas ajenas se enlazan a Instagram; no se inventan ni se publican comentarios en nombre del visitante.

Documentación: [Instagram API de Meta](https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api) y [Business Discovery](https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/business-discovery/).

## Contenido y límites

La selección inicial de Instagram se comprobó en el perfil público el **18 de septiembre de 2026**. Su estado y fecha son visibles. Biografía y trayectoria resumen los principales hitos; no son una agenda en tiempo real. El anuncio cinematográfico está contrastado con [Co-LaVo](https://co-lavo.co.jp/en/artist/takeru_satoh/).

Los videos se enlazan a los canales originales TWICE, TWICE Japan y 117. YouTube puede restringir la reproducción incrustada; el modal incluye un enlace directo al original. Durante la prueba en este navegador, la entrevista de G-DRAGON no permitió reproducción incrustada, aunque el video y el canal se verificaron mediante YouTube oEmbed.

Créditos fotográficos: `public/images/credits.json` y `/creditos`. Se conservan marcas de agua. Algunas fotografías tienen CC BY y otras son editoriales sin licencia abierta declarada; los derechos siguen perteneciendo a sus autores. Fuentes: TWICE/JYP, TWICE Japan, canales de YouTube oficiales y páginas enlazadas en los créditos. Fuentes tipográficas y sus licencias OFL: `public/fonts`.

## Desarrollo y validación

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
```

Las pruebas cubren orden, duplicados, URLs no válidas, datos sin imágenes, ausencia de credenciales, concurrencia, caché, publicaciones nuevas y recuperación frente a errores. La integración con Meta necesita validarse con credenciales reales del administrador.

Archivos principales: `src/components/Experience.tsx`, `src/app/globals.css`, `src/data/sana.ts`, `src/lib/instagram-model.ts` y `src/app/api/instagram/route.ts`.

Para publicar, usa un host compatible con Next.js y Node, configura las mismas variables de entorno y `SITE_URL` con tu dominio. No exportar como HTML estático: la actualización de Instagram necesita la ruta de servidor. Esta entrega se ejecuta localmente y no modifica el sitio MK1 publicado.
